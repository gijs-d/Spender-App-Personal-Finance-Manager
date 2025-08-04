import React, { useContext, useEffect, useState } from 'react';

import { useSpendContext } from '../../providers/spendProvider';
import { useSettingsContext } from '../../providers/settingsProvider';
import { useRateContext } from '../../providers/rateProvider';
import '../../assets/css/routes/pages/main.css';

import ChartLw from '../../components/chart/chartlw';
import Chartjs from '../../components/chart/chartjs';
import TransactionForm from '../../components/transactionForm';

export default function MainPage() {
  const { account, transactions, setTransactions } = useSpendContext();
  const { rates } = useRateContext();
  const { settings } = useSettingsContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([[], []]);
  const [secondTotal, setSecondTotal] = useState(0);
  const [showSecondTotal, setShowSecondTotal] = useState(false);

  useEffect(() => {
    setChartData(loadChartData());
    makeBarData();

    if (
      settings.mainPage.showSecondTotal &&
      settings.mainPage.secondCurrency !== account.currency
    ) {
      calculateSecondTotal();
    }
  }, [transactions]);

  const calculateSecondTotal = () => {
    const rate = searchRate(account.currency, settings.mainPage.secondCurrency);
    setSecondTotal(account.balance * (rate.reverse ? 1 / rate.rate : rate.rate));
    setShowSecondTotal(true);
  };

  const searchRate = (from, to) => {
    const rate = rates.find((r) => r.includes(from) && r.includes(to));
    const reverse = rate[0] == to;
    return { rate: Number(rate[2]), reverse };
  };

  const makeBarData = () => {
    setBarData([makeDataset(true), makeDataset(false)]);
  };

  const loadChartData = () => {
    if (!transactions?.length) {
      return [];
    }
    let total = 0;
    const data = transactions
      .toSorted((a, b) => a.time - b.time)
      .map((t) => {
        const { time, amount, earned } = t;
        const last = total;
        total += (earned ? 1 : -1) * Number(amount);
        const timezoneOffset = new Date().getTimezoneOffset() * -60;
        return {
          time: Math.floor(time / 1000) + timezoneOffset,
          open: last,
          low: Math.min(last, total),
          high: Math.max(last, total),
          close: total,
        };
      })
      .reduce((a, b) => {
        a[b.time] = {
          time: b.time,
          open: a[b.time]?.open || b.open,
          low: Math.min(b.low, a[b.time]?.low || b.low),
          high: Math.max(b.high, a[b.time]?.high || b.high),
          close: b.close,
        };
        return a;
      }, {});
    return Object.values(data);
  };

  const addTransaction = (transaction) => {
    setTransactions.addTransaction(transaction);
    setShowAddForm(false);
  };

  const makeDataset = (earned) => {
    if (!transactions.length) {
      return {
        label: earned ? 'earned' : 'spend',
        labels: [],
        data: [],
      };
    }
    let groupTypes = transactions.reduce((acc, t) => {
      acc[t.type[0]] = (acc[t.type[0]] || 0) + (t.earned ? 1 : -1) * Number(t.amount);
      return acc;
    }, {});
    groupTypes = Object.entries(groupTypes)
      .filter((t) => earned == t[1] >= 0)
      .map((t) => [t[0], Math.abs(t[1])])
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 5);
    if (earned) {
      groupTypes.reverse();
    }
    const colors = new Array(6).fill(earned ? '#00ff00' : '#ff0000');
    return {
      label: earned ? 'earned' : 'spend',
      labels: groupTypes.map((t) => t[0]),
      data: groupTypes.map((t) => t[1]),
      backgroundColor: colors.map((c) => `${c}22`),
      borderColor: colors.map((c) => `${c}`),
      total: groupTypes.reduce((a, b) => a + b[1], 0),
    };
  };

  return (
    <>
      <main className="mainPage">
        <div className="chartlwDiv">
          <ChartLw {...{ chartData }} />
        </div>
        <section>
          <div>
            <h1 className={account.balance >= 0 ? 'green' : 'red'}>
              {account.balance.toFixed(2)}
              {account.currency}
            </h1>
            {showSecondTotal && (
              <p className={'secondTotal ' + (account.balance >= 0 ? 'green' : 'red')}>
                {secondTotal.toFixed(2)}
                {settings.mainPage.secondCurrency}
              </p>
            )}
          </div>

          <div className="addForm">
            <div className="addFormBtn">
              <input
                type="button"
                className="addBtn"
                value="Add Transaction"
                onClick={() => setShowAddForm(!showAddForm)}
              />
            </div>

            {showAddForm && <TransactionForm {...{ addTransaction, setShowAddForm }} />}
          </div>
        </section>

        <div className="flex chartjsDivs">
          {settings.mainPage.showIncome && (
            <div className="chartjsDiv">
              <h3 className={'total ' + ((barData[0]?.total || 0) >= 0 ? 'green' : 'red')}>
                {(barData[0]?.total || 0).toFixed(2)}
                {account.currency}
              </h3>
              <Chartjs {...{ dataset: barData[0] }} />
            </div>
          )}

          <div className="chartjsDiv">
            <h3 className={'total ' + ((barData[1]?.total || 0) >= 0 ? 'red' : 'green')}>
              -{(barData[1]?.total || 0).toFixed(2)}
              {account.currency}
            </h3>
            <Chartjs {...{ dataset: barData[1] }} />
          </div>
        </div>
      </main>
    </>
  );
}
