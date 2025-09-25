import React, { useEffect, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAccessibilityStore } from '../state/accessibilityStore';

interface AccessibilityLottieProps {
  source: any;
  style?: any;
  autoPlay?: boolean;
  loop?: boolean;
  staticFrame?: number; // Frame to show when animations are disabled
  testID?: string;
}

export const AccessibilityLottie = React.forwardRef<any, AccessibilityLottieProps>(
  ({ autoPlay = true, loop = true, staticFrame = 0, ...props }, ref) => {
    const { reduceMotion } = useAccessibilityStore();
    const animationRef = useRef<any>(null);

    useEffect(() => {
      if (reduceMotion && animationRef.current) {
        // Stop animation and show static frame
        animationRef.current.pause();
        if (staticFrame !== undefined) {
          animationRef.current.play(staticFrame, staticFrame);
        }
      } else if (!reduceMotion && animationRef.current && autoPlay) {
        // Resume animation
        animationRef.current.play();
      }
    }, [reduceMotion, autoPlay, staticFrame]);

    // Merge forwarded ref with local ref used for controlling frames
    const setRefs = (node: any) => {
      (animationRef as any).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as any).current = node;
    };

    return (
      <LottieView
        ref={setRefs}
        autoPlay={!reduceMotion && autoPlay}
        loop={!reduceMotion && loop}
        {...props}
      />
    );
  }
);

AccessibilityLottie.displayName = 'AccessibilityLottie';

interface AccessibilityAnimatedViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  onAnimationComplete?: () => void;
}

export const AccessibilityAnimatedView = React.forwardRef<View, AccessibilityAnimatedViewProps>(
  ({ children, duration: _duration = 300, onAnimationComplete, ...viewProps }, ref) => {
    const { reduceMotion } = useAccessibilityStore();

    useEffect(() => {
      if (reduceMotion && onAnimationComplete) {
        // Skip animation, call completion immediately
        onAnimationComplete();
      }
    }, [reduceMotion, onAnimationComplete]);

    return (
      <View ref={ref} {...viewProps}>
        {children}
      </View>
    );
  }
);

AccessibilityAnimatedView.displayName = 'AccessibilityAnimatedView';
