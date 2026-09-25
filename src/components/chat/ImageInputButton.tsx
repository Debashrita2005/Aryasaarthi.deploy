'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Check, Loader2, Sparkles } from 'lucide-react';

interface ImageInputButtonProps {
  onImageSelected: (base64Data: string, caption?: string, isHandwritten?: boolean) => void;
  disabled?: boolean;
  language?: string;
}

/**
 * Compresses an image file on the client using HTML Canvas before upload.
 * Reduces dimension to max 1280px and outputs high-efficiency JPEG (~150-300KB).
 */
export async function compressImageFile(file: File, maxDimension: number = 1280, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw and compress to JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ImageInputButton({
  onImageSelected,
  disabled = false,
  language = 'en',
}: ImageInputButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [caption, setCaption] = useState('');
  const [isHandwritten, setIsHandwritten] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowOptions(false);
    setIsCompressing(true);
    try {
      const compressedB64 = await compressImageFile(file);
      setPreviewImage(compressedB64);
    } catch (err) {
      console.error('Error compressing image:', err);
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be chosen again if needed
      e.target.value = '';
    }
  };

  const handleConfirmSend = () => {
    if (!previewImage) return;
    onImageSelected(previewImage, caption, isHandwritten);
    setPreviewImage(null);
    setCaption('');
    setIsHandwritten(false);
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setCaption('');
    setIsHandwritten(false);
  };

  return (
    <>
      {/* Hidden File Inputs */}
      {/* 1. Camera live capture for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2. Standard Gallery / File Picker */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action Button & Popover */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled || isCompressing}
          onClick={() => setShowOptions((prev) => !prev)}
          title={language === 'hi' ? 'दस्तावेज़ या फ़ोटो अपलोड करें' : 'Upload photo or document'}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          {isCompressing ? <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> : <Camera className="w-4 h-4" />}
        </button>

        {/* Option Menu */}
        {showOptions && (
          <div className="absolute bottom-12 left-0 z-50 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 animate-fade-in flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setShowOptions(false);
                cameraInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-brand-950/60 hover:text-brand-300 rounded-lg transition-colors text-left"
            >
              <Camera className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === 'hi' ? 'फ़ोटो खींचें (कैमरा)' : 'Take Photo (Camera)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOptions(false);
                galleryInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-brand-950/60 hover:text-brand-300 rounded-lg transition-colors text-left"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'hi' ? 'गैलरी से चुनें' : 'Choose from Gallery'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Image Preview & Confirmation Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold text-white">
                  {language === 'hi' ? 'छवि पूर्वावलोकन एवं पुष्टि' : 'Image Preview & Confirmation'}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-64 flex items-center justify-center mb-3">
              <img
                src={previewImage}
                alt="Captured Document"
                className="object-contain w-full max-h-60 rounded-lg"
              />
            </div>

            {/* Handwritten Mode Toggle & Honest Constraint Notice */}
            <div className="mb-3 p-2 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={isHandwritten}
                  onChange={(e) => setIsHandwritten(e.target.checked)}
                  className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 w-4 h-4"
                />
                <span>{language === 'hi' ? 'हस्तलिखित नोट है? (Handwritten)' : 'This is a handwritten note'}</span>
              </label>
              {isHandwritten && (
                <p className="text-[10px] text-slate-400 leading-tight">
                  {language === 'hi'
                    ? 'ℹ️ Microsoft TrOCR द्वारा संचालित। अंग्रेज़ी लिखावट के लिए सटीक; भारतीय लिपियों के लिए सर्वश्रेष्ठ प्रयास।'
                    : 'ℹ️ Powered by Microsoft TrOCR. High accuracy on English handwriting; Indic handwriting is best-effort.'}
                </p>
              )}
            </div>

            {/* Optional Caption Input */}
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'अतिरिक्त विवरण (वैकल्पिक)...'
                  : 'Optional note / query about this document...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 mb-3 focus:outline-none focus:border-brand-500"
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
              >
                {language === 'hi' ? 'रद्द करें' : 'Retake / Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmSend}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुष्टि करें एवं भेजें' : 'Confirm & Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
