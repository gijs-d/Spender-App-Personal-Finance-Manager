import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import DB from '../lib/db';

const rateContext = createContext(null);

export function RateProvider({ children }) {
  const [rates, setRates] = useState([['€', '₱', 61.25]]);
  const [currencies, setCurrencies] = useState(['€', '₱']);

  useEffect(() => {
    loadStates();
  }, []);

  const setNewRates = (newRates) => {
    saveStates(newRates, currencies);
    setRates(newRates);
  };

  const setNewCurrencies = (newCurrencies) => {
    saveStates(rates, newCurrencies);
    setCurrencies(newCurrencies);
  };

  const saveStates = (saveRates, saveCurrencies) => {
    localStorage.setItem('rates', JSON.stringify({ rates: saveRates, currencies: saveCurrencies }));
  };

  const loadStates = () => {
    const saved = localStorage.getItem('rates');
    if (saved) {
      const data = JSON.parse(saved);
      setCurrencies(data.currencies);
      setRates(data.rates);
    }
  };

  return (
    <rateContext.Provider
      value={{
        rates,
        setRates: setNewRates,
        currencies,
        setCurrencies: setNewCurrencies,
      }}
    >
      {children}
    </rateContext.Provider>
  );
}

export function useRateContext() {
  return useContext(rateContext);
}
