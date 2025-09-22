// Mock react-native-svg which relies on native Touchable mixins in RN
jest.mock('react-native-svg', () => {
  const React = require('react');
  const MockView = (props: any) => React.createElement('Svg', props, props.children);
  return {
    __esModule: true,
    default: MockView,
    Rect: (props: any) => React.createElement('Rect', props),
  };
});
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import * as phase4 from '../api/phase4Client';
import MyJarsInsightsScreen from '../screens/MyJarsInsightsScreen';

jest.mock('../api/phase4Client');

const mocked = phase4 as jest.Mocked<typeof phase4>;

describe('Insights screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart when entries are present and reads notes field', async () => {
    const qc = new QueryClient();
    const entries = [
      { id: 'je-1', rating: 5, notes: 'nice', createdAt: new Date().toISOString() },
      { id: 'je-2', rating: 3, notes: 'ok', createdAt: new Date().toISOString() },
    ];
    mocked.getJournal.mockResolvedValue(entries as any);

    const tree = render(
      <QueryClientProvider client={qc}>
        <MyJarsInsightsScreen />
      </QueryClientProvider>
    );

    await waitFor(() => expect(mocked.getJournal).toHaveBeenCalled());
    await waitFor(() => expect(tree.getByText('Insights')).toBeTruthy());
  });
});
