import React, { useEffect, useState } from 'react';

import '../../assets/css/routes/pages/accounts.css';
import SelectCurrency from '../../components/selectCurrency';

import editIcon from '../../assets/media/icons/icon-edit.svg';

import { useSpendContext } from '../../providers/spendProvider';

export default function AccountsPage() {
  const { account, accounts, setAccount, setAccounts, deleteAccount } = useSpendContext();
  const [newUser, setNewUser] = useState({
    username: '',
    currency: '€',
  });

  const [newUsername, setNewUsername] = useState('');
  const [editAccount, setEditAccount] = useState(false);
  const [addAccount, setAddAccount] = useState(false);
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
      <main className="accountsPage">
        <h2>Accounts</h2>

        <h3>
          {account.username} {'  '}
          <span className={account.balance >= 0 ? 'green' : 'red'}>
            {account.balance.toFixed(2)}
            {account.currency}
          </span>
          <input
            type="button"
            value=""
            className="imgBtn editBtn"
            style={{
              background: `no-repeat url('${editIcon}') center center/ contain`,
            }}
            onClick={() => {
              setEditAccount((old) => !old);
            }}
          />
        </h3>
        {editAccount && (
          <form
            className="accountForm"
            onSubmit={(e) => {
              e.preventDefault();
              newUsername && setAccount({ ...account, username: newUsername });
            }}
          >
            <SelectCurrency
              id="currency"
              className="currency"
              value={account.currency}
              onChange={(e) => setAccount({ ...account, currency: e.target.value })}
            />
            <input
              type="text"
              id="name"
              required
              className="name"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <input type="submit" className="update" value="Update" />

            <input
              type="button"
              value="Cancel"
              className="cancel"
              onClick={() => setEditAccount(false)}
            />
          </form>
        )}

        <ul className="accounts">
          {accounts.map((a) => (
            <li
              key={a.id}
              className={`account ${a.id == account.id ? 'active' : ''}`}
              onClick={() => setAccount(a)}
            >
              {a.username}
              <span className={`balance ${a.balance >= 0 ? 'green' : 'red'}`}>
                {a.balance.toFixed(2)}
                {a.currency}
              </span>
            </li>
          ))}

          {addAccount ? (
            <form onSubmit={addUser} className="accountForm">
              <SelectCurrency
                className="currency"
                id="newCurrency"
                value={newUser.currency}
                onChange={(e) => setNewUser({ ...newUser, currency: e.target.value })}
              />
              <input
                type="text"
                className="name"
                required
                id="username"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input type="submit" value="Add Account" className="update" />
              <input
                type="button"
                value="Cancel"
                className="cancel"
                onClick={() => setAddAccount(false)}
              />
            </form>
          ) : (
            <input
              type="button"
              value="Add Account"
              className="addUser mainBtn"
              onClick={() => setAddAccount(true)}
            />
          )}
        </ul>
        <input
          className="delete"
          type="button"
          onDoubleClick={deleteAccount}
          value={'Delete Account: ' + account.username}
        />
      </main>
    </>
  );
}
