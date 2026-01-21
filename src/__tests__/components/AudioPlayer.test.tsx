/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import AudioPlayer from '../../components/AudioPlayer';
import audio from '../../lib/audio';

jest.mock('../../lib/audio', () => ({
  play: jest.fn(),
  stop: jest.fn(),
  preload: jest.fn(),
}));

const mockAudio = audio as jest.Mocked<typeof audio>;

describe('AudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing', () => {
    const { toJSON } = render(<AudioPlayer audioKey="test" source="test.mp3" play={false} />);
    expect(toJSON()).toBeNull();
  });

  it('preloads audio on mount when preload is true', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={false} preload={true} />);
    expect(mockAudio.preload).toHaveBeenCalledWith(
      'test',
      'test.mp3',
      expect.objectContaining({ volume: 1.0, loop: false })
    );
  });

  it('does not preload when preload is false', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={false} preload={false} />);
    expect(mockAudio.preload).not.toHaveBeenCalled();
  });

  it('plays audio when play is true', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={true} />);
    expect(mockAudio.play).toHaveBeenCalledWith(
      'test',
      'test.mp3',
      expect.objectContaining({ volume: 1.0, loop: false })
    );
  });

  it('stops audio when play is false', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={false} />);
    expect(mockAudio.stop).toHaveBeenCalledWith('test');
  });

  it('uses custom volume', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={true} volume={0.5} />);
    expect(mockAudio.play).toHaveBeenCalledWith(
      'test',
      'test.mp3',
      expect.objectContaining({ volume: 0.5 })
    );
  });

  it('uses loop option', () => {
    render(<AudioPlayer audioKey="test" source="test.mp3" play={true} loop={true} />);
    expect(mockAudio.play).toHaveBeenCalledWith(
      'test',
      'test.mp3',
      expect.objectContaining({ loop: true })
    );
  });

  it('stops audio on unmount', () => {
    const { unmount } = render(<AudioPlayer audioKey="test" source="test.mp3" play={true} />);

    mockAudio.stop.mockClear();
    unmount();

    expect(mockAudio.stop).toHaveBeenCalledWith('test');
  });
});
