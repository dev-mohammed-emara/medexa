import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface FilterConfig<T = any> {
  key: string;                 // URL param and sessionStorage key
  state: T;                    // React state value
  setState: (val: T) => void;  // React state setter
  defaultValue: T;             // Default value (not stored in URL if equal)
  serialize?: (val: T) => string;
  deserialize?: (val: string) => T;
  urlEnabled?: boolean;        // If false, keep in state/sessionStorage but NEVER sync to URL
}

interface UseUrlFiltersProps {
  sessionKey: string;          // sessionStorage key (e.g. 'medexa_filter_patients')
  filters: FilterConfig[];
}

export function useUrlFilters({ sessionKey, filters }: UseUrlFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSyncingUrl = useRef(false);
  const hasInitialized = useRef(false);

  // Helper to deserialize values
  const deserializeVal = useCallback((config: FilterConfig, rawVal: string) => {
    if (config.deserialize) return config.deserialize(rawVal);
    if (typeof config.defaultValue === 'number') {
      const num = Number(rawVal);
      return isNaN(num) ? config.defaultValue : num;
    }
    if (typeof config.defaultValue === 'boolean') return rawVal === 'true';
    return rawVal;
  }, []);

  // Helper to serialize values safely
  const serializeVal = useCallback((config: FilterConfig, val: any) => {
    if (config.serialize) return config.serialize(val);
    
    // Safety check for objects and arrays:
    // If no custom serializer is provided, and it's an object/array, do not serialize to URL.
    if (val !== null && typeof val === 'object') {
      return '';
    }
    
    return String(val);
  }, []);

  // 1. Initial State Resolution
  useLayoutEffect(() => {
    if (hasInitialized.current) return;

    // Load from sessionStorage fallback
    let savedSession: Record<string, any> = {};
    try {
      const data = sessionStorage.getItem(sessionKey);
      if (data) {
        savedSession = JSON.parse(data) || {};
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(`Failed to parse sessionStorage key ${sessionKey}`, e);
      }
    }

    // Set initial values
    filters.forEach((config) => {
      const isUrl = config.urlEnabled !== false;
      const urlVal = isUrl ? searchParams.get(config.key) : null;
      
      if (urlVal !== null) {
        // URL exists and wins
        config.setState(deserializeVal(config, urlVal));
      } else if (savedSession[config.key] !== undefined) {
        // Session fallback
        config.setState(savedSession[config.key]);
      } else {
        // Default value
        config.setState(config.defaultValue);
      }
    });

    hasInitialized.current = true;
  }, []); // Run once on mount

  // 2. Sync URL Changes to State (e.g. back/forward navigation)
  useEffect(() => {
    if (!hasInitialized.current || isSyncingUrl.current) return;

    filters.forEach((config) => {
      // Ignore sensitive keys when syncing from URL
      if (config.urlEnabled === false) return;

      const urlVal = searchParams.get(config.key);
      const activeStateStr = serializeVal(config, config.state);
      
      if (urlVal !== null) {
        const deserializedUrl = deserializeVal(config, urlVal);
        if (serializeVal(config, deserializedUrl) !== activeStateStr) {
          config.setState(deserializedUrl);
        }
      } else {
        // Parameter removed from URL, reset to default if state is different
        if (serializeVal(config, config.defaultValue) !== activeStateStr) {
          config.setState(config.defaultValue);
        }
      }
    });
  }, [searchParams]);

  // 3. Sync State Changes to URL and SessionStorage
  // We serialize key, state value, and urlEnabled to build a stable string dependency
  const filterStatesStr = JSON.stringify(
    filters.map(f => ({
      key: f.key,
      state: f.state,
      urlEnabled: f.urlEnabled
    }))
  );

  useEffect(() => {
    if (!hasInitialized.current) return;

    isSyncingUrl.current = true;
    
    // Only allow query parameters defined in filters and urlEnabled !== false
    const allowedKeys = new Set(
      filters.filter(f => f.urlEnabled !== false).map(f => f.key)
    );

    const newParams = new URLSearchParams();
    const sessionObj: Record<string, any> = {};

    filters.forEach((config) => {
      const stateStr = serializeVal(config, config.state);
      const defaultStr = serializeVal(config, config.defaultValue);

      // Save to session storage (always done, even if urlEnabled is false)
      sessionObj[config.key] = config.state;

      // Update URL search parameters only if urlEnabled !== false
      if (config.urlEnabled !== false) {
        if (config.state !== undefined && config.state !== null && stateStr !== '' && stateStr !== defaultStr) {
          newParams.set(config.key, stateStr);
        }
      }
    });

    // Save to sessionStorage
    sessionStorage.setItem(sessionKey, JSON.stringify(sessionObj));

    // Keep parameter ordering consistent (SEO-friendly)
    newParams.sort();

    // Check if params changed before updating to prevent infinite loops and history bloat.
    // Also removes any unknown query parameters by resetting URL params to only the allowed/synced ones.
    const currentParamsSorted = new URLSearchParams(searchParams);
    currentParamsSorted.sort();

    let hasDiff = false;
    
    // Check if there are keys in the URL that are not allowed or differ in value
    const currentKeys = Array.from(currentParamsSorted.keys());
    for (const key of currentKeys) {
      if (!allowedKeys.has(key)) {
        hasDiff = true;
        break;
      }
    }
    
    if (!hasDiff) {
      // Check if values differ for allowed keys
      for (const key of Array.from(allowedKeys)) {
        if (newParams.get(key) !== currentParamsSorted.get(key)) {
          hasDiff = true;
          break;
        }
      }
    }

    if (hasDiff) {
      setSearchParams(newParams);
    }
    
    isSyncingUrl.current = false;
  }, [filterStatesStr]);
}
