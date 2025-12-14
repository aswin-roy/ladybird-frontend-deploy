import React from 'react';

export const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm appearance-none text-gray-700 cursor-pointer hover:border-gray-300 ${props.className || ''}`}
  >
    {props.children}
  </select>
);


