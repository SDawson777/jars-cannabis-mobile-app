import { record } from '@aws-amplify/analytics';

export function logEvent(name: string, data: Record<string, any>) {
  record({ name, attributes: data });
}

export const trackEvent = logEvent;
