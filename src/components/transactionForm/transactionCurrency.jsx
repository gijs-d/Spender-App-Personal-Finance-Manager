import React, { useEffect, useState, useRef } from 'react';
import SelectCurrency from '../selectCurrency';
import { useRateContext } from '../../providers/rateProvider';

export default function TransactionCurrency({ account, formData, setFormData, updateForm }) {
  const { currencies, rates } = useRateContext();

  const updateFormCurrency = (e) => {
    const { id, value } = e.target;
    let newData = {
      ...formData,
      [id]: value,
    };
    if (account.currency != value) {
      newData = { ...newData, ...searchRate(account.currency, value) };
    } else {
      newData = { ...newData, rate: '', reverse: false };
    }
    setFormData(newData);
  };

  const searchRate = (from, to) => {
    const rate = rates.find((r) => r.includes(from) && r.includes(to));
    const reverse = rate[0] == from;
    return { rate: Number(rate[2]), reverse };
  };
  return (
    <>
      <label htmlFor="currency">Currency</label>
      <SelectCurrency id="currency" value={formData.currency} onChange={updateFormCurrency} />
      {formData.currency != account.currency && (
        <>
          <label htmlFor="rate">Exchange rate:</label>
          <div className="flex">
            <input
              type="number"
              id="rate"
              value={formData.rate}
              onChange={updateForm}
              placeholder={`${account.currency} to ${formData.currency}`}
            />
            <select id="reverse" value={formData.reverse} onChange={updateForm}>
              <option value={true}>{`${account.currency} -> ${formData.currency}`}</option>
              <option value={false}>{`${formData.currency} -> ${account.currency}`}</option>
            </select>
          </div>

          <p className="newAmount">
            total:
            {' ' +
              (
                (formData.amount || 0) * Math.pow(formData.rate || 0, formData.reverse ? -1 : 1)
              ).toFixed(2)}
            {account.currency}
          </p>
        </>
      )}
    </>
  );
}
