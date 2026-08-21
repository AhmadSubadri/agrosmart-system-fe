import React from 'react';
import { Thermometer } from 'lucide-react';

interface IndikatorSuhuProps {
  suhu: number;
}

const IndikatorSuhuEnv: React.FC<IndikatorSuhuProps> = ({ suhu }) => {
  return (
    <div className="bg-white border border-bone-300 rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-forest-700 tracking-wide uppercase">Suhu Udara</span>
        <div className="w-8 h-8 rounded-xl bg-clay-50 border border-clay-100 flex items-center justify-center text-clay-600">
          <Thermometer className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
          {suhu} <span className="text-sm font-semibold text-sage-700">°C</span>
        </div>
        <div className="mt-1 text-[11px] text-sage-700 font-medium">Kondisi Mikro Udara</div>
      </div>
    </div>
  );
};

export default IndikatorSuhuEnv;

