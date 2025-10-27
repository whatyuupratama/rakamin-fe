import React from 'react';
interface propsInput {
  id: string;
  htmlFor: string;
  label: string;
  typeinput?: React.HTMLInputTypeAttribute;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string | number | readonly string[] | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}
export default function Input({
  id,
  htmlFor,
  label,
  typeinput,
  onChange,
  value,
  onKeyDown,
}: propsInput) {
  return (
    <div>
      <label htmlFor={htmlFor} className='block mb-2 text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        type={typeinput}
        onChange={onChange}
        value={value}
        required
        onKeyDown={onKeyDown}
        className='w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01959F]'
      />
    </div>
  );
}
