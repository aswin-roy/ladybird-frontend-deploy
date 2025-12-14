import React from 'react';

export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm text-gray-700 placeholder-gray-400 hover:border-gray-300 ${props.className || ''}`}
  />
);


