import React, { useEffect, useState, useRef } from 'react';

import '../assets/css/components/suggestInput.css';

export default function SuggestInput({
  placeholder = '',
  className = '',
  type = 'text',
  value,
  onInput,

  suggest,
  selectSuggestion,
}) {
  const suggestRef = useRef(false);
  const [loadedValue, setLoadedValue] = useState();
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!showSuggest || loadedValue === value) {
      return;
    }
    setSuggestions(suggest(value));
    setLoadedValue(value);
  }, [value]);

  const openSuggest = () => {
    if (loadedValue !== value) {
      setSuggestions(suggest(value));
      setLoadedValue(value);
    }
    setShowSuggest(true);
  };

  const hideSuggest = (e) => {
    if (suggestRef.current && !suggestRef.current.contains(e.relatedTarget)) {
      setShowSuggest(false);
    }
  };

  const clickSuggestion = (sugestion) => {
    selectSuggestion(sugestion);
    setShowSuggest(false);
  };

  return (
    <div className={`suggest ${className}`} onFocus={openSuggest} onBlur={hideSuggest}>
      <input type={type} placeholder={placeholder} value={value} onInput={onInput} />
      {showSuggest && (
        <ul ref={suggestRef}>
          {suggestions.map((sugestion) => (
            <li key={sugestion} onClick={() => clickSuggestion(sugestion)} tabIndex={0}>
              {sugestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
