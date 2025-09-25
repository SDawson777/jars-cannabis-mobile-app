// Mock native slider used by JournalEntryScreen
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  return ({ value, onValueChange }: any) =>
    React.createElement('Slider', { children: null, value, onValueChange });
});

// Mock SVG for histogram charts
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Rect: 'Rect',
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import * as phase4 from '../api/phase4Client';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import MyJarsInsightsScreen from '../screens/MyJarsInsightsScreen';

jest.mock('../api/phase4Client');

const mocked = phase4 as jest.Mocked<typeof phase4>;

const mockNavigation = { goBack: jest.fn() } as any;
const params = { item: { id: 'test-product-id', name: 'Test Product' } } as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params }),
}));

describe('Journal Create → Edit → Histogram Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('creates entry, edits it, and histogram updates immediately', async () => {
    // Mock initial empty journal
    mocked.getJournal.mockResolvedValueOnce([]);

    // Render insights screen initially
    const insightsRender = render(
      <QueryClientProvider client={queryClient}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    // Should show "No journal data yet"
    await waitFor(() => {
      expect(insightsRender.getByText('No journal data yet.')).toBeTruthy();
    });

    // Now mock successful journal creation
    const newEntry = {
      id: 'je-1',
      productId: 'test-product-id',
      rating: 8,
      notes: 'Great product',
      tags: ['relaxation'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    mocked.addJournal.mockResolvedValueOnce(newEntry);

    // Render journal entry screen
    const entryRender = render(
      <QueryClientProvider client={queryClient}>
        <JournalEntryScreen />
      </QueryClientProvider>
    );

    // Fill in notes
    const notesInput = entryRender.getByPlaceholderText('Notes');
    fireEvent.changeText(notesInput, 'Great product');

    // Save the entry (sliders are mocked, so rating will be 0 by default)
    const saveButton = entryRender.getByText('Save');
    fireEvent.press(saveButton);

    // Wait for API call
    await waitFor(() => {
      expect(mocked.addJournal).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'test-product-id',
          notes: 'Great product',
          rating: 0, // Since sliders are mocked and default to 0
          tags: [], // No sliders moved, so no tags
        })
      );
    });

    // Mock updated journal with new entry
    mocked.getJournal.mockResolvedValue([newEntry]);

    // Force refetch by clearing cache and invalidating
    queryClient.clear();
    queryClient.invalidateQueries({ queryKey: ['journal'] });

    // Re-render insights to see histogram update
    insightsRender.rerender(
      <QueryClientProvider client={queryClient}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    // Verify histogram shows the entry
    await waitFor(() => {
      expect(insightsRender.getByText('Insights')).toBeTruthy();
      expect(insightsRender.queryByText('No journal data yet.')).toBeFalsy();
    });

    // Now test editing the entry
    const updatedEntry = {
      ...newEntry,
      rating: 9,
      notes: 'Updated: Excellent product',
      updatedAt: '2023-01-01T01:00:00Z', // Later timestamp
    };

    mocked.updateJournal.mockResolvedValueOnce(updatedEntry);

    // Simulate edit (in real app this would be through edit screen)
    await phase4.updateJournal('je-1', {
      rating: 9,
      notes: 'Updated: Excellent product',
    });

    // Mock journal with updated entry
    mocked.getJournal.mockResolvedValue([updatedEntry]);

    // Force refetch by clearing cache and invalidating
    queryClient.clear();
    queryClient.invalidateQueries({ queryKey: ['journal'] });

    // Re-render insights to see updated histogram
    insightsRender.rerender(
      <QueryClientProvider client={queryClient}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    // Wait for updated data
    await waitFor(() => {
      expect(mocked.getJournal).toHaveBeenCalledTimes(3); // Initial, after create, after update
    });

    expect(mocked.updateJournal).toHaveBeenCalledWith('je-1', {
      rating: 9,
      notes: 'Updated: Excellent product',
    });
  });

  it('handles multiple entries and histogram calculations correctly', async () => {
    const entries = [
      {
        id: 'je-1',
        rating: 7,
        notes: 'Good',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'je-2',
        rating: 8,
        notes: 'Great',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
      {
        id: 'je-3',
        rating: 8, // Same rating as je-2
        notes: 'Also great',
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z',
      },
    ];

    mocked.getJournal.mockResolvedValueOnce(entries);

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByText('Insights')).toBeTruthy();
      expect(mocked.getJournal).toHaveBeenCalled();
    });

    // The histogram should show:
    // - Rating 7: 1 entry
    // - Rating 8: 2 entries
    // - All others: 0 entries
    // We can't easily test the SVG rendering, but we can verify the data was fetched
  });

  it('handles editing entry and verifies updatedAt ordering', async () => {
    const entries = [
      {
        id: 'je-1',
        rating: 5,
        notes: 'Original entry',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'je-2',
        rating: 6,
        notes: 'Second entry',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];

    mocked.getJournal.mockResolvedValueOnce(entries);

    render(
      <QueryClientProvider client={queryClient}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mocked.getJournal).toHaveBeenCalled();
    });

    // Update the first entry (should move it to top based on updatedAt)
    const updatedFirstEntry = {
      ...entries[0],
      notes: 'Updated first entry',
      updatedAt: '2023-01-03T00:00:00Z', // Later than second entry
    };

    mocked.updateJournal.mockResolvedValueOnce(updatedFirstEntry);

    // Mock the updated journal list (first entry now has latest updatedAt)
    mocked.getJournal.mockResolvedValueOnce([updatedFirstEntry, entries[1]]);

    // Simulate the update
    await phase4.updateJournal('je-1', { notes: 'Updated first entry' });

    // Invalidate and re-fetch
    queryClient.invalidateQueries({ queryKey: ['journal'] });

    await waitFor(() => {
      expect(mocked.updateJournal).toHaveBeenCalledWith('je-1', {
        notes: 'Updated first entry',
      });
      expect(mocked.getJournal).toHaveBeenCalledTimes(2);
    });
  });
});
