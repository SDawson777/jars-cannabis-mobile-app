// src/components/__tests__/AudioPlayer.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import AudioPlayer from '../AudioPlayer';
import audio from '../../lib/audio';

// Mock audio library
jest.mock('../../lib/audio', () => ({
  preload: jest.fn(),
  play: jest.fn(),
  stop: jest.fn(),
}));

const mockAudio = audio as jest.Mocked<typeof audio>;

describe('AudioPlayer', () => {
  const defaultProps = {
    audioKey: 'test-audio',
    source: require('../../assets/audio/test.mp3'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Preloading', () => {
    it('preloads audio on mount when preload is true', () => {
      render(<AudioPlayer {...defaultProps} play={false} preload={true} />);

      expect(mockAudio.preload).toHaveBeenCalledWith('test-audio', defaultProps.source, {
        volume: 1.0,
        loop: false,
      });
    });

    it('does not preload audio when preload is false', () => {
      render(<AudioPlayer {...defaultProps} play={false} preload={false} />);

      expect(mockAudio.preload).not.toHaveBeenCalled();
    });

    it('preloads by default (preload is true by default)', () => {
      render(<AudioPlayer {...defaultProps} play={false} />);

      expect(mockAudio.preload).toHaveBeenCalled();
    });
  });

  describe('Playback', () => {
    it('plays audio when play is true', () => {
      render(<AudioPlayer {...defaultProps} play={true} />);

      expect(mockAudio.play).toHaveBeenCalledWith('test-audio', defaultProps.source, {
        volume: 1.0,
        loop: false,
      });
    });

    it('does not play audio when play is false', () => {
      render(<AudioPlayer {...defaultProps} play={false} />);

      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('stops audio when play changes from true to false', () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} play={true} />);

      mockAudio.stop.mockClear();
      rerender(<AudioPlayer {...defaultProps} play={false} />);

      expect(mockAudio.stop).toHaveBeenCalledWith('test-audio');
    });
  });

  describe('Options', () => {
    it('passes volume option', () => {
      render(<AudioPlayer {...defaultProps} play={true} volume={0.5} />);

      expect(mockAudio.play).toHaveBeenCalledWith(
        'test-audio',
        defaultProps.source,
        expect.objectContaining({ volume: 0.5 })
      );
    });

    it('passes loop option', () => {
      render(<AudioPlayer {...defaultProps} play={true} loop={true} />);

      expect(mockAudio.play).toHaveBeenCalledWith(
        'test-audio',
        defaultProps.source,
        expect.objectContaining({ loop: true })
      );
    });

    it('uses default volume of 1.0', () => {
      render(<AudioPlayer {...defaultProps} play={true} />);

      expect(mockAudio.play).toHaveBeenCalledWith(
        'test-audio',
        defaultProps.source,
        expect.objectContaining({ volume: 1.0 })
      );
    });

    it('uses default loop of false', () => {
      render(<AudioPlayer {...defaultProps} play={true} />);

      expect(mockAudio.play).toHaveBeenCalledWith(
        'test-audio',
        defaultProps.source,
        expect.objectContaining({ loop: false })
      );
    });
  });

  describe('Cleanup', () => {
    it('stops audio on unmount', () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} play={true} />);

      mockAudio.stop.mockClear();
      unmount();

      expect(mockAudio.stop).toHaveBeenCalledWith('test-audio');
    });
  });

  describe('Rendering', () => {
    it('renders null (no visible output)', () => {
      const { toJSON } = render(<AudioPlayer {...defaultProps} play={false} />);
      expect(toJSON()).toBeNull();
    });
  });
});
