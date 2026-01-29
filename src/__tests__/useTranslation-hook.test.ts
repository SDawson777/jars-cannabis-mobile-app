import { renderHook } from '@testing-library/react-native';
import { useTranslation } from '../i18n/useTranslation';
import { useI18nContext } from '../i18n/I18nProvider';

// Mock I18nProvider
jest.mock('../i18n/I18nProvider', () => ({
  useI18nContext: jest.fn(),
}));

describe('useTranslation', () => {
  const mockT = jest.fn((key: string) => key);
  const mockSetLocale = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useI18nContext as jest.Mock).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: mockSetLocale,
    });
  });

  it('returns translation function from context', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('returns current locale from context', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.locale).toBe('en');
  });

  it('returns setLocale function from context', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.setLocale).toBeDefined();
    expect(typeof result.current.setLocale).toBe('function');
  });

  it('calls translation function with key', () => {
    const { result } = renderHook(() => useTranslation());

    result.current.t('hello.world');

    expect(mockT).toHaveBeenCalledWith('hello.world');
  });

  it('calls setLocale when changing language', () => {
    const { result } = renderHook(() => useTranslation());

    result.current.setLocale('es');

    expect(mockSetLocale).toHaveBeenCalledWith('es');
  });

  it('works with different locales', () => {
    (useI18nContext as jest.Mock).mockReturnValue({
      t: mockT,
      locale: 'es',
      setLocale: mockSetLocale,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.locale).toBe('es');
  });

  it('returns all three properties in correct structure', () => {
    const { result } = renderHook(() => useTranslation());

    expect(Object.keys(result.current)).toEqual(['t', 'locale', 'setLocale']);
  });

  it('maintains function references across renders', () => {
    const { result, rerender } = renderHook(() => useTranslation());

    const firstT = result.current.t;
    const firstSetLocale = result.current.setLocale;

    rerender();

    expect(result.current.t).toBe(firstT);
    expect(result.current.setLocale).toBe(firstSetLocale);
  });

  it('handles translation with parameters', () => {
    mockT.mockImplementation((key: string, params?: any) =>
      params ? `${key} ${JSON.stringify(params)}` : key
    );

    const { result } = renderHook(() => useTranslation());

    result.current.t('greeting', { name: 'John' });

    expect(mockT).toHaveBeenCalledWith('greeting', { name: 'John' });
  });

  it('supports multiple locale switches', () => {
    const { result } = renderHook(() => useTranslation());

    result.current.setLocale('es');
    result.current.setLocale('fr');
    result.current.setLocale('en');

    expect(mockSetLocale).toHaveBeenCalledTimes(3);
    expect(mockSetLocale).toHaveBeenNthCalledWith(1, 'es');
    expect(mockSetLocale).toHaveBeenNthCalledWith(2, 'fr');
    expect(mockSetLocale).toHaveBeenNthCalledWith(3, 'en');
  });
});
