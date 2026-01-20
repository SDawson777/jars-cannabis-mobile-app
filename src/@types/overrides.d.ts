// Type declarations for packages with incomplete or missing TypeScript definitions
// These provide proper typing while maintaining compatibility with existing code

declare module 'react-hook-form' {
  import * as React from 'react';

  export interface FieldValues {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface FieldError {
    type: string;
    message?: string;
  }

  export type FieldErrors<TFieldValues extends FieldValues = FieldValues> = {
    [K in keyof TFieldValues]?: FieldError;
  };

  export interface Control<TFieldValues extends FieldValues = FieldValues> {
    _formValues: TFieldValues;
    _formState: unknown;
    register: (name: keyof TFieldValues) => unknown;
    unregister: (name: keyof TFieldValues) => void;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    handleSubmit: (
      onValid: (data: TFieldValues) => void | Promise<void>,
      onInvalid?: (errors: FieldErrors<TFieldValues>) => void
    ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    register: (name: keyof TFieldValues) => {
      name: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: (event: any) => void;
      onBlur: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref: React.RefCallback<any>;
    };
    formState: {
      errors: FieldErrors<TFieldValues>;
      isValid: boolean;
      isSubmitting: boolean;
      isDirty: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: (name: keyof TFieldValues, value: any) => void;
    getValues: () => TFieldValues;
    reset: (values?: Partial<TFieldValues>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    watch: (name?: keyof TFieldValues) => any;
  }

  export interface UseFormProps<TFieldValues extends FieldValues = FieldValues> {
    mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
    reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
    defaultValues?: Partial<TFieldValues>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver?: any;
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any
  ): UseFormReturn<TFieldValues>;

  // Controller component with flexible render prop typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Controller: React.ComponentType<any>;
}

declare module '@hookform/resolvers/yup' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function yupResolver(schema: any): any;
}

// Global type augmentations for test environments
declare global {
  // Detox global types for E2E testing (flexible to avoid conflicts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var device: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var element: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var by: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var waitFor: any;

  // CommonJS require (for dynamic imports in tests)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function require(module: string): any;

  // React Native fetch types (flexible for compatibility)
  interface RequestInit {
    method?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers?: Record<string, string> | any;
    body?: string;
    signal?: AbortSignal;
  }

  interface Response {
    ok: boolean;
    status: number;
    statusText?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json(): Promise<any>;
    text(): Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blob?: () => Promise<any>;
    clone?: () => Response;
  }

  function fetch(url: string, init?: RequestInit): Promise<Response>;
}
