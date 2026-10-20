import React from 'react';
import IndikatorSuhu from './indikator/indikatorSuhu';
import IndikatorKelembapan from './indikator/indikatorKelembapan';
import IndikatorNitrogen from './indikator/indikatorNitrogen';
import IndikatorFosfor from './indikator/indikatorFosfor';
import IndikatorKalium from './indikator/indikatorKalium';
import IndikatorPh from './indikator/indikatorPh';
import IndikatorEc from './indikator/indikatorEC';
import IndikatorTds from './indikator/indikatorTDS';

interface SensorRealtimeProps {
  sensor: number;
  suhu: number;
  humid: number;
  nitrogen: number;
  fosfor: number;
  kalium: number;
  ph: number;
  ec: number;
  tds: number;
  statusPh: string;
  statusSuhu: string;
  statusNitrogen: string;
  statusFosfor: string;
  statusKalium: string;
  statusHumid: string;
  statusEc: string;
  statusTDS: string;
}

const SensorRealtime: React.FC<SensorRealtimeProps> = ({
  sensor,
  suhu,
  humid,
  nitrogen,
  fosfor,
  kalium,
  ph,
  ec,
  tds,
  statusPh,
  statusSuhu,
  statusNitrogen,
  statusFosfor,
  statusKalium,
  statusHumid,
  statusEc,
  statusTDS,
}) => {
  return (
    <div className="bg-bone-50 border border-bone-300/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-bone-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold text-xs">
            A{sensor}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-forest-900 leading-tight">
              Plot Lahan - Area {sensor}
            </h3>
            <p className="text-[11px] text-sage-600">8 Parameter Fisik & Kimia Tanah</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage-100 border border-sage-200 text-forest-800">
          Node Aktif
        </span>
      </div>

      {/* 8 Sensor Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
        <IndikatorPh ph={ph} status={statusPh} />
        <IndikatorNitrogen nitrogen={nitrogen} status={statusNitrogen} />
        <IndikatorFosfor fosfor={fosfor} status={statusFosfor} />
        <IndikatorKalium kalium={kalium} status={statusKalium} />
        <IndikatorSuhu suhu={suhu} status={statusSuhu} />
        <IndikatorKelembapan humid={humid} status={statusHumid} />
        <IndikatorEc ec={ec} status={statusEc} />
        <IndikatorTds tds={tds} status={statusTDS} />
      </div>
    </div>
  );
};

export default SensorRealtime;
