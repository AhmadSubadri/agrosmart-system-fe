import React from 'react';
import { Wind } from 'lucide-react';

interface IndikatorKecAnginProps {
  wind: number;
}

const IndikatorKecAngin: React.FC<IndikatorKecAnginProps> = ({ wind }) => {
  return (
    <div className="bg-white border border-bone-300 rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-forest-700 tracking-wide uppercase">Angin</span>
        <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600">
          <Wind className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
          {wind} <span className="text-sm font-semibold text-sage-700">m/s</span>
        </div>
        <div className="mt-1 text-[11px] text-sage-700 font-medium">Kecepatan Angin</div>
      </div>
    </div>
  );
};

export default IndikatorKecAngin;

