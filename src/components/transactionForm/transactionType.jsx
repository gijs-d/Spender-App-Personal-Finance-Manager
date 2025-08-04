import React, { useEffect, useState, useRef } from 'react';

import SuggestInput from '../suggestInput';

export default function TransactionType({ types, formData, setFormData }) {
  const addType = () => {
    const { type } = formData;
    type.push('');
    setFormData({ ...formData, type });
  };

  const suggestTypes = (value, i) => {
    i = i < 0 ? 0 : i;
    const type = [...formData.type];
    //type[i] = value;
    const suggest = [
      ...new Set(
        types
          .filter(
            (t) =>
              t.split(',').slice(0, i).join(',')?.includes(type.slice(0, i).join(',')) &&
              t.split(',')?.at(i)?.includes(value)
          )
          .map((t) => t.split(',')[i])
      ),
    ];
    return suggest;
  };

  const updateSub = (e, i) => {
    const { type } = formData;
    type[i] = e.target.value;
    setFormData({ ...formData, type });
  };

  const updateType = (value, i) => {
    const type = [...formData.type];
    type[i] = value;
    setFormData({ ...formData, type });
  };

  const deleteSub = (i) => {
    const { type } = formData;
    type.splice(i, 1);
    setFormData({ ...formData, type });
  };

  return (
    <>
      <label htmlFor="type-0">Type:</label>
      {formData.type.slice(0).map((f, i) => (
        <div key={'subtype' + i} className="flex subType">
          <SuggestInput
            {...{
              ...{ value: formData.type[i] },
              placeholder: (i > 0 || '') && `Subtype ${i}`,
              onInput: (e) => updateType(e.target.value, i),
              suggest: (v = '') => suggestTypes(v, i),
              selectSuggestion: (v) => updateType(v, i),
            }}
          />
          {i > 0 && (
            <span className="delete" onClick={() => deleteSub(i)}>
              X
            </span>
          )}
        </div>
      ))}
      <input type="button" value="Add Subtype" onClick={addType} />
    </>
  );
}
