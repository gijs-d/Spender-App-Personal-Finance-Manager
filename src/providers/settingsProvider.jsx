import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import DB from '../lib/db';

const settingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    mainPage: {
      showIncome: false,
      showSecondTotal: true,
      secondCurrency: '€',
    },
  });

  const skipSave = useRef(true);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveStates();
  }, [settings]);

  useEffect(() => {
    loadStates();
  }, []);

  const saveStates = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
  };

  const loadStates = () => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const data = JSON.parse(saved);
      skipSave.current = true;
      setSettings(data);
    }
  };

  return (
    <settingsContext.Provider
      value={{
        settings,
        setSettings,
      }}
    >
      {children}
    </settingsContext.Provider>
  );
}

export function useSettingsContext() {
  return useContext(settingsContext);
}
