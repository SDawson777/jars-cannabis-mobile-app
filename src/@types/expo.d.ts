declare module 'expo-av' {
  export namespace Audio {
    export interface SoundObject {
      sound: Sound;
      status: any;
    }

    export class Sound {
      static createAsync(source: any, initialStatus?: any): Promise<SoundObject>;

      loadAsync(source: any, initialStatus?: any): Promise<any>;
      playAsync(): Promise<any>;
      replayAsync(): Promise<any>;
      pauseAsync(): Promise<any>;
      stopAsync(): Promise<any>;
      unloadAsync(): Promise<any>;
      setPositionAsync(position: number): Promise<any>;
      getStatusAsync(): Promise<any>;
      setOnPlaybackStatusUpdate(onPlaybackStatusUpdate: (status: any) => void): void;
    }

    export const setAudioModeAsync: (mode: any) => Promise<void>;
    export const RecordingOptionsPresets: any;
  }
}

declare module '@react-native-community/slider' {
  import React from 'react';
  import { ViewStyle } from 'react-native';

  interface SliderProps {
    style?: ViewStyle;
    disabled?: boolean;
    maximumValue?: number;
    minimumTrackTintColor?: string;
    minimumValue?: number;
    onSlidingComplete?: (value: number) => void;
    onValueChange?: (value: number) => void;
    step?: number;
    maximumTrackTintColor?: string;
    value?: number;
    trackStyle?: ViewStyle;
    thumbStyle?: ViewStyle;
    debugTouchArea?: boolean;
    animateTransitions?: boolean;
    animationType?: 'spring' | 'timing';
    orientation?: 'horizontal' | 'vertical';
    thumbTouchSize?: { width: number; height: number };
  }

  declare const Slider: React.ComponentType<SliderProps>;
  export default Slider;
}
