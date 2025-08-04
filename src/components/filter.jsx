import React, { useEffect, useState, useRef } from 'react';

//import '../assets/css/parts/pages.css';
import { useRateContext } from '../providers/rateProvider';

export default function Filter({ setFilterFunctions, itemFilter = false }) {
  const { currencies } = useRateContext();

  const [filter, setFilter] = useState({
    earned: 'all',
    types: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    makeFilterFunctions();
  }, [filter]);

  const makeFilterFunctions = () => {
    const filterFunctions = [];
    if (filter['earned'] != 'all') {
      filterFunctions.push((t) => t.earned == (filter.earned == 'earned'));
    }
    if (filter['types']) {
      const filterTypes = filter['types'].split(',').map((t) => t.trim());
      filterFunctions.push((t) => t.type.join(',').includes(filterTypes.join(',')));
    }
    if (filter['from'] || filter['to']) {
      if (filter['from']) {
        filterFunctions.push((t) => t.time >= new Date(filter['from'] + ' 00:00').getTime());
      }
      if (filter['to']) {
        filterFunctions.push((t) => t.time <= new Date(filter['to'] + ' 23:59:59.999').getTime());
      }
    }
    setFilterFunctions(filterFunctions);
  };

  return (
    <details className="filter">
      <summary>Filter</summary>
      <div className="details">
        {!itemFilter && (
          <div className="flex">
            <label htmlFor="earned">Earned:</label>
            <select
              id=""
              value={filter.earned}
              onChange={(e) => setFilter({ ...filter, earned: e.target.value })}
            >
              <option value="all">All</option>
              <option value="earned">Earned</option>
              <option value="spend">Spend</option>
            </select>
          </div>
        )}

        <div className="flex">
          <label htmlFor="types">Types:</label>
          <input
            type="text"
            id="types"
            placeholder="type1, type2,..."
            value={filter.types}
            onChange={(e) => setFilter({ ...filter, types: e.target.value })}
          />
        </div>
        <div className="flex">
          <label htmlFor="from">From:</label>
          <input
            type="date"
            id="from"
            value={filter.from}
            onChange={(e) => setFilter({ ...filter, from: e.target.value })}
          />
        </div>
        <div className="flex">
          <label htmlFor="to">To:</label>
          <input
            type="date"
            id="to"
            value={filter.to}
            onChange={(e) => setFilter({ ...filter, to: e.target.value })}
          />
        </div>
      </div>
    </details>
  );
}
