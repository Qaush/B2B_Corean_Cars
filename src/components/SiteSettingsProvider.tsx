"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  whatsappNumber: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: "38344647559",
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings({ whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber }))
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
