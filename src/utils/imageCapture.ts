
/**
 * Utility for capturing photos from webcam
 * Centralized logic to avoid duplication
 */
export const capturePhotoFromWebcam = (): string | null => {
  try {
    // Try to find the video element more specifically
    const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement || 
                        document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      console.warn('No video element found');
      return null;
    }

    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('Video element not ready for capture - dimensions:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
      return null;
    }

    if (videoElement.readyState < 2) {
      console.warn('Video element not ready - readyState:', videoElement.readyState);
      return null;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Canvas context not available');
      return null;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Photo captured successfully, dimensions:', canvas.width, 'x', canvas.height);
    return dataURL;
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
};

/**
 * Validate if webcam is ready for capture
 */
export const isWebcamReady = (): boolean => {
  const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement || 
                      document.querySelector('video') as HTMLVideoElement;
  
  return !!(videoElement && 
            videoElement.videoWidth > 0 && 
            videoElement.videoHeight > 0 && 
            videoElement.readyState >= 2);
};
