import React, { useEffect, useState, useRef } from 'react';

//import '../assets/css/parts/pages.css';
import { useRateContext } from '../providers/rateProvider';

export default function SelectCurrency({ id, value, onChange }) {
  const { currencies } = useRateContext();

  return (
    <select id={id} value={value} onChange={onChange}>
      {currencies.map((c) => (
        <option key={'cur' + c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
