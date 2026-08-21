import React from 'react';
import { Sun } from 'lucide-react';

interface IndikatorCahayaProps {
  lux: number;
}

const IndikatorCahaya: React.FC<IndikatorCahayaProps> = ({ lux }) => {
  return (
    <div className="bg-white border border-bone-300 rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-forest-700 tracking-wide uppercase">Cahaya</span>
        <div className="w-8 h-8 rounded-xl bg-wheat-50 border border-wheat-200 flex items-center justify-center text-wheat-700">
          <Sun className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
          {lux} <span className="text-sm font-semibold text-sage-700">Lux</span>
        </div>
        <div className="mt-1 text-[11px] text-sage-700 font-medium">Intensitas Radiasi</div>
      </div>
    </div>
  );
};

export default IndikatorCahaya;