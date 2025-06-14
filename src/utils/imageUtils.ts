
export interface ImageCaptureResult {
  success: boolean;
  image?: string;
  error?: string;
}

export const captureImageFromWebcam = (): ImageCaptureResult => {
  try {
    console.log('=== STARTING SAFE IMAGE CAPTURE ===');
    
    const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement || 
                        document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      return { success: false, error: 'No video element found' };
    }

    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return { success: false, error: 'Video not ready - invalid dimensions' };
    }

    if (videoElement.readyState < 2) {
      return { success: false, error: 'Video not ready - insufficient ready state' };
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      return { success: false, error: 'Canvas context not available' };
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
    
    console.log('=== IMAGE CAPTURED SUCCESSFULLY ===');
    console.log('Image size:', dataURL.length, 'bytes');
    
    return { success: true, image: dataURL };
  } catch (error) {
    console.error('=== IMAGE CAPTURE ERROR ===', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const isWebcamAvailable = (): boolean => {
  try {
    console.log('=== CHECKING WEBCAM AVAILABILITY ===');
    
    const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement || 
                        document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      console.log('No video element found');
      return false;
    }

    const isReady = videoElement.videoWidth > 0 && 
                   videoElement.videoHeight > 0 && 
                   videoElement.readyState >= 2 && 
                   !videoElement.paused &&
                   !!videoElement.srcObject;

    console.log('=== WEBCAM AVAILABILITY CHECK ===');
    console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
    console.log('Ready state:', videoElement.readyState);
    console.log('Paused:', videoElement.paused);
    console.log('Has stream:', !!videoElement.srcObject);
    console.log('Is available:', isReady);

    return isReady;
  } catch (error) {
    console.error('Error checking webcam availability:', error);
    return false;
  }
};
