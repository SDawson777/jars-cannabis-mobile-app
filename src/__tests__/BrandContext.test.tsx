import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { BrandProvider, useBrand, Brand } from '../context/BrandContext';

describe('BrandContext', () => {
  const wrapper = ({ children }: any) => <BrandProvider>{children}</BrandProvider>;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'b', name: 'B' }) });
  });

  it('loads brand from API and provides it', async () => {
    const { result } = renderHook(() => useBrand(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.brand).toEqual(expect.objectContaining({ id: 'b', name: 'B' }));
  });
});
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('../utils/apiClient', () => ({
  fetchJson: jest.fn(),
}));

import { fetchJson } from '../utils/apiClient';
import { BrandProvider, useBrandData } from '../context/BrandContext';

function Wrapper({ children }: any) {
  return <BrandProvider>{children}</BrandProvider>;
}

describe('BrandContext', () => {
  beforeEach(() => jest.resetAllMocks());

  it('falls back to default brand when fetch fails', async () => {
    (fetchJson as jest.Mock).mockRejectedValue(new Error('Network')); 

    const TestComponent = () => {
      const brand = useBrandData();
      return <>{brand.name}</>;
    };

    const { getByText } = render(<TestComponent />, { wrapper: Wrapper } as any);

    await waitFor(() => {
      expect(getByText(/Cannabis Platform/)).toBeTruthy();
    });
  });
});
