// Minimal mock of expo-av Audio.Sound used by src/lib/audio.ts
class MockSound {
  constructor() {
    this._status = { isLoaded: true, isPlaying: false };
  }
  async loadAsync() {
    this._status.isLoaded = true;
  }
  async getStatusAsync() {
    return this._status;
  }
  async stopAsync() {
    this._status.isPlaying = false;
  }
  async replayAsync() {
    this._status.isPlaying = true;
  }
  async unloadAsync() {
    this._status = { isLoaded: false, isPlaying: false };
  }
}

const Audio = {
  Sound: MockSound,
  async setAudioModeAsync() {
    return {};
  },
};

module.exports = { Audio };
