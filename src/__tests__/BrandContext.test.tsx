import React from 'react';
import { renderHook, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BrandProvider, useBrand, useBrandData } from '../context/BrandContext';
import * as apiClient from '../utils/apiClient';

describe('BrandContext', () => {
  const wrapper = ({ children }: any) => <BrandProvider>{children}</BrandProvider>;

  beforeEach(() => jest.restoreAllMocks());

  it('loads brand from API and provides it', async () => {
    // mock global fetch used by BrandContext
    // @ts-ignore
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 'b', name: 'B' }) });

    const { result } = renderHook(() => useBrand(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.brand).toEqual(expect.objectContaining({ id: 'b', name: 'B' }));
  });

  it('falls back to default brand when fetch fails', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockRejectedValue(new Error('Network'));

    const TestComponent = () => {
      const brand = useBrandData();
      return <Text>{brand.name}</Text>;
    };

    const { getByText } = render(<TestComponent />, { wrapper } as any);

    await waitFor(() => expect(getByText(/Cannabis Platform/)).toBeTruthy());
  });
});
