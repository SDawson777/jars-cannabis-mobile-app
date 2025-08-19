export default class Sound {
  static MAIN_BUNDLE = '';
  constructor(_file: any, _base: any, onLoad?: () => void) {
    if (onLoad) setTimeout(onLoad, 0);
  }
  setNumberOfLoops(_loops: number) {
    return this;
  }
  play() {}
  stop(cb?: () => void) {
    if (cb) cb();
  }
  release() {}
}

