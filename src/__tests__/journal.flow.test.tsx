// Mock native slider used by JournalEntryScreen
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  return ({ value, onValueChange }: any) =>
    React.createElement('Slider', { children: null, value, onValueChange });
});
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import * as phase4 from '../api/phase4Client';
import JournalEntryScreen from '../screens/JournalEntryScreen';

jest.mock('../api/phase4Client');

const mocked = phase4 as jest.Mocked<typeof phase4>;

const mockNavigation = { goBack: jest.fn() } as any;
const params = { item: { id: 'test-product-id', name: 'Test Product' } } as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params }),
}));

describe('Journal entry flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits notes using addJournal and navigates back', async () => {
    const qc = new QueryClient();

    mocked.addJournal.mockResolvedValue({ id: 'je-1', notes: 'my notes' } as any);

    const { getByPlaceholderText, getByText } = render(
      <QueryClientProvider client={qc}>
        <JournalEntryScreen />
      </QueryClientProvider>
    );

    const notesInput = getByPlaceholderText('Notes');
    fireEvent.changeText(notesInput, 'my notes');

    const save = getByText('Save');
    fireEvent.press(save);

    await waitFor(() =>
      expect(mocked.addJournal).toHaveBeenCalledWith(expect.objectContaining({ notes: 'my notes' }))
    );
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
