
/**
 * Enhanced utility for capturing photos from webcam with detailed debugging
 */
export const capturePhotoFromWebcam = (): string | null => {
  try {
    console.log('=== STARTING PHOTO CAPTURE PROCESS ===');
    
    // Try multiple selectors to find video element
    const videoSelectors = [
      'video[autoplay]',
      'video[data-webcam="true"]', 
      'video',
      '.webcam-video',
      '#webcam-video'
    ];
    
    let videoElement: HTMLVideoElement | null = null;
    
    for (const selector of videoSelectors) {
      const foundElement = document.querySelector(selector) as HTMLVideoElement;
      if (foundElement) {
        videoElement = foundElement;
        console.log('=== VIDEO ELEMENT FOUND ===');
        console.log('Selector used:', selector);
        console.log('Video element:', foundElement);
        break;
      }
    }
    
    if (!videoElement) {
      console.error('=== NO VIDEO ELEMENT FOUND ===');
      console.log('Available video elements:', document.querySelectorAll('video').length);
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video, index) => {
        console.log(`Video ${index}:`, video);
      });
      return null;
    }

    console.log('=== VIDEO ELEMENT STATUS ===');
    console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
    console.log('Ready state:', videoElement.readyState);
    console.log('Current time:', videoElement.currentTime);
    console.log('Paused:', videoElement.paused);
    console.log('Source object:', videoElement.srcObject);

    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.error('=== VIDEO NOT READY - INVALID DIMENSIONS ===');
      console.log('Video may not be loaded yet or stream not active');
      return null;
    }

    if (videoElement.readyState < 2) {
      console.error('=== VIDEO NOT READY - INSUFFICIENT READY STATE ===');
      console.log('ReadyState meanings: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA');
      return null;
    }

    console.log('=== CREATING CANVAS FOR CAPTURE ===');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('=== CANVAS CONTEXT NOT AVAILABLE ===');
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    console.log('=== DRAWING VIDEO TO CANVAS ===');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Draw the video frame to canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 with good quality
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
    
    console.log('=== PHOTO CAPTURED SUCCESSFULLY ===');
    console.log('Image data URL length:', dataURL.length);
    console.log('Image format preview:', dataURL.substring(0, 50) + '...');
    
    return dataURL;
  } catch (error) {
    console.error('=== PHOTO CAPTURE ERROR ===');
    console.error('Error details:', error);
    return null;
  }
};

/**
 * Enhanced validation for webcam readiness
 */
export const isWebcamReady = (): boolean => {
  try {
    console.log('=== CHECKING WEBCAM READINESS ===');
    
    const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement || 
                        document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      console.log('=== WEBCAM CHECK: NO VIDEO ELEMENT FOUND ===');
      return false;
    }

    const hasValidDimensions = videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
    const hasGoodReadyState = videoElement.readyState >= 2;
    const isNotPaused = !videoElement.paused;
    const hasStream = !!videoElement.srcObject;

    const isReady = hasValidDimensions && hasGoodReadyState && isNotPaused && hasStream;

    console.log('=== WEBCAM READINESS RESULT ===');
    console.log('Is ready:', isReady);
    console.log('Has valid dimensions:', hasValidDimensions, `(${videoElement.videoWidth}x${videoElement.videoHeight})`);
    console.log('Has good ready state:', hasGoodReadyState, `(${videoElement.readyState})`);
    console.log('Is not paused:', isNotPaused);
    console.log('Has stream:', hasStream);

    return isReady;
  } catch (error) {
    console.error('=== WEBCAM READINESS CHECK ERROR ===');
    console.error('Error details:', error);
    return false;
  }
};

/**
 * Debug function to log current webcam status
 */
export const debugWebcamStatus = (): void => {
  console.log('=== WEBCAM DEBUG STATUS ===');
  const videos = document.querySelectorAll('video');
  console.log('Total video elements found:', videos.length);
  
  videos.forEach((video, index) => {
    const videoEl = video as HTMLVideoElement;
    console.log(`Video ${index + 1}:`, {
      autoplay: videoEl.autoplay,
      width: videoEl.videoWidth,
      height: videoEl.videoHeight,
      readyState: videoEl.readyState,
      paused: videoEl.paused,
      currentTime: videoEl.currentTime,
      src: videoEl.src || 'stream',
      srcObject: !!videoEl.srcObject,
      className: videoEl.className,
      id: videoEl.id
    });
  });
};
