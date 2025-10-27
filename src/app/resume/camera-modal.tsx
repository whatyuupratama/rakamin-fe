'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
interface CameraCapturModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

type HandPose = 'one' | 'two' | 'three' | 'none';
type PoseStep = 1 | 2 | 3;

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
}: CameraCapturModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState<PoseStep>(1);
  const [detectedPose, setDetectedPose] = useState<HandPose>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [correctPoseHeldFrames, setCorrectPoseHeldFrames] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);
  const [postCaptureTimer, setPostCaptureTimer] = useState<number | null>(null);
  const [showCaptureControls, setShowCaptureControls] = useState(true);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const postCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const poseSequence: HandPose[] = ['one', 'two', 'three'];

  const poseDescriptions: Record<PoseStep, string> = {
    1: 'Show 1 Finger',
    2: 'Show 2 Fingers (Peace)',
    3: 'Show 3 Fingers',
  };

  useEffect(() => {
    if (correctPoseHeldFrames >= 10 && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as PoseStep);
      setCorrectPoseHeldFrames(0);
    } else if (correctPoseHeldFrames >= 10 && currentStep === 3) {
      // Start 3-second countdown after all steps complete
      setCountdownTimer(3);
      setCorrectPoseHeldFrames(0);
    }
  }, [correctPoseHeldFrames, currentStep]);

  useEffect(() => {
    if (countdownTimer === null) return;

    if (countdownTimer <= 0) {
      // Auto-capture when countdown reaches 0
      if (canvasRef.current) {
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
      setCountdownTimer(null);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdownTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [countdownTimer]);

  // After a photo is captured, hide the retake/confirm controls for 6 seconds
  useEffect(() => {
    if (!capturedImage) {
      // ensure no lingering post-capture timer
      if (postCaptureIntervalRef.current) {
        clearInterval(postCaptureIntervalRef.current);
        postCaptureIntervalRef.current = null;
      }
      setPostCaptureTimer(null);
      setShowCaptureControls(true);
      return;
    }

    // When a new image is captured, start a 6-second timer before showing controls
    setShowCaptureControls(false);
    setPostCaptureTimer(6);

    postCaptureIntervalRef.current = setInterval(() => {
      setPostCaptureTimer((prev) => {
        if (!prev || prev <= 1) {
          // show controls and clear timer
          setShowCaptureControls(true);
          if (postCaptureIntervalRef.current) {
            clearInterval(postCaptureIntervalRef.current);
            postCaptureIntervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (postCaptureIntervalRef.current) {
        clearInterval(postCaptureIntervalRef.current);
        postCaptureIntervalRef.current = null;
      }
    };
  }, [capturedImage]);

  useEffect(() => {
    if (!isOpen || capturedImage) return;

    // Run the camera for only 3 seconds, then start the 3-2-1 countdown
    setTimeRemaining(3);
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Stop the runtime timer and start the visible countdown
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setCountdownTimer(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, capturedImage]);

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

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isOpen]);

  const startSimplePoseDetection = () => {
    detectionIntervalRef.current = setInterval(() => {
      if (!capturedImage && countdownTimer === null) {
        // Do not auto-increment pose frames — we use a fixed 3s camera runtime

        // Draw camera feed to canvas for capture
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
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentStep(1);
    setCorrectPoseHeldFrames(0);
    setCountdownTimer(null);
    setTimeRemaining(3);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
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

        {/* Content */}
        <div className='p-6'>
          {!capturedImage ? (
            <div className='space-y-4'>
              {/* Camera Feed */}
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

                {/* Step and Timer Indicator */}

                {/* Status Indicator */}

                {/* Progress Bar */}
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-300'>
                  <div
                    className='h-full bg-green-500 transition-all duration-100'
                    style={{ width: `${(correctPoseHeldFrames / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Instructions */}

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
              {/* Captured Image */}
              <div className='bg-gray-100 rounded-lg overflow-hidden aspect-video'>
                <img
                  src={capturedImage || '/placeholder.svg'}
                  alt='Captured'
                  className='w-full h-full object-cover'
                />
              </div>

              {/* Buttons */}
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
