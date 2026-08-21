import React from 'react';
import { Sprout } from 'lucide-react';

interface IndikatorNitrogenProps {
  nitrogen: number;
  status: string;
}

const IndikatorNitrogen: React.FC<IndikatorNitrogenProps> = ({ nitrogen, status }) => {
  const isWarn = status === 'Warning';
  const isDanger = status === 'Danger';

  const badgeConfig = isDanger
    ? { text: 'Kritis', bg: 'bg-clay-100 text-clay-800 border-clay-300', dot: 'bg-clay-600', bar: 'bg-clay-600' }
    : isWarn
    ? { text: 'Perhatian', bg: 'bg-wheat-100 text-wheat-900 border-wheat-300', dot: 'bg-wheat-600', bar: 'bg-wheat-500' }
    : { text: 'Optimal', bg: 'bg-sage-100 text-sage-800 border-sage-200', dot: 'bg-sage-600', bar: 'bg-sage-500' };

  return (
    <div className="bg-white border border-bone-300 rounded-2xl p-4 shadow-soft hover:shadow-card transition-all relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${badgeConfig.bar}`} />
      
      <div className="flex items-center justify-between mb-2 pl-1">
        <span className="text-xs font-bold text-forest-800 uppercase tracking-wider">Nitrogen (N)</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeConfig.bg} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`} />
          {badgeConfig.text}
        </span>
      </div>

      <div className="pl-1">
        <div className="text-3xl font-extrabold text-forest-900 tracking-tight">
          {nitrogen} <span className="text-sm font-semibold text-sage-700">mg/kg</span>
        </div>
        <div className="mt-1 text-[11px] text-sage-700/90 font-medium flex items-center gap-1">
          <Sprout className="w-3 h-3 text-sage-500" /> Nutrisi Daun & Batang
        </div>
      </div>
    </div>
  );
};

export default IndikatorNitrogen;