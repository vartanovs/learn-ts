import * as React from 'react';
import { useState } from 'react';
import type { Dispatch, FC, SetStateAction } from 'react';

const useDropdown = (
  label: string,
  defaultState: string,
  options: string[]
): [string, FC, Dispatch<SetStateAction<string>>] => {
  const [state, setState] = useState(defaultState);
  const id = `use-dropdown-${label.replace(' ', '').toLowerCase()}`;
  const Dropdown: React.FC = () => (
    <label htmlFor={id}>
      {label}
      <select
        data-testid={id}
        id={id}
        value={state}
        onBlur={event => setState(event.target.value)}
        onChange={event => setState(event.target.value)}
        disabled={options.length === 0}
      >
        <option>All</option>
        {options.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );

  return [state, Dropdown, setState]
}

export default useDropdown;
