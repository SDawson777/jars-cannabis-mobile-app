import { render } from '@testing-library/react-native';
import React from 'react';

import AudioPlayer from '../components/AudioPlayer';
import audio from '../lib/audio';

// Mock the audio library
jest.mock('../lib/audio', () => ({
  preload: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
}));

describe('AudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSource = { uri: 'test.mp3' };

  it('should render without crashing', () => {
    const res = render(<AudioPlayer audioKey="test" source={mockSource} play={false} />);

    // render() returns an object; assert it exists
    expect(res).toBeTruthy();
  });

  it('should preload audio on mount when preload is enabled', () => {
    render(
      <AudioPlayer
        audioKey="test"
        source={mockSource}
        play={false}
        preload={true}
        volume={0.8}
        loop={true}
      />
    );

    expect(audio.preload).toHaveBeenCalledWith('test', mockSource, {
      volume: 0.8,
      loop: true,
    });
  });

  it('should not preload audio on mount when preload is disabled', () => {
    render(<AudioPlayer audioKey="test" source={mockSource} play={false} preload={false} />);

    expect(audio.preload).not.toHaveBeenCalled();
  });

  it('should play audio when play is true', () => {
    render(
      <AudioPlayer audioKey="test" source={mockSource} play={true} volume={0.5} loop={false} />
    );

    expect(audio.play).toHaveBeenCalledWith('test', mockSource, {
      volume: 0.5,
      loop: false,
    });
  });

  it('should stop audio when play is false', () => {
    render(<AudioPlayer audioKey="test" source={mockSource} play={false} />);

    expect(audio.stop).toHaveBeenCalledWith('test');
  });

  it('should stop audio when play changes from true to false', () => {
    const { rerender } = render(<AudioPlayer audioKey="test" source={mockSource} play={true} />);

    jest.clearAllMocks();

    rerender(<AudioPlayer audioKey="test" source={mockSource} play={false} />);

    expect(audio.stop).toHaveBeenCalledWith('test');
  });

  it('should use default _values for optional props', () => {
    render(<AudioPlayer audioKey="test" source={mockSource} play={true} />);

    expect(audio.play).toHaveBeenCalledWith('test', mockSource, {
      volume: 1.0,
      loop: false,
    });
  });

  it('should stop audio on unmount', () => {
    const { unmount } = render(<AudioPlayer audioKey="test" source={mockSource} play={true} />);

    jest.clearAllMocks();

    unmount();

    expect(audio.stop).toHaveBeenCalledWith('test');
  });
});
