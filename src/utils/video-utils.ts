/**
 * Video utilities for mobile-optimized video handling
 */

export interface VideoSettings {
  quality: 'low' | 'medium' | 'high';
  preload: 'none' | 'metadata' | 'auto';
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  playsInline: boolean;
}

/**
 * Get optimal video settings based on device capabilities
 */
export const getOptimalVideoSettings = (): VideoSettings => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  const isLowEndDevice = () => {
    // Check for low-end device indicators
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const connection = (navigator as any).connection;
    
    return (
      memory && memory <= 2 ||
      cores && cores <= 2 ||
      connection && connection.effectiveType === 'slow-2g' ||
      connection && connection.effectiveType === '2g'
    );
  };

  if (isMobile || isLowEndDevice()) {
    return {
      quality: 'low',
      preload: 'metadata',
      autoplay: true,
      muted: true,
      loop: true,
      playsInline: true
    };
  }

  return {
    quality: 'high',
    preload: 'auto',
    autoplay: true,
    muted: true,
    loop: true,
    playsInline: true
  };
};

/**
 * Check if video file exists
 */
export const checkVideoExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get fallback video URL based on device capabilities
 */
export const getFallbackVideoUrl = (originalUrl?: string): string => {
  const settings = getOptimalVideoSettings();
  
  // If original URL is provided and it's high quality, return it
  if (originalUrl && settings.quality === 'high') {
    return originalUrl;
  }
  
  // Default fallback videos based on quality
  const fallbacks = {
    low: '/textures/background_videowall_mobile.mp4',
    medium: '/textures/background_videowall.mp4',
    high: '/textures/background_videowall_hd.mp4'
  };
  
  return originalUrl || fallbacks[settings.quality] || fallbacks.medium;
};

/**
 * Create optimized video element
 */
export const createOptimizedVideoElement = (src: string): HTMLVideoElement => {
  const video = document.createElement('video');
  const settings = getOptimalVideoSettings();
  
  video.src = src;
  video.autoplay = settings.autoplay;
  video.muted = settings.muted;
  video.loop = settings.loop;
  video.playsInline = settings.playsInline;
  video.preload = settings.preload;
  video.crossOrigin = 'anonymous';
  
  // Additional mobile optimizations
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    video.setAttribute('webkit-playsinline', 'true');
  }
  
  return video;
}; 