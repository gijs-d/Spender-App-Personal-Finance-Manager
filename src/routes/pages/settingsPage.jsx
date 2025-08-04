import React, { useEffect, useState } from 'react';

import '../../assets/css/routes/pages/settings.css';
import SelectCurrency from '../../components/selectCurrency';
import ToggleSwitch from '../../components/toggleSwitch';

import { useSpendContext } from '../../providers/spendProvider';
import { useRateContext } from '../../providers/rateProvider';
import { useSettingsContext } from '../../providers/settingsProvider';

export default function SettingsPage() {
  const { account, accounts, setAccount, setAccounts, deleteAccount } = useSpendContext();
  const { rates, setRates, currencies, setCurrencies } = useRateContext();
  const { settings, setSettings } = useSettingsContext();

  const [showAddRate, setShowAddRate] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    currency: '€',
  });

  const [newRate, setNewRate] = useState({
    from: currencies[0],
    to: currencies[0],
    amount: '',
  });
  const [newUsername, setNewUsername] = useState('');
  useEffect(() => {
    setNewUsername(account.username);
  }, [account]);

  const deleteRate = (i) => {
    const temp = rates;
    temp.splice(i, 1);
    setRates([...temp]);
  };

  const addNewRate = (e) => {
    e.preventDefault();
    setRates([...rates, [newRate.from, newRate.to, newRate.amount]]);
    setNewRate({ from: currencies[0], to: currencies[0], amount: '' });
  };

  const addUser = (e) => {
    e.preventDefault();
    if (accounts.includes(newUser)) {
      return;
    }
    const id = `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    setAccounts([
      ...accounts,
      { id, username: newUser.username, balance: 0, currency: newUser.currency },
    ]);
    setNewUser({ username: '', currency: '€' });
  };

  return (
    <>
      <main className="settingsPage">
        <h2>Settings</h2>
        <details>
          <summary>Options</summary>
          <div className="details">
            <p className="settingTitle">Main</p>
            <div className="flex">
              <label htmlFor="income">Show Income</label>
              <ToggleSwitch
                {...{
                  id: 'income',
                  value: settings.mainPage.showIncome,
                  onChange: (e) => {
                    setSettings((old) => {
                      const temp = { ...old };
                      temp.mainPage.showIncome = e.target.checked;
                      return temp;
                    });
                  },
                }}
              />
            </div>
            <div className="flex">
              <label htmlFor="second">Show Second Total</label>
              <label htmlFor="second" className="toggle">
                <input
                  type="checkbox"
                  id="second"
                  checked={settings.mainPage.showSecondTotal}
                  onChange={(e) => {
                    setSettings((old) => {
                      const temp = { ...old };
                      temp.mainPage.showSecondTotal = e.target.checked;
                      return temp;
                    });
                  }}
                />
                <span></span>
              </label>
            </div>
            {settings.mainPage.showSecondTotal && (
              <div className="flex">
                <label htmlFor="secondCurrency">Second Currency</label>
                <SelectCurrency
                  id="secondCurrency"
                  value={settings.mainPage.secondCurrency}
                  onChange={(e) =>
                    setSettings((old) => {
                      const temp = { ...old };
                      temp.mainPage.secondCurrency = e.target.value;
                      return temp;
                    })
                  }
                />
              </div>
            )}
          </div>
        </details>
        <details>
          <summary>Rates</summary>
          <div className="details">
            <label htmlFor="rates">Exchange rates:</label>
            <ul id="rates">
              {rates &&
                rates.map((rate, i) => (
                  <li key={`rate${rate.join('')}`} className="flex">
                    <p>{rate[0]}</p>
                    <p className="arrow">&rarr;</p>
                    <p>{rate[1]} </p>
                    <p>{rate[2]}</p>
                    <input
                      type="button"
                      value="X"
                      className="delete"
                      onClick={() => deleteRate(i)}
                    />
                  </li>
                ))}
            </ul>
            <details>
              <summary>Add Rate</summary>
              <form className="flex addForm" onSubmit={addNewRate}>
                <div>
                  <SelectCurrency
                    id="from"
                    value={newRate.from}
                    onChange={(e) => setNewRate({ ...newRate, from: e.target.value })}
                  />
                </div>
                <p className="arrow">&rarr;</p>
                <div>
                  <SelectCurrency
                    id="to"
                    value={newRate.to}
                    onChange={(e) => setNewRate({ ...newRate, to: e.target.value })}
                  />
                </div>
                <input
                  type="number"
                  className="amount"
                  placeholder="0.0"
                  value={newRate.amount}
                  onChange={(e) => setNewRate({ ...newRate, amount: e.target.value })}
                  required
                />
                <input type="submit" value="Add" />
              </form>
            </details>
          </div>
        </details>
      </main>
    </>
  );
}
