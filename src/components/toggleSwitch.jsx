import React, { useEffect, useState, useRef } from 'react';

import '../assets/css/components/toggleSwitch.css';

export default function ToggleSwitch({ id, value, onChange }) {
  return (
    <label htmlFor={id} className="toggle">
      <input type="checkbox" id={id} checked={value} onChange={onChange} />
      <span></span>
    </label>
  );
}
