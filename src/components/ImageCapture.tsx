import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageCaptureProps {
  onImageCaptured: (base64: string) => void;
  isAnalyzing: boolean;
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({ onImageCaptured, isAnalyzing }) => {
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMode('camera');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        setPreviewUrl(base64);
        setMode('preview');
        stopCamera();
        onImageCaptured(base64);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setMode('preview');
        onImageCaptured(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    stopCamera();
    setPreviewUrl(null);
    setMode('idle');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={cn(
        "relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300",
        mode === 'idle' ? "border-stone-300 bg-stone-100" : "border-brand-500 bg-black"
      )}>
        {mode === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex gap-4">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all group"
              >
                <div className="p-3 rounded-full bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Camera size={32} />
                </div>
                <span className="font-medium">Take Photo</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all group"
              >
                <div className="p-3 rounded-full bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Upload size={32} />
                </div>
                <span className="font-medium">Upload Image</span>
              </button>
            </div>
            <p className="text-stone-500 text-sm max-w-xs">
              Take a clear photo of the affected crop area for the best results.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {mode === 'camera' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-brand-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-brand-500" />
              </button>
              <button
                onClick={reset}
                className="absolute right-6 bottom-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </>
        )}

        {mode === 'preview' && previewUrl && (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                <RefreshCw size={48} className="animate-spin text-brand-400" />
                <p className="font-medium text-lg">Analyzing Crop Health...</p>
              </div>
            )}
            {!isAnalyzing && (
              <button
                onClick={reset}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
