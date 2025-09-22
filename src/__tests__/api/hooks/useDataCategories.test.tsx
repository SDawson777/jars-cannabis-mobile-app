import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Text } from 'react-native';

jest.mock('../../../api/phase4Client', () => ({
  phase4Client: { get: jest.fn() },
}));

import { phase4Client } from '../../../api/phase4Client';
import { useDataCategories } from '../../../api/hooks/useDataCategories';

describe('useDataCategories', () => {
  it('returns an array of data categories', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: [{ id: 'usage', label: 'Usage Data' }] });
    const client = new QueryClient();
    const wrapper = ({ children }: any) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    function TestComponent() {
      const { data, isSuccess } = useDataCategories();
      if (!isSuccess) return <Text>loading</Text>;
      return <Text>{data && data[0].id}</Text>;
    }

    const { getByText } = render(<TestComponent />, { wrapper });

    await waitFor(() => getByText('usage'));
  });
});
