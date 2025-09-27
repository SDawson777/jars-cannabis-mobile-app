declare module '@tanstack/react-query' {
  import { ReactNode } from 'react';
  export * from '@tanstack/query-core';

  // QueryClient class definition
  export class QueryClient {
    constructor(config?: any);

    getQueryCache(): any;
    getMutationCache(): any;

    fetchQuery(options: any): Promise<any>;
    prefetchQuery(options: any): Promise<void>;

    getQueryData(queryKey: any): any;
    setQueryData(queryKey: any, data: any): any;

    invalidateQueries(filters?: any): Promise<void>;
    refetchQueries(filters?: any): Promise<void>;
    cancelQueries(filters?: any): Promise<void>;

    clear(): void;
    mount(): void;
    unmount(): void;
  }

  // Re-export commonly used types and functions
  export interface QueryClientProviderProps {
    client: QueryClient;
    children: ReactNode;
  }

  export const QueryClientProvider: React.ComponentType<QueryClientProviderProps>;
  export const useQueryClient: () => QueryClient;
  export function useQuery<TData = unknown, TError = Error>(options: any): any;
  export function useInfiniteQuery<TData = unknown, TError = Error>(options: any): any;
  export function useMutation<TData = unknown, TError = Error, TVariables = void>(
    options: any
  ): any;
  export const HydrationBoundary: React.ComponentType<any>;
  export const QueryErrorResetBoundary: React.ComponentType<any>;
  export const useIsFetching: () => number;
  export const useIsMutating: () => number;
  export const queryOptions: (options: any) => any;
  export const infiniteQueryOptions: (options: any) => any;
  export const mutationOptions: (options: any) => any;
}
