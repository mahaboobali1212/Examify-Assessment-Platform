import React from 'react';

const Logo = ({ size = 'md', showText = true, textClass = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-10 h-10 rounded-xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-2xl',
    xl: 'w-16 h-16 rounded-3xl text-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-9 h-9',
  };

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Premium Gradient Hexagon / Shield Logo Icon */}
      <div
        className={`${sizeClasses[size] || sizeClasses.md} bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}
      >
        {/* Subtle inner reflective light */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />

        {/* Custom Examify SVG: Stylized Assessment Book + Verification Pulse */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${iconSizes[size] || iconSizes.md} drop-shadow-xs`}
        >
          {/* Main shield/book spine */}
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v19H6.5a2.5 2.5 0 0 1-2.5-1.5Z" />
          {/* Dynamic checkmark & lightning cut */}
          <path d="m8.5 11.5 2.5 2.5 4.5-5" strokeWidth="2.5" />
          <path d="M12 21h7" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-600 bg-clip-text text-transparent ${textClass || (size === 'lg' ? 'text-2xl' : 'text-xl')}`}>
            Exam<span className="text-brand-600">ify</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
            Assess • Evaluate • Excel
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
