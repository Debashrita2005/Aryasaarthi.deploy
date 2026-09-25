import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${file.type || 'unknown'}). Please upload an image (PNG, JPG, WEBP, GIF) or PDF document.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit of 15MB.`,
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawName = file.name || 'document';
    const sanitizedName = rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `doc_${Date.now()}_${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Fast Non-blocking OCR Processing for Images
    let extractedText = '';
    let ocrConfidence = 0;
    let isLowConfidence = false;

    const isImageForOCR = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (isImageForOCR) {
      try {
        // Strategy 1: High-Speed In-Memory FastAPI OCR (already warmed up on port 8000)
        let ocrCompleted = false;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);

          const ocrFormData = new FormData();
          const fileBlob = new Blob([buffer], { type: file.type });
          ocrFormData.append('file', fileBlob, filename);

          const pythonUrl = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';
          const fastApiRes = await fetch(`${pythonUrl}/api/ocr/extract`, {
            method: 'POST',
            body: ocrFormData,
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (fastApiRes.ok) {
            const data = await fastApiRes.json();
            if (data && data.success) {
              extractedText = (data.text || '').trim();
              ocrConfidence = Math.round(data.confidence || 0);
              isLowConfidence = Boolean(data.is_low_confidence);
              ocrCompleted = true;
            }
          }
        } catch (_fastApiErr) {
          // Fall back to CLI bridge
        }

        // Strategy 2: Fast CLI Bridge via local backend venv
        if (!ocrCompleted) {
          const { execFile } = await import('child_process');
          const pyBin = path.join(process.cwd(), 'backend', 'venv', 'bin', 'python');
          const scriptPath = path.join(process.cwd(), 'scripts', 'ocr_extract.py');

          await new Promise<void>((resolve) => {
            execFile(pyBin, [scriptPath, filePath], { timeout: 4000 }, (err, stdout) => {
              if (!err && stdout) {
                try {
                  const match = stdout.match(/\{[\s\S]*\}/);
                  if (match) {
                    const data = JSON.parse(match[0]);
                    extractedText = (data.text || '').trim();
                    ocrConfidence = Math.round(data.confidence || 0);
                    isLowConfidence = Boolean(data.is_low_confidence);
                  }
                } catch {}
              }
              resolve();
            });
          });
        }
      } catch (ocrErr: any) {
        console.warn('OCR non-fatal warning:', ocrErr?.message || ocrErr);
        isLowConfidence = true;
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        name: rawName,
        size: file.size,
        type: file.type,
        extractedText: extractedText || undefined,
        ocrConfidence: isImageForOCR ? ocrConfidence : undefined,
        isLowConfidence: isImageForOCR ? isLowConfidence : undefined,
      },
    });
  } catch (err: any) {
    console.error('Chatbot File Upload Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
