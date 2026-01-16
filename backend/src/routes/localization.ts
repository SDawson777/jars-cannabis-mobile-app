// backend/src/routes/localization.ts
// i18n and localization routes

import { Router, Request, Response } from 'express';

const router = Router();

// Supported locales
const SUPPORTED_LOCALES = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', direction: 'ltr', isDefault: true },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', direction: 'ltr', isDefault: false },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    direction: 'ltr',
    isDefault: false,
  },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', direction: 'ltr', isDefault: false },
  {
    code: 'fr-CA',
    name: 'French (Canada)',
    nativeName: 'Français (Canada)',
    direction: 'ltr',
    isDefault: false,
  },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', direction: 'ltr', isDefault: false },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    direction: 'ltr',
    isDefault: false,
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文（简体）',
    direction: 'ltr',
    isDefault: false,
  },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', direction: 'ltr', isDefault: false },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', direction: 'ltr', isDefault: false },
];

// Sample translations
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'en-US': {
    'common.welcome': 'Welcome',
    'common.home': 'Home',
    'common.cart': 'Cart',
    'common.checkout': 'Checkout',
    'common.search': 'Search',
    'products.addToCart': 'Add to Cart',
    'products.outOfStock': 'Out of Stock',
    'products.seeDetails': 'See Details',
    'navigation.back': 'Back',
    'navigation.menu': 'Menu',
    'orders.trackOrder': 'Track Order',
    'orders.reorder': 'Reorder',
  },
  'es-ES': {
    'common.welcome': 'Bienvenido',
    'common.home': 'Inicio',
    'common.cart': 'Carrito',
    'common.checkout': 'Pagar',
    'common.search': 'Buscar',
    'products.addToCart': 'Añadir al Carrito',
    'products.outOfStock': 'Agotado',
    'products.seeDetails': 'Ver Detalles',
    'navigation.back': 'Atrás',
    'navigation.menu': 'Menú',
    'orders.trackOrder': 'Rastrear Pedido',
    'orders.reorder': 'Volver a Pedir',
  },
  'es-MX': {
    'common.welcome': 'Bienvenido',
    'common.home': 'Inicio',
    'common.cart': 'Carrito',
    'common.checkout': 'Pagar',
    'common.search': 'Buscar',
    'products.addToCart': 'Agregar al Carrito',
    'products.outOfStock': 'Agotado',
    'products.seeDetails': 'Ver Detalles',
    'navigation.back': 'Regresar',
    'navigation.menu': 'Menú',
    'orders.trackOrder': 'Rastrear Orden',
    'orders.reorder': 'Volver a Ordenar',
  },
};

// ============================================
// Locale Routes
// ============================================

router.get('/locales', async (req: Request, res: Response) => {
  try {
    res.json({ locales: SUPPORTED_LOCALES });
  } catch (error) {
    console.error('Error fetching locales:', error);
    res.status(500).json({ error: 'Failed to fetch locales' });
  }
});

router.get('/locales/:locale', async (req: Request, res: Response) => {
  try {
    const { locale } = req.params;
    const localeInfo = SUPPORTED_LOCALES.find(l => l.code === locale);

    if (!localeInfo) {
      return res.status(404).json({ error: 'Locale not found' });
    }

    res.json(localeInfo);
  } catch (error) {
    console.error('Error fetching locale info:', error);
    res.status(500).json({ error: 'Failed to fetch locale info' });
  }
});

// ============================================
// Translation Routes
// ============================================

router.get('/translations/:locale', async (req: Request, res: Response) => {
  try {
    const { locale } = req.params;
    const { namespace } = req.query;

    let translations = TRANSLATIONS[locale] || TRANSLATIONS['en-US'];

    // Filter by namespace if provided
    if (namespace) {
      const filtered: Record<string, string> = {};
      Object.entries(translations).forEach(([key, value]) => {
        if (key.startsWith(`${namespace}.`)) {
          filtered[key] = value;
        }
      });
      translations = filtered;
    }

    res.json({
      locale,
      namespace: namespace || 'all',
      translations,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

router.post('/translations/batch', async (req: Request, res: Response) => {
  try {
    const { locales } = req.body;
    const bundles: Record<string, Record<string, string>> = {};

    for (const locale of locales) {
      bundles[locale] = TRANSLATIONS[locale] || TRANSLATIONS['en-US'];
    }

    res.json({ bundles });
  } catch (error) {
    console.error('Error fetching translation bundles:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// ============================================
// Localized Content (from CMS)
// ============================================

router.get('/content/:contentType/:contentId', async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params;
    const { locale = 'en-US' } = req.query;

    res.json({
      id: contentId,
      type: contentType,
      locale,
      fields: {
        title: `Localized ${contentType} title`,
        description: `Localized ${contentType} description`,
        body: `Localized content body for ${locale}`,
      },
      availableLocales: ['en-US', 'es-ES', 'es-MX'],
      defaultLocale: 'en-US',
    });
  } catch (error) {
    console.error('Error fetching localized content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// ============================================
// User Settings
// ============================================

router.get('/settings', async (req: Request, res: Response) => {
  try {
    res.json({
      locale: 'en-US',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      autoDetect: true,
      fallbackLocale: 'en-US',
    });
  } catch (error) {
    console.error('Error fetching localization settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    res.json({ ...settings });
  } catch (error) {
    console.error('Error updating localization settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// Auto-detect locale
// ============================================

router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { acceptLanguage, timezone: _timezone, region: _region } = req.body;

    // Simple detection logic
    let detectedLocale = 'en-US';

    if (acceptLanguage) {
      const preferred = acceptLanguage.split(',')[0]?.split(';')[0];
      const match = SUPPORTED_LOCALES.find(
        l => l.code === preferred || l.code.startsWith(preferred.split('-')[0])
      );
      if (match) {
        detectedLocale = match.code;
      }
    }

    res.json({
      detectedLocale,
      confidence: 0.9,
      fallback: 'en-US',
    });
  } catch (error) {
    console.error('Error detecting locale:', error);
    res.status(500).json({ error: 'Failed to detect locale' });
  }
});

export default router;
