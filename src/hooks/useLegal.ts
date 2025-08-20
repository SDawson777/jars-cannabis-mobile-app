import type { LegalContent } from '../types/cmsExtra';

import { useCMSContent } from './useCMSContent';

export function useLegal() {
  return useCMSContent<LegalContent>(['legal'], '/content/legal');
}
