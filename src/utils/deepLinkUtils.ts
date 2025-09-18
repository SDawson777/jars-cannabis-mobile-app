import { linking } from '../navigation/linking';
import logger from '../lib/logger';

export interface ParsedRoute {
  routeName: string;
  params?: Record<string, string>;
}

/**
 * Parse a deep link URL and extract the route name and parameters
 */
export function parseDeepLink(url: string): ParsedRoute | null {
  try {
    // Remove any of our prefixes to get the path
    let path = url;
    for (const prefix of linking.prefixes) {
      if (url.startsWith(prefix)) {
        path = url.slice(prefix.length);
        break;
      }
    }

    // Remove leading slash if present
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    // Find matching route
    const screens = linking.config.screens;
    for (const [routeName, pattern] of Object.entries(screens)) {
      const match = matchPattern(path, pattern);
      if (match) {
        return {
          routeName,
          params: match.params,
        };
      }
    }

    return null;
  } catch (error) {
    logger.warn('Failed to parse deep link', { url, error });
    return null;
  }
}

/**
 * Match a path against a route pattern and extract parameters
 */
function matchPattern(path: string, pattern: string): { params: Record<string, string> } | null {
  // Handle empty pattern (root route)
  if (!pattern && !path) {
    return { params: {} };
  }

  // Convert pattern to regex, extracting parameter names
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) {
    return null;
  }

  // Extract parameters
  const params: Record<string, string> = {};
  for (let i = 0; i < paramNames.length; i++) {
    params[paramNames[i]] = match[i + 1];
  }

  return { params };
}

/**
 * Build a deep link URL for a given route and parameters
 */
export function buildDeepLink(routeName: string, params?: Record<string, string>): string {
  const screens = linking.config.screens;
  const pattern = screens[routeName as keyof typeof screens];

  if (!pattern) {
    throw new Error(`Route ${routeName} not found in linking configuration`);
  }

  let path = pattern;

  // Replace parameters in the pattern
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }

  // Use the primary prefix (custom protocol)
  return `${linking.prefixes[0]}${path}`;
}

/**
 * Check if a URL matches any of our configured prefixes
 */
export function isJarsDeepLink(url: string): boolean {
  return linking.prefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Get all available routes with their patterns
 */
export function getAvailableRoutes(): Record<string, string> {
  return { ...linking.config.screens };
}

/**
 * Validate that a route pattern is correctly formatted
 */
export function validateRoutePattern(pattern: string): boolean {
  try {
    // Check for balanced parameter syntax
    const paramMatches = pattern.match(/:([^/]+)/g);
    if (paramMatches) {
      // Ensure all parameters have valid names (no special characters except allowed ones)
      return paramMatches.every(param => /^:[a-zA-Z][a-zA-Z0-9_]*$/.test(param));
    }
    return true;
  } catch {
    return false;
  }
}
