import React, { useEffect, useState, useRef } from 'react';

import ToggleSwitch from '../toggleSwitch';

export default function TransactionForm({ formData, setFormData, updateForm }) {
  const updateFormTime = (e) => {
    const { id, value, checked, type } = e.target;
    if (id != 'date' && !formData.date) {
      return;
    }
    let time = new Date(id == 'date' ? value : formData.date);
    const hours = ((id == 'hours' ? value : formData.hours) || '00:00').split(':');
    console.log(hours);
    time.setHours(...hours);
    time = time.getTime();
    setFormData({
      ...formData,
      [id]: value,
      time,
    });
  };

  return (
    <>
      <div className="flex">
        <label htmlFor="now">Now:</label>
        <ToggleSwitch {...{ id: 'now', value: formData.now, onChange: updateForm }} />
      </div>
      {!formData.now && (
        <div id="timeDiv">
          <label htmlFor="time">Time:</label>
          <div className="flex" id="time">
            <input type="date" id="date" value={formData.date} onInput={updateFormTime} />
            <input type="time" id="hours" value={formData.hours} onInput={updateFormTime} />
          </div>
        </div>
      )}
    </>
  );
}
