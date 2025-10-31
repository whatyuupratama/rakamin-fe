'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
interface CameraCapturModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
}: CameraCapturModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const startDelayRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (countdownTimer === null) return;

    if (countdownTimer <= 0) {
      if (canvasRef.current) {
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
      setCountdownTimer(null);
      return;
    }

    if (countdownIntervalRef.current) {
      window.clearTimeout(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    countdownIntervalRef.current = window.setTimeout(() => {
      setCountdownTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        window.clearTimeout(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdownTimer]);

  const startSimplePoseDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    detectionIntervalRef.current = window.setInterval(() => {
      if (!capturedImage && countdownTimer === null) {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
          }
        }
      }
    }, 100);
  }, [capturedImage, countdownTimer]);

  useEffect(() => {
    if (!isOpen || capturedImage) return;

    if (startDelayRef.current) {
      window.clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
    }

    startDelayRef.current = window.setTimeout(() => {
      setCountdownTimer(3);
    }, 3000);

    return () => {
      if (startDelayRef.current) {
        window.clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }
    };
  }, [capturedImage, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setIsLoading(false);
              startSimplePoseDetection();
            };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsLoading(false);
      }
    };

    initializeCamera();

    const videoElement = videoRef.current;

    return () => {
      if (videoElement?.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (startDelayRef.current) {
        window.clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }
    };
  }, [capturedImage, isOpen, startSimplePoseDetection]);

  const handleRetake = () => {
    setCapturedImage(null);
    setCountdownTimer(null);
    startSimplePoseDetection();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex flex-col'>
            <h2 className='text-xl font-semibold'>
              Raise Your Hand to Capture
            </h2>
            <p className='text-sm text-muted-foreground mt-1'>
              We’ll take the photo once your hand pose is detected.
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6'>
          {!capturedImage ? (
            <div className='space-y-4'>
              <div className='relative bg-black rounded-lg overflow-hidden aspect-video'>
                {isLoading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black'>
                    <div className='text-white'>Loading camera...</div>
                  </div>
                )}
                <video ref={videoRef} className='w-full h-full object-cover' />
                <canvas
                  ref={canvasRef}
                  className='absolute inset-0 w-full h-full'
                />

                {countdownTimer !== null && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                    <div className='text-6xl font-bold text-white'>
                      {countdownTimer}
                    </div>
                  </div>
                )}
              </div>

              <div className=''>
                <p className='text-sm text-black'>
                  The camera will run for 3 seconds, then a 3-2-1 countdown will
                  appear before the photo is taken automatically.
                </p>
              </div>
              <div className='flex justify-center'>
                {' '}
                <Image
                  src='/Container.png'
                  alt='fiinger'
                  width={250}
                  height={250}
                />
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='bg-gray-100 rounded-lg overflow-hidden aspect-video'>
                <Image
                  src={capturedImage || '/placeholder.svg'}
                  alt='Captured'
                  width={640}
                  height={480}
                  className='h-full w-full object-cover'
                  unoptimized
                />
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={handleRetake}
                  variant='outline'
                  className='flex-1 bg-transparent'
                >
                  Retake photo
                </Button>
                <Button
                  onClick={handleConfirm}
                  className='flex-1 bg-teal-600 hover:bg-teal-700'
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
