import React from 'react';
import { Droplets } from 'lucide-react';

interface IndikatorKelembapanProps {
  humid: number;
}

const IndikatorKelembapanEnv: React.FC<IndikatorKelembapanProps> = ({ humid }) => {
  return (
    <div className="bg-white border border-bone-300 rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-forest-700 tracking-wide uppercase">Kelembapan</span>
        <div className="w-8 h-8 rounded-xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600">
          <Droplets className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
          {humid} <span className="text-sm font-semibold text-sage-700">%RH</span>
        </div>
        <div className="mt-1 text-[11px] text-sage-700 font-medium">Kelembapan Udara</div>
      </div>
    </div>
  );
};

export default IndikatorKelembapanEnv;

