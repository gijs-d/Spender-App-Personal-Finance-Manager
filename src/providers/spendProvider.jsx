import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import DB from '../lib/db';

const spendContext = createContext(null);

export function SpendProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState({ currency: '€', balance: 0 });
  const [accounts, setAccounts] = useState([]);
  const [db, setDB] = useState();
  const accountDB = new DB({ accounts: 'id' }, 'accountsDB');

  useEffect(() => {
    if (!account.id) {
      loadAccounts();
      return;
    }
    const i = accounts.findIndex((a) => a.id == account.id);
    const tempAccs = accounts;
    tempAccs[i] = account;
    setAccounts(tempAccs);
    if (!db || db.dbName != account.id) {
      setDB(new DB({ transactions: 'id' }, account.id));
    } else {
      accountDB.put(accountDB.stores.accounts, account);
    }
  }, [account]);

  useEffect(() => {
    if (!db) {
      return;
    }
    loadTransactions(true);
  }, [db]);

  const changeAccount = (newAccount) => {
    localStorage.setItem('activeAccount', newAccount.id);
    setDB(new DB({ transactions: 'id' }, newAccount.id));
    setAccount(newAccount);
  };

  const loadAccounts = async () => {
    const savedAccounts = await accountDB?.getAll(accountDB?.stores.accounts);
    if (!savedAccounts?.length) {
      const newAccount = makeAccount();
      accountDB.put(accountDB.stores.accounts, newAccount);
      setAccount(newAccount);
      setAccounts([newAccount]);
      localStorage.setItem('activeAccount', newAccount.id);
      return;
    }
    const saved = localStorage.getItem('activeAccount');
    setAccount(savedAccounts.find((a) => a.id === saved) || savedAccounts[0]);
    setAccounts(savedAccounts);
  };

  const makeAccount = (username) => {
    const id = `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    return { id, username: username || 'user1', balance: 0, currency: '€' };
  };

  const deleteAccount = () => {
    const { id } = account;
    if (!id) {
      return;
    }
    const filterdAccounts = accounts.filter((a) => a.id != id);
    accountDB.delete(accountDB.stores.accounts, id);
    accountDB.deleteDatabase(id);
    if (filterdAccounts.length) {
      setAccounts(filterdAccounts);
      localStorage.setItem('activeAccount', filterdAccounts[0].id);
      return setAccount(filterdAccounts[0]);
    }
    const newAccount = makeAccount('user' + Math.random().toString().slice(-1));
    localStorage.setItem('activeAccount', newAccount.id);
    setAccount(newAccount);
    setAccounts([newAccount]);
  };

  const loadTransactions = async (refresh) => {
    const savedTransactions = await db?.getAll(db?.stores.transactions);
    if (savedTransactions?.length) {
      return setTransactions(savedTransactions);
    }
    if (refresh) {
      setTransactions([]);
    }
  };

  const updateData = (newData) => {
    const i = accounts.findIndex((a) => a.id == newData.id);
    const tempAccs = accounts;
    tempAccs[i] = newData;
    accountDB.put(accountDB.stores.accounts, newData);
    setAccounts(tempAccs);
    setAccount(newData);
  };

  const addTransaction = async (transaction) => {
    transaction.amount = Number(transaction.amount);
    const newTransactions = [
      ...transactions.filter((t) => t.id != transaction.id),
      transaction,
    ].toSorted((a, b) => a.time - b.time);
    const saved = db.put(db.stores.transactions, transaction);
    if (!saved) {
      return;
    }
    setTransactions(newTransactions);
    updateData({
      ...account,
      balance: newTransactions.reduce((acc, t) => acc + (t.earned ? 1 : -1) * t.amount, 0),
    });
  };

  const deleteTransaction = async (id) => {
    const deleted = await db.delete(db.stores.transactions, id);
    if (!deleted) {
      return;
    }
    const temp = [...transactions].filter((t) => t.id != id);
    updateData({
      ...account,
      balance: temp.reduce((acc, t) => acc + (t.earned ? 1 : -1) * t.amount, 0),
    });
    setTransactions(temp);
  };

  return (
    <spendContext.Provider
      value={{
        accounts,
        setAccounts,
        account,
        setAccount: changeAccount,
        deleteAccount,
        transactions,
        setTransactions: {
          addTransaction,
          deleteTransaction,
        },
        db,
      }}
    >
      {children}
    </spendContext.Provider>
  );
}

export function useSpendContext() {
  return useContext(spendContext);
}
