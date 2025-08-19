import React, { useState } from 'react';
import Select, { components } from 'react-select';

type Folder = {
  id: number | string;
  name: string;
};

type FolderSelectProps = {
  folders: Folder[];
  value: string | number | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

const FolderSelect: React.FC<FolderSelectProps> = ({
  folders,
  value,
  onChange,
  placeholder = '-- Select Folder --',
}) => {
  const [inputValue, setInputValue] = useState('');

  const options = folders.map((folder) => ({
    value: folder.id.toString(),
    label: folder.name,
  }));

  const selectedOption =
    options.find((opt) => opt.value === value?.toString()) ?? null;

  // Custom Menu: only show if input is not empty and there are matches
  const Menu = (props: any) => {
    if (!inputValue.trim() || !props.options.length) return null;
    return <components.Menu {...props} />;
  };

  return (
    <Select
      components={{ Menu }}
      options={options}
      value={selectedOption}
      onChange={(selected) => onChange(selected?.value ?? null)}
      placeholder={placeholder}
      isClearable
      inputValue={inputValue}
      onInputChange={(val) => setInputValue(val)}
      filterOption={(option, inputVal) =>
        option.label.toLowerCase().includes(inputVal.toLowerCase())
      }
      className='pb-4'
    />
  );
};

export default FolderSelect;
