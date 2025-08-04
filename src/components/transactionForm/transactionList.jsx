import React, { useEffect, useState, useRef } from 'react';

import SuggestInput from '../suggestInput';
import ToggleSwitch from '../toggleSwitch';

export default function TransactionList({ formData, setFormData, transactions }) {
  const newItem = { amount: 1, item: '', price: '', unit: 'pcs', total: '', type: '' };
  const [useList, setUseList] = useState(!!formData.list);
  const [list, setList] = useState(formData.list || [{ ...newItem }]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState({});
  const [allTypes, setAllTypes] = useState([]);
  const [focusedItem, setFocusedItem] = useState(-1);
  const focusedItemRef = useRef(false);

  useEffect(() => {
    let { amount } = formData;
    if (useList) {
      amount = calculateTotal();
    }
    setFormData({ ...formData, list: useList && list, amount });
  }, [useList]);

  useEffect(() => {
    if (!useList) {
      return;
    }
    const amount = calculateTotal();
    setFormData({ ...formData, list, amount });
  }, [list]);

  useEffect(() => {
    getAllItemsFromTransactions();
  }, [transactions]);

  const getAllItemsFromTransactions = () => {
    const types = new Set();
    const itemNames = new Set();
    const allLists = transactions.reduce((a, t) => (t.list ? [...a, ...t.list] : a), []);
    const tempObj = allLists.reduce((a, item) => {
      a[item.item] = a[item.item] || {};
      item.type && types.add(item.type);
      item.item && itemNames.add(item.item);
      Object.keys(item).forEach((key) => {
        if (['item', 'amount', 'total', 'price'].includes(key)) {
          return;
        }
        a[item.item][key] = [...(a[item.item][key] || []), item[key]];
      });
      return a;
    }, {});
    Object.keys(tempObj).map((item) => {
      Object.keys(tempObj[item]).map((key) => {
        let maxCount = [0, ''];
        const freq = {};
        tempObj[item][key]
          .filter((f) => f)
          .forEach((v) => {
            freq[v] = (freq[v] || 0) + 1;
            if (freq[v] > maxCount[0]) {
              maxCount = [freq[v], v];
            }
          });
        tempObj[item][key] = maxCount[1];
      });
    });
    setAllItems(tempObj);
    setItems([...itemNames]);
    setAllTypes([...types]);
  };

  const calculateTotal = () => {
    return Number(
      list
        .reduce((a, b) => {
          if (b.unit == 'kg') {
            return a + Number(b.total);
          }
          return a + Number((b.price * b.amount).toFixed(2));
        }, 0)
        .toFixed(2)
    );
  };

  const addItem = () => {
    setList([...list, { ...newItem }]);
  };

  const deleteItem = (i) => {
    const tempList = [...list];
    tempList.splice(i, 1);
    setList(tempList);
  };

  const updateItem = (i, key, value) => {
    const tempList = [...list];
    const item = tempList[i];
    if (key == 'amount' || key == 'price' || key == 'total') {
      value = value === '' ? '' : Number(value);
    }
    if (key == 'unit' && value == 'kg') {
      item.total = Number((item.price * item.amount).toFixed(2));
    }
    item[key] = value;
    if (item.unit == 'kg' && (key == 'amount' || key == 'price')) {
      if (key == 'amount') {
        item.total = Number((item.price * value).toFixed(2));
      }
      if (key == 'price') {
        item.amount = Number((item.total / value).toFixed(3));
      }
    }

    setList(tempList);
  };

  const selectSugestItem = (value, i) => {
    const tempList = [...list];
    tempList[i].item = value;
    if (allItems[value]) {
      Object.keys(allItems[value]).forEach((k) => {
        if (['amount', 'price', 'total'].includes(k)) {
          return;
        }
        tempList[i][k] = allItems[value][k];
      });
    }
    setList(tempList);
  };

  const sugestPrice = (i = showSugestItem) => {
    const { item } = list[i];
    const { type } = formData;
    const prices = [
      ...transactions
        .filter(
          (t) =>
            t.list && t.type.toString() == type.toString() && t.list.find((l) => l.item == item)
        )
        .reduce((a, b) => {
          a.add(b.list.find((l) => l.item == item).price);
          return a;
        }, new Set()),
    ];
    return prices;
  };

  const changeTotal = (i, value) => {
    const tempList = [...list];
    tempList[i].total = value === '' ? '' : Number(value);
    tempList[i].amount = Number((value / tempList[i].price).toFixed(3));
    setList(tempList);
  };

  const focusItem = (i) => {
    setFocusedItem(i);
  };

  const blurItem = (e) => {
    if (focusedItemRef.current && !focusedItemRef.current.contains(e.relatedTarget)) {
      setFocusedItem(-1);
    }
  };

  return (
    <>
      <div className="flex">
        <label htmlFor="list">List:</label>
        <ToggleSwitch
          {...{ id: 'list', value: useList, onChange: (e) => setUseList(e.target.checked) }}
        />
      </div>
      {useList && (
        <>
          {list.map((l, i) => (
            <div
              key={'listItem' + i}
              onFocus={() => {
                focusItem(i);
              }}
              onBlur={blurItem}
            >
              <div className="flex listItem">
                <input
                  type="number"
                  value={l.amount}
                  placeholder="Qty"
                  className="listItemAmount"
                  onInput={(e) => updateItem(i, 'amount', e.target.value)}
                />
                <SuggestInput
                  className="listItemName"
                  {...{
                    ...{ placeholder: 'Item', value: l.item },
                    onInput: (e) => updateItem(i, 'item', e.target.value),
                    suggest: (v = '') => items.filter((item) => item.includes(v)),
                    selectSuggestion: (v) => selectSugestItem(v, i),
                  }}
                />
                <SuggestInput
                  className="listItemPrice"
                  type="number"
                  {...{
                    ...{ placeholder: 'Price', value: l.price },
                    onInput: (e) => updateItem(i, 'price', e.target.value),
                    suggest: () => sugestPrice(i),
                    selectSuggestion: (v) => updateItem(i, 'price', v),
                  }}
                />
                {l.unit == 'kg' && (
                  <>
                    <input
                      className="itemTotal"
                      type="number"
                      value={l.total}
                      onInput={(e) => {
                        changeTotal(i, e.target.value);
                      }}
                      placeholder="Total"
                    />
                  </>
                )}
                <span className="delete" onClick={() => deleteItem(i)}>
                  X
                </span>
              </div>
              {focusedItem == i && (
                <div className="flex " tabIndex={0} ref={focusedItemRef}>
                  <SuggestInput
                    className="listItemType"
                    {...{
                      ...{ placeholder: 'Type', value: l.type || '' },
                      onInput: (e) => updateItem(i, 'type', e.target.value),
                      suggest: (v = '') => {
                        console.log(v);
                        const s = allTypes.filter((type) => type.includes(v));
                        return s;
                      },
                      selectSuggestion: (v) => updateItem(i, 'type', v),
                    }}
                  />
                  {/* <input
                    type="text"
                    placeholder="Type"
                    value={l.type}
                    onInput={(e) => updateItem(i, 'type', e.target.value)}
                  /> */}
                  <select
                    value={l.unit}
                    onChange={(e) => updateItem(i, 'unit', e.target.value)}
                    className="itemUnit"
                  >
                    <option value="pcs">/pcs</option>
                    <option value="kg">/kg</option>
                  </select>
                </div>
              )}
            </div>
          ))}

          <input type="button" value="Add Item" onClick={addItem} />
        </>
      )}
    </>
  );
}
