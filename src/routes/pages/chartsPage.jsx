import React, { useContext, useEffect, useState, useRef } from 'react';
import { useSpendContext } from '../../providers/spendProvider';
import Filter from '../../components/filter';
import Chartjs from '../../components/chart/chartjs';
import ToggleSwitch from '../../components/toggleSwitch';
import '../../assets/css/routes/pages/charts.css';

export default function ChartsPage() {
  const { account, transactions } = useSpendContext();
  const dataRef = useRef(transactions);
  const [total, setTotal] = useState(0);
  const [filterdData, setFilterdData] = useState([]);
  const [filterFunctions, setFilterFunctions] = useState([]);
  const [barData, setBarData] = useState({ label: '', labels: [], data: [], total: 0 });
  const [chartType, setChartType] = useState('doughnut');
  const [parsedData, setParsedData] = useState([]);
  const [typeDepth, setTypeDepth] = useState(1);
  const [maxDepth, setMaxDepth] = useState(1);
  const [showItemTypes, setShowItemTypes] = useState(false);

  useEffect(() => {
    if (!transactions?.length) {
      setTotal(0);
      setFilterdData([]);
      return;
    }
    filterData();
  }, [filterFunctions, transactions]);

  useEffect(() => {
    const data = showItemTypes ? parseItemData() : parseTransactionData();
    setBarData(makeDataset(data));
  }, [filterdData, chartType, typeDepth, showItemTypes]);

  const filterData = () => {
    let newData = transactions;
    if (filterFunctions.length) {
      newData = transactions.filter((t) => filterFunctions.reduce((acc, f) => acc && f(t), true));
    }
    setFilterdData(newData);
  };

  const parseTransactionData = () => {
    setTotal(filterdData.reduce((acc, t) => acc + (t.earned ? 1 : -1) * t.amount, 0));
    if (!filterdData.length) {
      return [];
    }
    let max = 0;
    let groupTypes = filterdData.reduce((acc, t) => {
      max = Math.max(max, t.type.length);
      acc[t.type.join(', ')] =
        (acc[t.type.join(', ')] || 0) + (t.earned ? 1 : -1) * Number(t.amount);
      return acc;
    }, {});
    setMaxDepth(max);
    groupTypes = Object.entries(groupTypes).toSorted((a, b) => b[0].localeCompare(a[0])); //.toSorted((a, b) => b[1] - a[1]);
    setParsedData(groupTypes);
    return groupTypes;
  };

  const parseItemData = () => {
    const allItems = filterdData
      .reduce((a, t) => (t.list ? [...a, ...t.list.filter((f) => f.type)] : a), [])
      .reduce((a, item) => {
        a[item.type] =
          (a[item.type] || 0) +
          Number(item.total || Number(item.amount) * Number(item.price).toFixed(2));
        return a;
      }, {});
    const itemData = Object.entries(allItems);
    setParsedData(itemData);
    return itemData;
  };

  const makeDataset = (data) => {
    if (!data.length) {
      return {
        label: '',
        labels: [],
        data: [],
        total: 0,
      };
    }
    let groupTypes = data;
    if (typeDepth) {
      groupTypes = data.reduce((acc, p) => {
        const id = p[0].split(', ').slice(0, typeDepth).join(', ');
        acc[id] = (acc[id] || 0) + p[1];
        return acc;
      }, {});
      groupTypes = Object.entries(groupTypes).toSorted((a, b) => b[0].localeCompare(a[0]));
    }
    if (groupTypes.length == 1 && typeDepth < maxDepth) {
      setTypeDepth(typeDepth + 1);
    }
    return {
      label: '',
      type: chartType,
      labels: groupTypes.map((t) => t[0]),
      data: groupTypes.map((t) => t[1]),
      total: groupTypes.reduce((a, b) => a + b[1], 0),
      keepColor: true,
    };
  };

  return (
    <>
      <main className="chartsPage">
        <div className="top">
          <h2>Charts {parsedData.length}</h2>
          <Filter {...{ setFilterFunctions, itemFilter: showItemTypes }} />
          <div className="chartSettings">
            <div className="flex chartType">
              <label htmlFor="showType">Transactions</label>
              <ToggleSwitch
                {...{
                  id: 'showType',
                  value: showItemTypes,
                  onChange: (e) => setShowItemTypes(e.target.checked),
                }}
              />
              <label htmlFor="showType">Items</label>
            </div>
            <div className="flex chartType">
              <label htmlFor="type">Chart Type:</label>
              <select id="type" selected={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="doughnut">doughnut</option>
                <option value="bar">bar</option>
                <option value="pie">pie</option>
              </select>
            </div>
            {!showItemTypes && (
              <div className="flex">
                <label htmlFor="depth">Type Depth: {typeDepth}</label>
                <input
                  id="depth"
                  type="range"
                  min={0}
                  max={maxDepth}
                  step={1}
                  selected={typeDepth}
                  onChange={(e) => setTypeDepth(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <h3 className={barData.total >= 0 ? 'green' : 'red'}>
            {barData.total.toFixed(2)}
            {account.currency}
          </h3>
        </div>
        <div className="chartDiv">
          <Chartjs {...{ dataset: barData }} />
        </div>
      </main>
    </>
  );
}
