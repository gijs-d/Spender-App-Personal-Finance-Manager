import React, { useEffect, useState, useRef } from 'react';

import '../../assets/css/components/transactionForm.css';
import { useSpendContext } from '../../providers/spendProvider';

import ToggleSwitch from '../toggleSwitch';
import TransactionType from './transactionType';
import TransactionTime from './transactionTime';
import TransactionCurrency from './transactionCurrency';
import TransactionList from './transactionList';

export default function TransactionForm({ setShowAddForm, btnText, startState, update }) {
  const { account, transactions, setTransactions, db } = useSpendContext();
  const [formData, setFormData] = useState(
    startState || {
      now: true,
      time: '',
      earned: false,
      type: [''],
      title: '',
      description: '',
      list: false,
      amount: '',
      currency: account.currency,
      rate: '',
      reverse: false,
    }
  );
  const [types, setTypes] = useState([]);

  useEffect(() => {
    if (!transactions.length) {
      setTypes([]);
      return;
    }
    const type = [
      ...transactions.reduce((acc, t) => {
        acc.add(t.type.join(','));
        return acc;
      }, new Set()),
    ];

    setTypes(type);
  }, [transactions]);

  const submitForm = (e) => {
    e.preventDefault();
    let newTransaction = { ...formData };
    let time = formData.time;
    if (formData.now) {
      time = Date.now();
    }
    const extra = {};
    if (formData.rate) {
      extra['oldAmount'] = formData.amount;
      extra['amount'] = (
        (formData.amount || 0) * Math.pow(formData.rate || 0, formData.reverse ? -1 : 1)
      ).toFixed(2);
    }
    if (!update) {
      const id = time + Math.random().toString(36).slice(4);
      newTransaction = { ...formData, time, id, ...extra };
      setTransactions.addTransaction(newTransaction);
    }
    setTransactions.addTransaction({ ...newTransaction, time, ...extra });
    setShowAddForm(false);
    setFormData(
      startState || {
        now: true,
        time: '',
        earned: false,
        type: [''],
        title: '',
        description: '',
        list: false,
        amount: '',
        currency: account.currency,
        rate: '',
        reverse: false,
      }
    );
  };

  const updateForm = (e) => {
    const { id, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [id]: type == 'checkbox' ? checked : value,
    });
  };

  return (
    <form onSubmit={submitForm} className="transactionForm">
      <div className="formTitle">
        <h3 className={formData.earned ? 'green' : 'red'}>Add Transaction</h3>
        <input
          type="button"
          value="X"
          onClick={() => setShowAddForm(false)}
          className="closeForm"
        />
      </div>
      <div className="flex">
        <label htmlFor="earned" className={formData.earned ? 'green' : 'red'}>
          Earned:
        </label>
        <ToggleSwitch {...{ id: 'earned', value: formData.earned, onChange: updateForm }} />
      </div>
      <TransactionTime {...{ formData, setFormData, updateForm }} />
      <TransactionType {...{ types, formData, setFormData }} />
      <details>
        <summary>Info</summary>
        <div className="details">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" value={formData.title} onInput={updateForm} />
          <label htmlFor="description">Description</label>
          <textarea id="description" value={formData.description} onInput={updateForm}></textarea>
        </div>
      </details>
      <TransactionList {...{ formData, setFormData, transactions }} />
      <label htmlFor="amount">{formData.list && 'Total '}Amount:</label>
      <input
        type="number"
        id="amount"
        readOnly={formData.list}
        value={formData.amount}
        onInput={updateForm}
        required
      />
      <TransactionCurrency {...{ account, formData, setFormData, updateForm }} />
      <input type="submit" value={btnText || 'Add'} />
    </form>
  );
}
