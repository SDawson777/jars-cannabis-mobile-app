import { Audio } from 'expo-av';

export class Sound {
  sound: Audio.Sound;

  constructor(file: any, _base: any, onLoad?: () => void) {
    this.sound = new Audio.Sound();
    this.loadAsync(file).then(() => {
      if (onLoad) onLoad();
    });
  }

  async loadAsync(source: any) {
    try {
      await this.sound.loadAsync(source);
    } catch (e) {
      console.warn('Failed to load sound', e);
    }
  }

  async setNumberOfLoops(loops: number) {
    await this.sound.setIsLoopingAsync(loops === -1);
    return this;
  }

  async play(onEnd?: () => void) {
    try {
      await this.sound.replayAsync();
      if (onEnd) {
        this.sound.setOnPlaybackStatusUpdate(status => {
          if (status && 'didJustFinish' in status && status.didJustFinish) {
            onEnd();
          }
        });
      }
    } catch (e) {
      console.warn('Failed to play sound', e);
    }
  }

  async stop(cb?: () => void) {
    try {
      await this.sound.stopAsync();
      if (cb) cb();
    } catch (e) {
      console.warn('Failed to stop sound', e);
    }
  }

  async release() {
    try {
      await this.sound.unloadAsync();
    } catch (e) {
      console.warn('Failed to release sound', e);
    }
  }
}

export default Sound;
