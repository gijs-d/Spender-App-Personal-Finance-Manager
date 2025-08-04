import React, { useContext, useEffect, useState } from 'react';
import { useSpendContext } from '../../providers/spendProvider';
import Filter from '../../components/filter';

import '../../assets/css/routes/pages/transactions.css';
import trashIcon from '../../assets/media/icons/icon-trash.svg';
import editIcon from '../../assets/media/icons/icon-edit.svg';
import TransactionForm from '../../components/transactionForm';

export default function TransactionsPage() {
  const { account, transactions, setTransactions, db } = useSpendContext();

  const [total, setTotal] = useState(0);
  const [filterdData, setFilterdData] = useState([]);
  const [filterFunctions, setFilterFunctions] = useState([]);
  const [editData, setEditData] = useState(false);

  useEffect(() => {
    if (!transactions?.length) {
      setTotal(0);
      setFilterdData([]);
      return;
    }
    filterData();
  }, [filterFunctions, transactions]);

  const filterData = () => {
    let newData = transactions;
    if (filterFunctions.length) {
      newData = transactions.filter((t) => filterFunctions.reduce((acc, f) => acc && f(t), true));
    }
    setTotal(newData.reduce((acc, t) => acc + (t.earned ? 1 : -1) * t.amount, 0));
    setFilterdData(newData.toSorted((a, b) => b.time - a.time));

    //return transactions.filter((t) => filters.reduce((res, f) => res && t[f[0]] == f[1]));
  };

  const deleteTransaction = async (e) => {
    const id = e.target.closest('li').id.split('-')[1];
    setTransactions.deleteTransaction(id);
  };

  const editTransaction = async (t) => {
    setEditData({
      ...t,
      now: false,
      amount: t.oldAmount || t.amount,
      date: formatDate(t.time),
      hours: new Date(t.time).toTimeString().slice(0, 5),
    });
  };

  const formatDate = (date) => {
    date = new Date(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const pad = (nr) => String(nr).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  };
  return (
    <>
      <main className="transactionsPage">
        <h2>Transactions {filterdData.length}</h2>
        <Filter {...{ setFilterFunctions }} />
        <h3 className={'total ' + (total >= 0 ? 'green' : 'red')}>
          {total.toFixed(2)}
          {account.currency}
        </h3>

        {editData && (
          <TransactionForm
            {...{
              setShowAddForm: (show) => setEditData(show),
              btnText: 'Save',
              startState: editData,
              update: true,
            }}
          />
        )}
        <ul className="transactions">
          {!transactions.length ? (
            <li>No transactions yet</li>
          ) : (
            filterdData.map((t) => (
              <li
                key={t.id}
                id={'id-' + t.id}
                className={'transaction ' + (editData.id == t.id ? 'active' : '')}
              >
                <details>
                  <summary>
                    <div className="transactionSummary">
                      <p className={'amount ' + (t.earned ? 'green' : 'red')}>
                        {((t.earned ? 1 : -1) * t.amount).toFixed(2)}
                        {account.currency}
                      </p>
                      <p className="types">{t.type.join(', ')}</p>
                      <p>
                        {new Date(t.time).toLocaleDateString([], {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </summary>
                  <div className="transactionDetails">
                    <div className="imgBtns">
                      <input
                        type="button"
                        value=""
                        className="imgBtn editBtn"
                        style={{
                          backgroundImage: `url('${editIcon}')`,
                        }}
                        onClick={() => editTransaction(t)}
                      />
                      <input
                        type="button"
                        value=""
                        className="imgBtn deleteBtn"
                        style={{
                          backgroundImage: `url('${trashIcon}')`,
                        }}
                        onDoubleClick={deleteTransaction}
                      />
                    </div>
                    <div className="info">
                      <p className="center">{t.type.join(', ')}</p>
                      <br />
                      <p>{new Date(t.time).toLocaleString()}</p>
                      <br />
                      <p>{t.title}</p>
                      {t.title && <br />}
                      <p>{t.description}</p>
                      {t.description && <br />}
                      {t.list && (
                        <details className="listDetails">
                          <summary>List</summary>
                          <table className="listTable">
                            {t.list.map((l, i) => (
                              <tr key={'listItem' + i}>
                                <td>{l.amount}</td>
                                <td>{l.item}</td>
                                <td>
                                  {(l.price || 0).toFixed(2)}
                                  {t.currency}
                                </td>
                                <td>
                                  {(l.total || l.amount * l.price).toFixed(2)}
                                  {t.currency}
                                </td>
                              </tr>
                            ))}
                          </table>
                        </details>
                      )}
                      {t.currency !== account.currency && (
                        <>
                          <p>
                            {t.oldAmount}
                            {t.currency} {t.reverse ? '/' : 'x'} {t.rate}
                          </p>
                          <p></p>
                        </>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            ))
          )}
        </ul>
      </main>
    </>
  );
}
