import type { ShopFilter } from '../types/cmsExtra';

import { useCMSContent } from './useCMSContent';

export function useFiltersQuery() {
  return useCMSContent<ShopFilter[]>(['filters'], '/content/filters');
}
