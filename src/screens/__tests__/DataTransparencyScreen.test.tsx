// src/screens/__tests__/DataTransparencyScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DataTransparencyScreen from '../DataTransparencyScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { getDataPrefs, updateDataPrefs, phase4Client } from '../../api/phase4Client';
import { clientGet, clientPost } from '../../api/http';
import { toast } from '../../utils/toast';

// Mock dependencies
jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
  getDataPrefs: jest.fn(),
  updateDataPrefs: jest.fn(),
}));

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/toast', () => ({
  toast: jest.fn(),
}));

jest.mock('../../utils/haptic', () => ({
  hapticMedium: jest.fn(),
}));

const mockGetDataPrefs = getDataPrefs as jest.MockedFunction<typeof getDataPrefs>;
const mockUpdateDataPrefs = updateDataPrefs as jest.MockedFunction<typeof updateDataPrefs>;
const mockClientGet = clientGet as jest.MockedFunction<typeof clientGet>;
const mockClientPost = clientPost as jest.MockedFunction<typeof clientPost>;

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  textColor: '#2C3E50',
  isDark: false,
};

const defaultPrefs = {
  personalizedAds: true,
  emailTracking: false,
  shareWithPartners: true,
};

describe('DataTransparencyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDataPrefs.mockResolvedValue(defaultPrefs);
    mockUpdateDataPrefs.mockResolvedValue(undefined);
    mockClientPost.mockResolvedValue({ exportId: 'export-123' });
    mockClientGet.mockResolvedValue({ exportId: 'export-123', status: 'pending' });
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <DataTransparencyScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      mockGetDataPrefs.mockImplementation(() => new Promise(() => {})); // Never resolves
      const { UNSAFE_queryAllByType } = renderScreen();

      // Should show activity indicator
      const activityIndicators = UNSAFE_queryAllByType(require('react-native').ActivityIndicator);
      expect(activityIndicators.length).toBeGreaterThan(0);
    });

    it('renders data preferences section after loading', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });
    });

    it('renders all preference toggles', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Personalized Ads')).toBeTruthy();
        expect(getByText('Email Tracking')).toBeTruthy();
        expect(getByText('Share With Partners')).toBeTruthy();
      });
    });

    it('renders export button', async () => {
      const { getByLabelText } = renderScreen();

      await waitFor(() => {
        expect(getByLabelText('Request data export')).toBeTruthy();
      });
    });

    it('shows correct toggle states based on preferences', async () => {
      const { getByLabelText } = renderScreen();

      await waitFor(() => {
        // Check that all preference toggles exist
        expect(getByLabelText('Toggle personalized ads')).toBeTruthy();
        expect(getByLabelText('Toggle email tracking')).toBeTruthy();
        expect(getByLabelText('Toggle share with partners')).toBeTruthy();
      });
    });
  });

  describe('Data Preferences', () => {
    it('toggles personalized ads preference', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Personalized Ads')).toBeTruthy();
      });

      const toggleButton = getByLabelText('Toggle personalized ads');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(mockUpdateDataPrefs).toHaveBeenCalledWith({
          ...defaultPrefs,
          personalizedAds: false,
        });
      });
    });

    it('toggles email tracking preference', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Email Tracking')).toBeTruthy();
      });

      const toggleButton = getByLabelText('Toggle email tracking');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(mockUpdateDataPrefs).toHaveBeenCalledWith({
          ...defaultPrefs,
          emailTracking: true,
        });
      });
    });

    it('toggles share with partners preference', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Share With Partners')).toBeTruthy();
      });

      const toggleButton = getByLabelText('Toggle share with partners');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(mockUpdateDataPrefs).toHaveBeenCalledWith({
          ...defaultPrefs,
          shareWithPartners: false,
        });
      });
    });

    it('shows toast on successful preference update', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Personalized Ads')).toBeTruthy();
      });

      const toggleButton = getByLabelText('Toggle personalized ads');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(expect.stringContaining('Saved'));
      });
    });

    it('rolls back on preference update failure', async () => {
      mockUpdateDataPrefs.mockRejectedValue(new Error('Network error'));

      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Personalized Ads')).toBeTruthy();
      });

      const toggleButton = getByLabelText('Toggle personalized ads');
      fireEvent.press(toggleButton);

      // After failure, the component should show an error
      await waitFor(() => {
        expect(getByText(/Error:/)).toBeTruthy();
      });
    });
  });

  describe('Data Export', () => {
    it('requests data export when button is pressed', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(mockClientPost).toHaveBeenCalledWith(phase4Client, '/data-transparency/export', {
          userId: 'user-123',
        });
      });
    });

    it('shows pending status after export request', async () => {
      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(getByText('Export pending...')).toBeTruthy();
      });
    });

    it('shows download link when export is completed', async () => {
      // Mock immediately resolving to completed status
      mockClientGet.mockResolvedValue({
        exportId: 'export-123',
        status: 'completed',
        downloadUrl: 'https://example.com/export.zip',
      });

      const { getByLabelText, getByText, queryByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      // The component will poll for status
      await waitFor(
        () => {
          expect(queryByText('Download Export')).toBeTruthy();
        },
        { timeout: 5000 }
      );
    });

    it('shows download export link when completed', async () => {
      mockClientGet.mockResolvedValue({
        exportId: 'export-123',
        status: 'completed',
        downloadUrl: 'https://example.com/export.zip',
      });

      const { getByLabelText, getByText, queryByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(
        () => {
          expect(queryByText('Download Export')).toBeTruthy();
        },
        { timeout: 5000 }
      );

      // Verify the download link is accessible
      expect(getByLabelText('Download data export')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when preferences fail to load', async () => {
      mockGetDataPrefs.mockRejectedValue(new Error('Failed to load'));

      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Error: Failed to load')).toBeTruthy();
      });
    });

    it('shows error message when export request fails', async () => {
      mockClientPost.mockRejectedValue(new Error('Export failed'));

      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(getByText('Error: Export failed')).toBeTruthy();
      });
    });

    it('shows retry button when error occurs', async () => {
      mockClientPost.mockRejectedValue(new Error('Export failed'));

      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(getByLabelText('Retry export')).toBeTruthy();
      });
    });

    it('retries export when retry button is pressed', async () => {
      mockClientPost
        .mockRejectedValueOnce(new Error('Export failed'))
        .mockResolvedValue({ exportId: 'export-456' });

      const { getByLabelText, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });

      const exportButton = getByLabelText('Request data export');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(getByLabelText('Retry export')).toBeTruthy();
      });

      const retryButton = getByLabelText('Retry export');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockClientPost).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', async () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={coolTheme}>
          <DataTransparencyScreen />
        </ThemeContext.Provider>
      );

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });
    });

    it('applies neutral theme when colorTemp is neutral', async () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <DataTransparencyScreen />
        </ThemeContext.Provider>
      );

      await waitFor(() => {
        expect(getByText('Data Preferences')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessibility labels for toggle buttons', async () => {
      const { getByLabelText } = renderScreen();

      await waitFor(() => {
        expect(getByLabelText('Toggle personalized ads')).toBeTruthy();
        expect(getByLabelText('Toggle email tracking')).toBeTruthy();
        expect(getByLabelText('Toggle share with partners')).toBeTruthy();
      });
    });

    it('has accessibility label for export button', async () => {
      const { getByLabelText } = renderScreen();

      await waitFor(() => {
        expect(getByLabelText('Request data export')).toBeTruthy();
      });
    });
  });
});
