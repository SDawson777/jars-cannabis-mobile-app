import { Analytics } from 'aws-amplify';

export function logEvent(name: string, data: Record<string, any>) {
  Analytics.record({ name, attributes: data });
}
