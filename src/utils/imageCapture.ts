
/**
 * Utility for capturing photos from webcam
 * Centralized logic to avoid duplication
 */
export const capturePhotoFromWebcam = (): string | null => {
  try {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('Video element not ready for capture');
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
    console.log('Photo captured successfully');
    return dataURL;
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
};
