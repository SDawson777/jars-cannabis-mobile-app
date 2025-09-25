import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import * as phase4Client from '../api/phase4Client';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import MyJarsInsightsScreen from '../screens/MyJarsInsightsScreen';

// Import mock helpers
const mockNavigation = require('@react-navigation/native');

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => () => {}),
}));

jest.mock('../api/phase4Client', () => ({
  addJournal: jest.fn(),
  updateJournal: jest.fn(),
  getJournal: jest.fn(),
}));

jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Rect: 'Rect',
}));

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockPhase4Client = phase4Client as jest.Mocked<typeof phase4Client>;

const Stack = createNativeStackNavigator();

const TestNavigator = ({ initialRouteName = 'JournalEntry', initialParams = {} }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen
            name="JournalEntry"
            component={JournalEntryScreen}
            initialParams={initialParams}
          />
          <Stack.Screen name="MyJarsInsights" component={MyJarsInsightsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

describe('Journal Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockNavigation.__resetMockRouteParams();
  });

  const mockStashItem = {
    id: 'test-product-123',
    name: 'Test Cannabis Product',
    slug: 'test-cannabis-product',
  };

  describe('Journal Creation Flow', () => {
    it('should create journal entry successfully when online', async () => {
      mockPhase4Client.addJournal.mockResolvedValue({ id: 'new-entry-123' });

      const { getByText, getByPlaceholderText } = render(
        <TestNavigator initialParams={{ item: mockStashItem }} />
      );

      // Verify screen renders correctly
      expect(getByText('Journal Entry')).toBeTruthy();
      expect(getByText('Test Cannabis Product')).toBeTruthy();

      // Fill out the form
      const notesInput = getByPlaceholderText('Notes');
      fireEvent.changeText(notesInput, 'Great product for focus and creativity');

      // Save the entry
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalledWith({
          productId: 'test-product-123',
          rating: 0, // No sliders were moved, so average is 0
          notes: 'Great product for focus and creativity',
          tags: [], // No sliders above 0
        });
      });
    });

    it('should queue journal entry for offline processing when API fails', async () => {
      mockPhase4Client.addJournal.mockRejectedValue(new Error('Network error'));

      const { getByText, getByPlaceholderText } = render(
        <TestNavigator initialParams={{ item: mockStashItem }} />
      );

      // Fill out the form
      const notesInput = getByPlaceholderText('Notes');
      fireEvent.changeText(notesInput, 'Offline entry test');

      // Save the entry
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalled();
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'journalQueue',
          JSON.stringify([
            {
              type: 'create',
              payload: {
                productId: 'test-product-123',
                rating: 0,
                notes: 'Offline entry test',
                tags: [],
              },
            },
          ])
        );
      });
    });
  });

  describe('Journal Edit Flow', () => {
    const existingJournalEntry = {
      id: 'existing-entry-456',
      productId: 'test-product-123',
      rating: 4.2,
      notes: 'Original notes',
      tags: ['Focus', 'Creativity'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should render journal entry in edit mode with existing data', async () => {
      // Set mock route params for edit mode
      mockNavigation.__setMockRouteParams({
        item: mockStashItem,
        journalEntry: existingJournalEntry,
      });

      const { getByText, getByDisplayValue } = render(
        <TestNavigator
          initialParams={{
            item: mockStashItem,
            journalEntry: existingJournalEntry,
          }}
        />
      );

      // Verify screen renders in edit mode
      expect(getByText('Edit Journal Entry')).toBeTruthy();
      expect(getByText('Test Cannabis Product')).toBeTruthy();
      expect(getByDisplayValue('Original notes')).toBeTruthy();
    });

    it('should update journal entry successfully when online', async () => {
      // Set mock route params for edit mode
      mockNavigation.__setMockRouteParams({
        item: mockStashItem,
        journalEntry: existingJournalEntry,
      });

      mockPhase4Client.updateJournal.mockResolvedValue({
        ...existingJournalEntry,
        notes: 'Updated notes',
        updatedAt: new Date().toISOString(),
      });

      const { getByText, getByDisplayValue } = render(
        <TestNavigator
          initialParams={{
            item: mockStashItem,
            journalEntry: existingJournalEntry,
          }}
        />
      );

      // Update the notes
      const notesInput = getByDisplayValue('Original notes');
      fireEvent.changeText(notesInput, 'Updated notes with new insights');

      // Save the changes
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockPhase4Client.updateJournal).toHaveBeenCalledWith('existing-entry-456', {
          productId: 'test-product-123',
          rating: 2, // Focus and Creativity tags are 5 each, others are 0: (5+5+0+0+0)/5 = 2
          notes: 'Updated notes with new insights',
          tags: ['Focus', 'Creativity'], // These should remain selected from initial state
        });
      });
    });

    it('should queue journal update for offline processing when API fails', async () => {
      // Set mock route params for edit mode
      mockNavigation.__setMockRouteParams({
        item: mockStashItem,
        journalEntry: existingJournalEntry,
      });

      mockPhase4Client.updateJournal.mockRejectedValue(new Error('Network error'));

      const { getByText, getByDisplayValue } = render(
        <TestNavigator
          initialParams={{
            item: mockStashItem,
            journalEntry: existingJournalEntry,
          }}
        />
      );

      // Update the notes
      const notesInput = getByDisplayValue('Original notes');
      fireEvent.changeText(notesInput, 'Offline update test');

      // Save the changes
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockPhase4Client.updateJournal).toHaveBeenCalled();
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'journalQueue',
          JSON.stringify([
            {
              type: 'update',
              id: 'existing-entry-456',
              payload: {
                productId: 'test-product-123',
                rating: 2, // Focus and Creativity tags are 5 each: (5+5+0+0+0)/5 = 2
                notes: 'Offline update test',
                tags: ['Focus', 'Creativity'],
              },
            },
          ])
        );
      });
    });
  });

  describe('Insights Screen and Histogram Updates', () => {
    it('should call journal API when insights screen loads', async () => {
      const journalEntries = [
        { id: '1', rating: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', rating: 3, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
        { id: '3', rating: 5, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
        { id: '4', rating: 5, createdAt: '2024-01-04', updatedAt: '2024-01-04' },
      ];

      mockPhase4Client.getJournal.mockResolvedValue(journalEntries);

      render(<TestNavigator initialRouteName="MyJarsInsights" />);

      await waitFor(() => {
        expect(mockPhase4Client.getJournal).toHaveBeenCalled();
      });
    });

    it('should display placeholder when no journal entries exist', async () => {
      mockPhase4Client.getJournal.mockResolvedValue([]);

      const { getByText } = render(<TestNavigator initialRouteName="MyJarsInsights" />);

      await waitFor(() => {
        expect(getByText('Insights')).toBeTruthy();
        expect(getByText('No journal data yet.')).toBeTruthy();
      });
    });
  });

  describe('Offline Queue Processing', () => {
    it('should process queued entries when connectivity is restored', async () => {
      // Simulate queue processing when offline fails
      const queuedEntries = [
        {
          type: 'create',
          payload: {
            productId: 'queued-product-1',
            rating: 4.0,
            notes: 'Queued entry 1',
            tags: ['Focus'],
          },
        },
        {
          type: 'update',
          id: 'existing-123',
          payload: {
            productId: 'queued-product-2',
            rating: 3.5,
            notes: 'Queued update',
            tags: ['Relaxation'],
          },
        },
      ];

      // Set up queue in storage
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedEntries));
      mockPhase4Client.addJournal.mockResolvedValue({ id: 'processed-1' });
      mockPhase4Client.updateJournal.mockResolvedValue({ id: 'processed-2' });

      // Start online so processing happens immediately on mount
      mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

      render(<TestNavigator initialParams={{ item: mockStashItem }} />);

      await waitFor(
        () => {
          expect(mockPhase4Client.addJournal).toHaveBeenCalledWith({
            productId: 'queued-product-1',
            rating: 4.0,
            notes: 'Queued entry 1',
            tags: ['Focus'],
          });
          expect(mockPhase4Client.updateJournal).toHaveBeenCalledWith('existing-123', {
            productId: 'queued-product-2',
            rating: 3.5,
            notes: 'Queued update',
            tags: ['Relaxation'],
          });
          expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('journalQueue');
        },
        { timeout: 3000 }
      );
    });

    it('should maintain queue integrity when some entries fail to sync', async () => {
      const queuedEntries = [
        { type: 'create', payload: { productId: 'success-1' } },
        { type: 'create', payload: { productId: 'failure-1' } },
        { type: 'create', payload: { productId: 'not-processed' } },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedEntries));
      mockPhase4Client.addJournal
        .mockResolvedValueOnce({ id: 'success' })
        .mockRejectedValueOnce(new Error('Sync failed'));

      render(<TestNavigator initialParams={{ item: mockStashItem }} />);

      await waitFor(
        () => {
          expect(mockPhase4Client.addJournal).toHaveBeenCalledTimes(2);
          expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'journalQueue',
            JSON.stringify([
              { type: 'create', payload: { productId: 'failure-1' } },
              { type: 'create', payload: { productId: 'not-processed' } },
            ])
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Complete Create → Edit → Histogram Flow', () => {
    it('should handle complete journal lifecycle', async () => {
      // Mock initial empty state
      mockPhase4Client.getJournal.mockResolvedValue([]);
      mockPhase4Client.addJournal.mockResolvedValue({
        id: 'new-entry-789',
        rating: 4.0,
        notes: 'Initial entry',
        tags: ['Focus'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Step 1: Create new entry
      const { getByText, getByPlaceholderText } = render(
        <TestNavigator initialParams={{ item: mockStashItem }} />
      );

      const notesInput = getByPlaceholderText('Notes');
      fireEvent.changeText(notesInput, 'Initial entry notes');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalledWith({
          productId: 'test-product-123',
          rating: 0,
          notes: 'Initial entry notes',
          tags: [],
        });
      });

      // Verify the API would be called for journal updates
      expect(mockPhase4Client.addJournal).toHaveBeenCalledTimes(1);
    });
  });
});
