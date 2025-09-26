// Temporary ambient module declarations to unblock typechecking for modules missing .d.ts
// TODO: Remove once official types are resolved or upgraded.

declare module 'react-hook-form' {
  import * as React from 'react';
  // Minimal shape used in this codebase
  export interface FieldValues {
    [key: string]: any;
  }
  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    control: any;
    handleSubmit: (fn: (data: TFieldValues) => void | Promise<void>) => (e?: any) => void;
  }
  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    options: any
  ): UseFormReturn<TFieldValues>;
  export const Controller: React.ComponentType<any>;
}

declare module '@hookform/resolvers/yup' {
  export const yupResolver: (schema: any) => any;
}

// Global type fixes to prevent conflicts
declare global {
  // Suppress Detox global conflicts with jest
  var device: any;
  var element: any;
  var by: any;
  var waitFor: any;

  // Suppress require conflicts
  function require(module: string): any;

  // Add fetch-related types that React Native should have
  interface RequestInit {
    method?: string;
    headers?: { [key: string]: string };
    body?: string;
  }

  interface Response {
    ok: boolean;
    status: number;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  function fetch(url: string, init?: RequestInit): Promise<Response>;
}
