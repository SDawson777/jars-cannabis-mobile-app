// src/hooks/useAddresses.ts
// Hooks for address book management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  isDefault?: boolean;
  validated?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface CreateAddressPayload {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressValidationResult {
  valid: boolean;
  normalized?: Address;
  suggestions?: Address[];
  errors?: string[];
}

/**
 * Hook to fetch user's saved addresses
 */
export function useAddresses() {
  return useQuery<Address[], Error>({
    queryKey: ['addresses'],
    queryFn: async () => {
      return clientGet<Address[]>(phase4Client, '/addresses');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a new address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, CreateAddressPayload>({
    mutationFn: async (payload: CreateAddressPayload) => {
      const result = await clientPost<CreateAddressPayload, Address>(
        phase4Client,
        '/addresses',
        payload
      );
      logEvent('address_created', { state: payload.state });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Hook to update an existing address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, { id: string; data: Partial<CreateAddressPayload> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAddressPayload> }) => {
      const result = await clientPost<Partial<CreateAddressPayload>, Address>(
        phase4Client,
        `/addresses/${id}`,
        data
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Hook to delete an address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (addressId: string) => {
      await clientDelete<void>(phase4Client, `/addresses/${addressId}`);
      logEvent('address_deleted', { addressId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Hook to validate an address
 */
export function useValidateAddress() {
  return useMutation<AddressValidationResult, Error, CreateAddressPayload>({
    mutationFn: async (address: CreateAddressPayload) => {
      return clientPost<CreateAddressPayload, AddressValidationResult>(
        phase4Client,
        '/addresses/validate',
        address
      );
    },
  });
}

/**
 * Hook to set default address
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (addressId: string) => {
      await clientPost<object, void>(phase4Client, `/addresses/${addressId}/default`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
