import React from 'react';
import IndikatorNitrogen from './indikatorNitrogen';
import IndikatorFosfor from './indikatorFosfor';
import IndikatorKalium from './indikatorKalium';
import IndikatorPh from './indikatorPh';
import { MapPin } from 'lucide-react';

interface SensorRealtimeProps {
  sensor: number;
  nitrogen: number;
  fosfor: number;
  kalium: number;
  ph: number;
  statusPh: string;
  statusNitrogen: string;
  statusFosfor: string;
  statusKalium: string;
}

const SensorRealtime: React.FC<SensorRealtimeProps> = ({
  sensor,
  nitrogen,
  fosfor,
  kalium,
  ph,
  statusPh,
  statusNitrogen,
  statusFosfor,
  statusKalium,
}) => {
  return (
    <div className="bg-bone-50 border border-bone-300/80 rounded-2xl p-4 sm:p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold text-xs">
            A{sensor}
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-forest-900 leading-tight">
              Plot Lahan - Area {sensor}
            </h3>
            <p className="text-xs text-sage-700/80">Sensor Telemetri NPK & Keasaman Tanah</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800">
          Node Online
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <IndikatorPh ph={ph} status={statusPh} />
        <IndikatorNitrogen nitrogen={nitrogen} status={statusNitrogen} />
        <IndikatorFosfor fosfor={fosfor} status={statusFosfor} />
        <IndikatorKalium kalium={kalium} status={statusKalium} />
      </div>
    </div>
  );
};

export default SensorRealtime;

