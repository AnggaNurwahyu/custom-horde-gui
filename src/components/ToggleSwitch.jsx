import React from 'react';

const ToggleSwitch = ({ label, description, checked, onChange, isRed }) => (
  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors w-full">
    <div>
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
      {description && <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <div className="relative">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="sr-only" 
      />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? (isRed ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
    </div>
  </label>
);

export default ToggleSwitch;
