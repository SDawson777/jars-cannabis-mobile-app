import * as Linking from 'expo-linking';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface CMSPreviewValue {
  preview: boolean;
  toggle?: () => void;
}

const CMSPreviewContext = createContext<CMSPreviewValue>({ preview: false });

export function CMSPreviewProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url && url.includes('preview=true')) setPreview(true);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggle = () => setPreview(p => !p);

  return (
    <CMSPreviewContext.Provider value={{ preview, toggle }}>{children}</CMSPreviewContext.Provider>
  );
}

export const useCMSPreview = () => useContext(CMSPreviewContext);
