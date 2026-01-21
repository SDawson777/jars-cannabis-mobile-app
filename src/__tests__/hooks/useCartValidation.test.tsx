/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { useCartValidation } from '../../hooks/useCartValidation';
import { useCartStore } from '../../../stores/useCartStore';

const mockClientGet = jest.fn();
const mockToast = jest.fn();

jest.mock('../../api/http', () => ({
  clientGet: (...args: any[]) => mockClientGet(...args),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('../../utils/toast', () => ({
  toast: (...args: any[]) => mockToast(...args),
}));

jest.mock('../../../stores/useCartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockUseCartStore = useCartStore as jest.Mock;

describe('useCartValidation', () => {
  const mockSetItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCartStore.mockImplementation((selector: any) => {
      const state = {
        items: [],
        setItems: mockSetItems,
      };
      return selector(state);
    });
  });

  it('completes validation for empty cart', async () => {
    const { result } = renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });
  });

  it('validates cart items with available variants', async () => {
    mockUseCartStore.mockImplementation((selector: any) => {
      const state = {
        items: [{ id: '1', name: 'Product 1', price: 10, variantId: 'v1' }],
        setItems: mockSetItems,
      };
      return selector(state);
    });

    mockClientGet.mockResolvedValue({
      variants: [{ id: 'v1', price: 10, stock: 5 }],
    });

    const { result } = renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    expect(mockSetItems).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        available: true,
        price: 10,
      }),
    ]);
  });

  it('marks items unavailable when out of stock', async () => {
    mockUseCartStore.mockImplementation((selector: any) => {
      const state = {
        items: [{ id: '1', name: 'Product 1', price: 10, variantId: 'v1' }],
        setItems: mockSetItems,
      };
      return selector(state);
    });

    mockClientGet.mockResolvedValue({
      variants: [{ id: 'v1', price: 10, stock: 0 }],
    });

    renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Product 1 is no longer available');
    });

    expect(mockSetItems).toHaveBeenCalledWith([
      expect.objectContaining({
        available: false,
      }),
    ]);
  });

  it('shows toast when price changes', async () => {
    mockUseCartStore.mockImplementation((selector: any) => {
      const state = {
        items: [{ id: '1', name: 'Product 1', price: 10, variantId: 'v1' }],
        setItems: mockSetItems,
      };
      return selector(state);
    });

    mockClientGet.mockResolvedValue({
      variants: [{ id: 'v1', price: 12, stock: 5 }],
    });

    renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Product 1 price updated');
    });
  });

  it('removes items that fail to load', async () => {
    mockUseCartStore.mockImplementation((selector: any) => {
      const state = {
        items: [{ id: '1', name: 'Product 1', price: 10 }],
        setItems: mockSetItems,
      };
      return selector(state);
    });

    mockClientGet.mockRejectedValue(new Error('Not found'));

    renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Product 1 was removed');
    });

    // Item should be omitted from updated array
    expect(mockSetItems).toHaveBeenCalledWith([]);
  });

  it('handles empty cart', async () => {
    const { result } = renderHook(() => useCartValidation());

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    expect(mockSetItems).toHaveBeenCalledWith([]);
  });
});
