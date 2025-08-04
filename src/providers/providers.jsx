import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { SpendProvider } from './spendProvider';
import { RateProvider } from './rateProvider';
import { SettingsProvider } from './settingsProvider';

const providers = [SpendProvider, RateProvider, SettingsProvider];

export function Providers({ children }) {
  const wrapWithProviders = (content) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, content);
  };

  return wrapWithProviders(children);
}
