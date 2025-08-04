import React, { useEffect, useState, useRef } from 'react';

import '../../assets/css/routes/pages/items.css';

import Filter from '../../components/filter';

import { useSpendContext } from '../../providers/spendProvider';

export default function ItemsPage() {
  const { account, transactions } = useSpendContext();

  const [filterFunctions, setFilterFunctions] = useState([]);
  const [showItems, setShowItems] = useState({});
  const [sortOn, setSortOn] = useState('item');

  useEffect(() => {
    filterData();
  }, [filterFunctions, transactions]);

  const filterData = () => {
    let newData = transactions;
    if (filterFunctions.length) {
      newData = transactions.filter((t) => filterFunctions.reduce((acc, f) => acc && f(t), true));
    }
    processItems(newData);
  };

  const processItems = (filterdData) => {
    const allLists = filterdData.reduce(
      (a, t) =>
        t.list
          ? [...a, ...t.list.map((item) => ({ ...item, type: t.type, rate: Number(t.rate) || 1 }))]
          : a,
      []
    );

    const tempObj = allLists.reduce((a, item) => {
      a[item.item] = a[item.item] || {};
      const type = item.type.at(-1);
      a[item.item][type] = a[item.item][type] || {};
      const { rate } = item;
      if (!item.total) {
        item.total = Number(item.amount) * Number(item.price) * rate;
      } else {
        item.total *= rate;
      }
      Object.keys(item).forEach((key) => {
        if (['item', 'type', 'unit', 'rate'].includes(key)) {
          return;
        }
        if (['amount', 'total'].includes(key)) {
          a[item.item][type][key] = (a[item.item][type][key] || 0) + Number(item[key]);
          return;
        }
        a[item.item][type][key] = [...(a[item.item][type][key] || []), item[key] * rate];
      });
      return a;
    }, {});

    Object.keys(tempObj).map((item) => {
      let totalAmount = 0;
      let total = 0;
      Object.keys(tempObj[item]).map((type) => {
        tempObj[item][type].amount = Number(tempObj[item][type].amount.toFixed(3));
        tempObj[item][type].total = Number(tempObj[item][type].total.toFixed(2));
        totalAmount += tempObj[item][type].amount || 0;
        total += tempObj[item][type].total || 0;
        Object.keys(tempObj[item][type]).map((key) => {
          if (Array.isArray(tempObj[item][type][key])) {
            tempObj[item][type][key] = [...new Set(tempObj[item][type][key])].toSorted().join(', ');
          }
        });
      });
      tempObj[item].total = total;
      tempObj[item].totalAmount = totalAmount;
    });
    setShowItems(tempObj);
  };

  const sortData = (a, b) => {
    if (sortOn == 'item') {
      return a.localeCompare(b);
    }
    if (sortOn == 'total') {
      return showItems[b].total - showItems[a].total;
    }
  };

  return (
    <>
      <main className="itemsPage">
        <h2>Items {Object.keys(showItems).length}</h2>
        <Filter {...{ setFilterFunctions, itemFilter: true }} />
        <div>
          <div className="sort">
            <label htmlFor="sortOn">Sort:</label>
            <select id="sortOn" value={sortOn} onChange={(e) => setSortOn(e.target.value)}>
              <option value="item">item</option>
              <option value="total">total</option>
            </select>
          </div>
        </div>
        <h3 className="total green allTotal">
          {Object.keys(showItems)
            .reduce((a, b) => a + showItems[b].total, 0)
            .toFixed(2)}
          {account.currency}
        </h3>

        <section>
          {Object.keys(showItems)
            .toSorted(sortData)
            .map((item, i) => (
              <details key={i}>
                <summary>
                  <div>
                    <span className="green total">
                      {showItems[item].total.toFixed(2)}
                      {account.currency}
                    </span>
                    <span>{item}</span>
                    <span className="amount">{Number(showItems[item].totalAmount.toFixed(3))}</span>
                  </div>
                </summary>
                <div className="details">
                  {Object.keys(showItems[item])
                    .toSorted()
                    .filter((f) => !['totalAmount', 'total'].includes(f))
                    .map((store, ii) => (
                      <div key={ii} className="store">
                        <h4>{store}</h4>
                        <div>
                          {Object.keys(showItems[item][store])
                            .toSorted()
                            .map((key, iii) => (
                              <div key={iii}>
                                <p>
                                  {key}: {showItems[item][store][key]}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            ))}
        </section>
      </main>
    </>
  );
}
