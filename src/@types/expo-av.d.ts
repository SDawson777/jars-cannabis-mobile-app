declare module 'expo-av' {
  export namespace Audio {
    class Sound {
      loadAsync(source: any): Promise<void>;
      setIsLoopingAsync(isLooping: boolean): Promise<void>;
      replayAsync(): Promise<void>;
      stopAsync(): Promise<void>;
      unloadAsync(): Promise<void>;
      setOnPlaybackStatusUpdate(callback: (status: any) => void): void;
    }
  }
}
