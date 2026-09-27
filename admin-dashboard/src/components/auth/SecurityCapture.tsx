import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface SecurityCaptureProps {
  userId: string;
  onComplete: (data: { latitude: number | null; longitude: number | null; photo_url: string | null }) => void;
  onError: (error: string) => void;
}

export function SecurityCapture({ userId, onComplete, onError }: SecurityCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'permission' | 'capture' | 'uploading' | 'done'>('permission');

  const requestPermissions = async () => {
    try {
      // 1. Get Location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => {
            console.warn('Geolocation denied or failed:', err);
            // We might still proceed without location or require it strictly.
            // Let's just log warning.
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      // 2. Get Camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('capture');
    } catch (err: any) {
      console.error(err);
      onError('Camera or Location permission denied. These are required for security purposes.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setStep('uploading');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const MAX_WIDTH = 480;
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (width > MAX_WIDTH) {
      height = Math.round(height * (MAX_WIDTH / width));
      width = MAX_WIDTH;
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to save DB space
      setPhoto(dataUrl);

      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setStep('done');
      onComplete({
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        photo_url: dataUrl
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800">Security Check</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          As part of our security policy, we require a live photo and your current location to authorize this login session.
        </p>
      </div>

      {step === 'permission' && (
        <button
          onClick={requestPermissions}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2 transition-colors"
        >
          <Camera size={20} />
          Grant Permissions & Continue
        </button>
      )}

      {(step === 'capture' || step === 'uploading') && (
        <div className="w-full max-w-sm space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {location && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                <MapPin size={12} /> Location Verified
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <button
            onClick={capturePhoto}
            disabled={loading || step === 'uploading'}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera size={20} />
                Capture & Login
              </>
            )}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center text-green-600 space-y-2 py-8">
          <CheckCircle2 size={48} className="animate-bounce" />
          <p className="font-semibold text-lg">Verification Complete</p>
          <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}
