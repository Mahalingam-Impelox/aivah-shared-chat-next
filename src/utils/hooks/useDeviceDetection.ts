import { useState, useEffect, useCallback } from 'react';

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isLowEndDevice: boolean;
  supportsWebGL: boolean;
  supportsWebGL2: boolean;
  devicePixelRatio: number;
  maxTextureSize: number;
  gpu: string;
  cores: number;
  memory: number;
  connection: string;
  bandwidth: 'slow' | 'medium' | 'fast';
}

interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isLargeScreen: boolean;
  isMediumScreen: boolean;
  isSmallScreen: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  isThrottled: boolean;
  batteryLevel: number;
  isLowBattery: boolean;
  networkSpeed: number;
  renderTime: number;
}

interface DeviceInfo {
  capabilities: DeviceCapabilities;
  viewport: ViewportInfo;
  performance: PerformanceMetrics;
  recommendedSettings: {
    enableShadows: boolean;
    enableReflections: boolean;
    enableParticles: boolean;
    maxParticles: number;
    textureQuality: 'low' | 'medium' | 'high';
    animationQuality: 'low' | 'medium' | 'high';
    audioQuality: 'low' | 'medium' | 'high';
    enablePostProcessing: boolean;
    targetFPS: number;
  };
}

const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    capabilities: {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isLowEndDevice: false,
      supportsWebGL: false,
      supportsWebGL2: false,
      devicePixelRatio: 1,
      maxTextureSize: 512,
      gpu: 'unknown',
      cores: 4,
      memory: 4,
      connection: 'unknown',
      bandwidth: 'medium'
    },
    viewport: {
      width: 1920,
      height: 1080,
      orientation: 'landscape',
      isLargeScreen: true,
      isMediumScreen: false,
      isSmallScreen: false,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    performance: {
      fps: 60,
      memoryUsage: 0,
      isThrottled: false,
      batteryLevel: 1,
      isLowBattery: false,
      networkSpeed: 0,
      renderTime: 16
    },
    recommendedSettings: {
      enableShadows: true,
      enableReflections: true,
      enableParticles: true,
      maxParticles: 1000,
      textureQuality: 'high',
      animationQuality: 'high',
      audioQuality: 'high',
      enablePostProcessing: true,
      targetFPS: 60
    }
  });

  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [lastFrameTime, setLastFrameTime] = useState<number>(0);

  // Enhanced mobile detection using multiple signals
  const detectDevice = useCallback((): DeviceCapabilities => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // More precise mobile detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
    const tabletRegex = /ipad|tablet|playbook|silk/i;
    const isMobile = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
    const isTablet = tabletRegex.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // WebGL detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const supportsWebGL = !!gl;
    const supportsWebGL2 = !!gl2;

    let maxTextureSize = 512;
    let gpu = 'unknown';
    
    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    // Hardware detection
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    // Network detection
    const connection = (navigator as any).connection || {};
    const connectionType = connection.effectiveType || 'unknown';
    const bandwidth = connectionType === '4g' ? 'fast' : 
                     connectionType === '3g' ? 'medium' : 'slow';

    // Low-end device detection
    const isLowEndDevice = 
      memory < 2 || 
      cores < 4 || 
      maxTextureSize < 2048 || 
      gpu.toLowerCase().includes('adreno 3') ||
      gpu.toLowerCase().includes('mali-4') ||
      devicePixelRatio < 1.5;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      isLowEndDevice,
      supportsWebGL,
      supportsWebGL2,
      devicePixelRatio,
      maxTextureSize,
      gpu,
      cores,
      memory,
      connection: connectionType,
      bandwidth
    };
  }, []);

  // Viewport detection with safe area support
  const detectViewport = useCallback((): ViewportInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Enhanced breakpoints
    const isSmallScreen = width < 768;
    const isMediumScreen = width >= 768 && width < 1200;
    const isLargeScreen = width >= 1200;

    // Safe area detection for mobile devices
    const safeAreaInsets = {
      top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
      bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
      left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0'),
      right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0')
    };

    return {
      width,
      height,
      orientation,
      isLargeScreen,
      isMediumScreen,
      isSmallScreen,
      safeAreaInsets
    };
  }, []);

  // Performance monitoring
  const monitorPerformance = useCallback((): PerformanceMetrics => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
    
    // Update FPS history
    setFpsHistory(prev => {
      const newHistory = [...prev, fps].slice(-60); // Keep last 60 frames
      return newHistory;
    });

    const avgFPS = fpsHistory.length > 0 ? 
      fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length : 60;

    // Memory usage (if available)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Battery API (if available)
    const battery = (navigator as any).getBattery?.();
    let batteryLevel = 1;
    let isLowBattery = false;
    
    if (battery) {
      batteryLevel = battery.level || 1;
      isLowBattery = batteryLevel < 0.2;
    }

    // Network speed detection
    const connection = (navigator as any).connection || {};
    const networkSpeed = connection.downlink || 0;

    const isThrottled = avgFPS < 45 || memoryUsage > 50 * 1024 * 1024; // 50MB threshold

    setLastFrameTime(now);

    return {
      fps: avgFPS,
      memoryUsage,
      isThrottled,
      batteryLevel,
      isLowBattery,
      networkSpeed,
      renderTime: deltaTime
    };
  }, [fpsHistory, lastFrameTime]);

  // Generate recommended settings based on device capabilities
  const generateRecommendedSettings = useCallback((capabilities: DeviceCapabilities, performance: PerformanceMetrics) => {
    const { isMobile, isLowEndDevice, supportsWebGL2, maxTextureSize, memory, cores } = capabilities;
    const { fps, isThrottled, isLowBattery } = performance;

    // Base settings for mobile
    if (isMobile || isLowEndDevice) {
      return {
        enableShadows: !isLowEndDevice && supportsWebGL2,
        enableReflections: false,
        enableParticles: !isLowEndDevice,
        maxParticles: isLowEndDevice ? 100 : 300,
        textureQuality: isLowEndDevice ? 'low' as const : 'medium' as const,
        animationQuality: isLowEndDevice ? 'low' as const : 'medium' as const,
        audioQuality: isLowBattery ? 'low' as const : 'medium' as const,
        enablePostProcessing: false,
        targetFPS: isLowEndDevice ? 30 : 45
      };
    }

    // Desktop settings with performance adjustment
    const baseSettings = {
      enableShadows: true,
      enableReflections: true,
      enableParticles: true,
      maxParticles: 1000,
      textureQuality: 'high' as const,
      animationQuality: 'high' as const,
      audioQuality: 'high' as const,
      enablePostProcessing: true,
      targetFPS: 60
    };

    // Adjust based on performance
    if (isThrottled || fps < 45) {
      return {
        ...baseSettings,
        enableReflections: false,
        maxParticles: 500,
        textureQuality: 'medium' as const,
        enablePostProcessing: false,
        targetFPS: 45
      };
    }

    return baseSettings;
  }, []);

  // Update device info
  const updateDeviceInfo = useCallback(() => {
    const capabilities = detectDevice();
    const viewport = detectViewport();
    const performance = monitorPerformance();
    const recommendedSettings = generateRecommendedSettings(capabilities, performance);

    setDeviceInfo({
      capabilities,
      viewport,
      performance,
      recommendedSettings
    });
  }, [detectDevice, detectViewport, monitorPerformance, generateRecommendedSettings]);

  // Initialize and set up event listeners
  useEffect(() => {
    updateDeviceInfo();

    // Set up CSS custom properties for safe area
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    }

    // Event listeners
    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100); // Small delay for orientation change
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Performance monitoring interval
    const performanceInterval = setInterval(updateDeviceInfo, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearInterval(performanceInterval);
    };
  }, [updateDeviceInfo]);

  return deviceInfo;
};

export default useDeviceDetection; 