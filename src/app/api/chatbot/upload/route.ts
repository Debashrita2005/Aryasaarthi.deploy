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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

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

    if (!ALLOWED_TYPES.includes(file.type)) {
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
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit of 10MB.`,
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

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        name: rawName,
        size: file.size,
        type: file.type,
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
