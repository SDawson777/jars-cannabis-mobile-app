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

export const AccessibilityLottie: React.FC<AccessibilityLottieProps> = ({
  autoPlay = true,
  loop = true,
  staticFrame = 0,
  ...props
}) => {
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

  return (
    <LottieView
      ref={animationRef}
      autoPlay={!reduceMotion && autoPlay}
      loop={!reduceMotion && loop}
      {...props}
    />
  );
};

interface AccessibilityAnimatedViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  onAnimationComplete?: () => void;
}

export const AccessibilityAnimatedView: React.FC<AccessibilityAnimatedViewProps> = ({
  children,
  duration: _duration = 300,
  onAnimationComplete,
  ...viewProps
}) => {
  const { reduceMotion } = useAccessibilityStore();

  useEffect(() => {
    if (reduceMotion && onAnimationComplete) {
      // Skip animation, call completion immediately
      onAnimationComplete();
    }
  }, [reduceMotion, onAnimationComplete]);

  return <View {...viewProps}>{children}</View>;
};
