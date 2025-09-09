import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface GestureEvent {
  type: 'tap' | 'doubletap' | 'swipe' | 'pinch' | 'rotate' | 'pan' | 'press';
  startPoint: TouchPoint;
  currentPoint: TouchPoint;
  endPoint?: TouchPoint;
  delta: { x: number; y: number };
  distance: number;
  angle: number;
  velocity: { x: number; y: number };
  scale?: number;
  rotation?: number;
  duration: number;
  prevented: boolean;
  preventDefault: () => void;
}

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
  velocity: number;
}

interface PanGesture {
  delta: { x: number; y: number };
  velocity: { x: number; y: number };
  distance: number;
}

interface GestureConfig {
  // Tap configuration
  tapTimeout: number;
  tapThreshold: number;
  doubleTapTimeout: number;
  doubleTapThreshold: number;
  
  // Swipe configuration
  swipeThreshold: number;
  swipeVelocityThreshold: number;
  
  // Pan configuration
  panThreshold: number;
  
  // Pinch configuration
  pinchThreshold: number;
  
  // Press configuration
  pressTimeout: number;
  pressThreshold: number;
  
  // General configuration
  preventDefaultTouchEvents: boolean;
  enableMouseEvents: boolean;
  enableTouchEvents: boolean;
  debugMode: boolean;
}

interface GestureCallbacks {
  onTap?: (event: GestureEvent) => void;
  onDoubleTap?: (event: GestureEvent) => void;
  onSwipe?: (event: GestureEvent & { swipe: SwipeDirection }) => void;
  onPinch?: (event: GestureEvent & { pinch: PinchGesture }) => void;
  onRotate?: (event: GestureEvent) => void;
  onPan?: (event: GestureEvent & { pan: PanGesture }) => void;
  onPress?: (event: GestureEvent) => void;
  onTouchStart?: (event: GestureEvent) => void;
  onTouchMove?: (event: GestureEvent) => void;
  onTouchEnd?: (event: GestureEvent) => void;
}

const defaultConfig: GestureConfig = {
  tapTimeout: 300,
  tapThreshold: 10,
  doubleTapTimeout: 300,
  doubleTapThreshold: 30,
  swipeThreshold: 30,
  swipeVelocityThreshold: 0.5,
  panThreshold: 10,
  pinchThreshold: 10,
  pressTimeout: 500,
  pressThreshold: 10,
  preventDefaultTouchEvents: true,
  enableMouseEvents: true,
  enableTouchEvents: true,
  debugMode: false
};

const useTouchGestures = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks = {},
  config: Partial<GestureConfig> = {}
) => {
  const fullConfig = { ...defaultConfig, ...config };
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  
  // Touch state
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const gestureStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<{ point: TouchPoint; timestamp: number } | null>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gestureStateRef = useRef<{
    isGesturing: boolean;
    gestureType: string | null;
    initialDistance: number;
    initialAngle: number;
    initialScale: number;
    velocity: { x: number; y: number };
    lastMoveTime: number;
    lastMovePoint: TouchPoint | null;
  }>({
    isGesturing: false,
    gestureType: null,
    initialDistance: 0,
    initialAngle: 0,
    initialScale: 1,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0,
    lastMovePoint: null
  });

  // Utility functions
  const getTouchPoint = useCallback((touch: Touch): TouchPoint => {
    return {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }, []);

  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getAngle = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  const getVelocity = useCallback((point1: TouchPoint, point2: TouchPoint): { x: number; y: number } => {
    const dt = point2.timestamp - point1.timestamp;
    if (dt === 0) return { x: 0, y: 0 };
    
    return {
      x: (point2.x - point1.x) / dt,
      y: (point2.y - point1.y) / dt
    };
  }, []);

  const getSwipeDirection = useCallback((startPoint: TouchPoint, endPoint: TouchPoint): SwipeDirection => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = getDistance(startPoint, endPoint);
    const velocity = getVelocity(startPoint, endPoint);
    const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    let direction: 'left' | 'right' | 'up' | 'down';
    
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }
    
    return { direction, velocity: velocityMagnitude, distance };
  }, [getDistance, getVelocity]);

  const createGestureEvent = useCallback((
    type: GestureEvent['type'],
    startPoint: TouchPoint,
    currentPoint: TouchPoint,
    endPoint?: TouchPoint
  ): GestureEvent => {
    const delta = {
      x: currentPoint.x - startPoint.x,
      y: currentPoint.y - startPoint.y
    };
    
    const distance = getDistance(startPoint, currentPoint);
    const angle = getAngle(startPoint, currentPoint);
    const velocity = getVelocity(startPoint, currentPoint);
    const duration = currentPoint.timestamp - startPoint.timestamp;
    
    let prevented = false;
    const preventDefault = () => { prevented = true; };
    
    return {
      type,
      startPoint,
      currentPoint,
      endPoint,
      delta,
      distance,
      angle,
      velocity,
      duration,
      prevented,
      preventDefault
    };
  }, [getDistance, getAngle, getVelocity]);

  // Gesture detection functions
  const handleTap = useCallback((touchPoint: TouchPoint) => {
    if (!callbacks.onTap && !callbacks.onDoubleTap) return;
    
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (lastTap && 
        now - lastTap.timestamp < fullConfig.doubleTapTimeout &&
        getDistance(touchPoint, lastTap.point) < fullConfig.doubleTapThreshold) {
      // Double tap detected
      if (callbacks.onDoubleTap) {
        const event = createGestureEvent('doubletap', lastTap.point, touchPoint);
        callbacks.onDoubleTap(event);
      }
      lastTapRef.current = null;
    } else {
      // Single tap
      lastTapRef.current = { point: touchPoint, timestamp: now };
      
      setTimeout(() => {
        if (lastTapRef.current?.timestamp === now) {
          // Single tap confirmed
          if (callbacks.onTap) {
            const event = createGestureEvent('tap', touchPoint, touchPoint);
            callbacks.onTap(event);
          }
          lastTapRef.current = null;
        }
      }, fullConfig.doubleTapTimeout);
    }
  }, [callbacks, fullConfig.doubleTapTimeout, fullConfig.doubleTapThreshold, getDistance, createGestureEvent]);

  const handleSwipe = useCallback((startPoint: TouchPoint, endPoint: TouchPoint) => {
    if (!callbacks.onSwipe) return;
    
    const swipe = getSwipeDirection(startPoint, endPoint);
    
         if (swipe.distance > fullConfig.swipeThreshold && 
         swipe.velocity > fullConfig.swipeVelocityThreshold) {
       const event = createGestureEvent('swipe', startPoint, endPoint, endPoint);
       callbacks.onSwipe?.({ ...event, swipe });
     }
  }, [callbacks, fullConfig.swipeThreshold, fullConfig.swipeVelocityThreshold, getSwipeDirection, createGestureEvent]);

  const handlePinch = useCallback((touches: TouchPoint[]) => {
    if (!callbacks.onPinch || touches.length !== 2) return;
    
    const [touch1, touch2] = touches;
    const distance = getDistance(touch1, touch2);
    const center = {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2
    };
    
    const state = gestureStateRef.current;
    
    if (state.gestureType !== 'pinch') {
      state.initialDistance = distance;
      state.gestureType = 'pinch';
    }
    
    const scale = distance / state.initialDistance;
    const velocity = Math.abs(distance - state.initialDistance) / 
                     (touch1.timestamp - (state.lastMoveTime || touch1.timestamp));
    
    if (Math.abs(scale - 1) > fullConfig.pinchThreshold / 100) {
      const event = createGestureEvent('pinch', touch1, touch2);
             const pinch: PinchGesture = { scale, center, velocity };
       callbacks.onPinch?.({ ...event, pinch });
     }
   }, [callbacks, fullConfig.pinchThreshold, getDistance, createGestureEvent]);

  const handlePan = useCallback((startPoint: TouchPoint, currentPoint: TouchPoint) => {
    if (!callbacks.onPan) return;
    
    const distance = getDistance(startPoint, currentPoint);
    
    if (distance > fullConfig.panThreshold) {
      const velocity = getVelocity(startPoint, currentPoint);
      const delta = {
        x: currentPoint.x - startPoint.x,
        y: currentPoint.y - startPoint.y
      };
      
             const event = createGestureEvent('pan', startPoint, currentPoint);
       const pan: PanGesture = { delta, velocity, distance };
       callbacks.onPan?.({ ...event, pan });
     }
  }, [callbacks, fullConfig.panThreshold, getDistance, getVelocity, createGestureEvent]);

  const handlePress = useCallback((touchPoint: TouchPoint) => {
    if (!callbacks.onPress) return;
    
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    pressTimeoutRef.current = setTimeout(() => {
      const event = createGestureEvent('press', touchPoint, touchPoint);
      callbacks.onPress?.(event);
    }, fullConfig.pressTimeout);
  }, [callbacks, fullConfig.pressTimeout, createGestureEvent]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (fullConfig.preventDefaultTouchEvents) {
      event.preventDefault();
    }
    
    setIsActive(true);
    setCurrentGesture('start');
    
    // Clear any existing press timeout
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    // Store all touches
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const touchPoint = getTouchPoint(touch);
      touchesRef.current.set(touch.identifier, touchPoint);
    }
    
    // Get primary touch
    const primaryTouch = event.touches[0];
    const touchPoint = getTouchPoint(primaryTouch);
    
    gestureStartRef.current = touchPoint;
    gestureStateRef.current.isGesturing = true;
    gestureStateRef.current.lastMoveTime = touchPoint.timestamp;
    gestureStateRef.current.lastMovePoint = touchPoint;
    
    // Handle press gesture
    if (event.touches.length === 1) {
      handlePress(touchPoint);
    }
    
    // Callback
    if (callbacks.onTouchStart) {
      const gestureEvent = createGestureEvent('tap', touchPoint, touchPoint);
      callbacks.onTouchStart(gestureEvent);
    }
    
    if (fullConfig.debugMode) {
      console.log('Touch start:', touchPoint);
    }
  }, [fullConfig.preventDefaultTouchEvents, fullConfig.debugMode, getTouchPoint, handlePress, callbacks, createGestureEvent]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!gestureStartRef.current || !gestureStateRef.current.isGesturing) return;
    
    if (fullConfig.preventDefaultTouchEvents) {
      event.preventDefault();
    }
    
    setCurrentGesture('move');
    
    // Clear press timeout on move
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    
    // Update touch positions
    const touches: TouchPoint[] = [];
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const touchPoint = getTouchPoint(touch);
      touchesRef.current.set(touch.identifier, touchPoint);
      touches.push(touchPoint);
    }
    
    const primaryTouch = touches[0];
    const state = gestureStateRef.current;
    
    // Calculate velocity
    if (state.lastMovePoint) {
      state.velocity = getVelocity(state.lastMovePoint, primaryTouch);
    }
    
    state.lastMoveTime = primaryTouch.timestamp;
    state.lastMovePoint = primaryTouch;
    
    // Handle multi-touch gestures
    if (touches.length === 2) {
      handlePinch(touches);
    } else if (touches.length === 1) {
      // Handle single-touch gestures
      handlePan(gestureStartRef.current, primaryTouch);
    }
    
    // Callback
    if (callbacks.onTouchMove) {
      const gestureEvent = createGestureEvent('pan', gestureStartRef.current, primaryTouch);
      callbacks.onTouchMove(gestureEvent);
    }
    
    if (fullConfig.debugMode) {
      console.log('Touch move:', primaryTouch, 'Velocity:', state.velocity);
    }
  }, [fullConfig.preventDefaultTouchEvents, fullConfig.debugMode, getTouchPoint, getVelocity, handlePinch, handlePan, callbacks, createGestureEvent]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!gestureStartRef.current || !gestureStateRef.current.isGesturing) return;
    
    if (fullConfig.preventDefaultTouchEvents) {
      event.preventDefault();
    }
    
    setCurrentGesture('end');
    
    // Clear press timeout
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    
    // Get the touch that ended
    const endedTouches: TouchPoint[] = [];
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchPoint = touchesRef.current.get(touch.identifier);
      if (touchPoint) {
        endedTouches.push(touchPoint);
        touchesRef.current.delete(touch.identifier);
      }
    }
    
    const primaryEndTouch = endedTouches[0];
    
    // If all touches ended, process gestures
    if (event.touches.length === 0) {
      setIsActive(false);
      setCurrentGesture(null);
      
      const distance = getDistance(gestureStartRef.current, primaryEndTouch);
      const velocity = gestureStateRef.current.velocity;
      const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // Determine gesture type
      if (distance < fullConfig.tapThreshold) {
        // Tap gesture
        handleTap(primaryEndTouch);
      } else if (velocityMagnitude > fullConfig.swipeVelocityThreshold) {
        // Swipe gesture
        handleSwipe(gestureStartRef.current, primaryEndTouch);
      }
      
      // Reset state
      gestureStateRef.current.isGesturing = false;
      gestureStateRef.current.gestureType = null;
      gestureStartRef.current = null;
    }
    
         // Callback
     if (callbacks.onTouchEnd && gestureStartRef.current) {
       const gestureEvent = createGestureEvent('tap', gestureStartRef.current, primaryEndTouch, primaryEndTouch);
       callbacks.onTouchEnd(gestureEvent);
     }
    
    if (fullConfig.debugMode) {
      console.log('Touch end:', primaryEndTouch);
    }
  }, [fullConfig.preventDefaultTouchEvents, fullConfig.debugMode, fullConfig.tapThreshold, fullConfig.swipeVelocityThreshold, getDistance, handleTap, handleSwipe, callbacks, createGestureEvent]);

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!fullConfig.enableMouseEvents) return;
    
    
    const touchEvent = {
      preventDefault: () => event.preventDefault(),
      touches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }],
      changedTouches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }]
    } as unknown as TouchEvent;
    
    handleTouchStart(touchEvent);
  }, [fullConfig.enableMouseEvents, handleTouchStart]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!fullConfig.enableMouseEvents || !gestureStateRef.current.isGesturing) return;
    
    const touchEvent = {
      preventDefault: () => event.preventDefault(),
      touches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }],
      changedTouches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }]
    } as unknown as TouchEvent;
    
    handleTouchMove(touchEvent);
  }, [fullConfig.enableMouseEvents, handleTouchMove]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!fullConfig.enableMouseEvents || !gestureStateRef.current.isGesturing) return;
    
    const touchEvent = {
      preventDefault: () => event.preventDefault(),
      touches: [],
      changedTouches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }]
    } as unknown as TouchEvent;
    
    handleTouchEnd(touchEvent);
  }, [fullConfig.enableMouseEvents, handleTouchEnd]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Touch events
    if (fullConfig.enableTouchEvents) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      element.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }
    
    // Mouse events
    if (fullConfig.enableMouseEvents) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      if (fullConfig.enableTouchEvents) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchEnd);
      }
      
      if (fullConfig.enableMouseEvents) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
      }
      
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, [
    elementRef,
    fullConfig.enableTouchEvents,
    fullConfig.enableMouseEvents,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  return {
    isActive,
    currentGesture,
    gestureState: gestureStateRef.current,
    config: fullConfig
  };
};

export default useTouchGestures;
export type { GestureCallbacks, GestureConfig, GestureEvent, PanGesture, PinchGesture, SwipeDirection };

