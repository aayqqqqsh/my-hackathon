/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SwitchToggleProps {
  id?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor?: 'amber' | 'sky' | 'emerald';
  label?: string;
}

export function SwitchToggle({
  id,
  checked,
  onChange,
  disabled = false,
  activeColor = 'amber',
  label,
}: SwitchToggleProps) {
  const getActiveBg = () => {
    switch (activeColor) {
      case 'sky':
        return 'bg-sky-500';
      case 'emerald':
        return 'bg-emerald-500';
      case 'amber':
      default:
        return 'bg-amber-400';
    }
  };

  const getKnobBg = () => {
    if (!checked) return 'bg-slate-400';
    return activeColor === 'amber' ? 'bg-slate-950' : 'bg-white';
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? getActiveBg() : 'bg-slate-800 border border-slate-700/60'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } ${getKnobBg()}`}
      />
    </button>
  );
}
