// Minimal placeholder so tests can mock this module via jest.doMock
export function useCreateOrder() {
  return { mutate: async () => {}, isLoading: false };
}

export function useOrder(__orderId: string) {
  return { data: null, isLoading: false };
}
