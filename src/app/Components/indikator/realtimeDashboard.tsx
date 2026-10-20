import React, { useState } from 'react';
import IndikatorNitrogen from './indikatorNitrogen';
import IndikatorFosfor from './indikatorFosfor';
import IndikatorKalium from './indikatorKalium';
import IndikatorPh from './indikatorPh';
import { Sparkles, ChevronDown, ChevronUp, Sprout, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
  const [showPrescription, setShowPrescription] = useState(false);

  // Agronomic prescription calculation
  const getPrescription = () => {
    const recommendations: { name: string; dose: string; status: 'ok' | 'warning' | 'alert' }[] = [];

    // Urea (N)
    if (nitrogen < 35) {
      recommendations.push({
        name: 'Pupuk Urea (Sumber Nitrogen)',
        dose: 'Tambahkan ± 50–75 kg/ha (Kondisi Defisit N)',
        status: 'warning',
      });
    } else if (nitrogen > 70) {
      recommendations.push({
        name: 'Pupuk Urea (Sumber Nitrogen)',
        dose: 'Tunda aplikasi Urea. Kadar N tinggi memicu batang rentan rebah & serangan wereng',
        status: 'alert',
      });
    } else {
      recommendations.push({
        name: 'Pupuk Urea (Sumber Nitrogen)',
        dose: 'Pertahankan dosis seimbang ± 25 kg/ha saat pemupukan susulan',
        status: 'ok',
      });
    }

    // SP-36 (P)
    if (fosfor < 30) {
      recommendations.push({
        name: 'Pupuk SP-36 / TSP (Sumber Fosfor)',
        dose: 'Aplikasi ± 40–50 kg/ha untuk perangsang perakaran & anakan awal',
        status: 'warning',
      });
    } else {
      recommendations.push({
        name: 'Pupuk SP-36 / TSP (Sumber Fosfor)',
        dose: 'Kadar P cukup. Tidak perlu penambahan ekstra musim ini',
        status: 'ok',
      });
    }

    // KCl (K)
    if (kalium < 35) {
      recommendations.push({
        name: 'Pupuk KCl (Sumber Kalium)',
        dose: 'Aplikasi ± 45–60 kg/ha untuk penguatan batang & pengisian bulir',
        status: 'warning',
      });
    } else {
      recommendations.push({
        name: 'Pupuk KCl (Sumber Kalium)',
        dose: 'Kadar K optimal. Daya tahan penyakit tanaman terlindungi',
        status: 'ok',
      });
    }

    // Dolomit (pH)
    if (ph < 6.0) {
      recommendations.push({
        name: 'Kapur Pertanian / Dolomit',
        dose: `pH ${ph.toFixed(1)} terlalu asam. Tabur dolomit 150–200 kg/ha untuk mengoptimalkan serapan pupuk`,
        status: 'alert',
      });
    }

    return recommendations;
  };

  const prescriptions = getPrescription();

  return (
    <div className="bg-bone-50 border border-bone-300/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
      {/* Node Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-bone-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold text-xs">
            A{sensor}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-forest-900 leading-tight">
              Plot Lahan - Area {sensor}
            </h3>
            <p className="text-[11px] text-sage-600">Sensor Telemetri NPK & Keasaman Tanah</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrescription(!showPrescription)}
            className="px-2.5 py-1 bg-white border border-bone-300 hover:border-sage-400 text-forest-900 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-wheat-600" />
            <span>Preskripsi Pupuk</span>
            {showPrescription ? (
              <ChevronUp className="w-3 h-3 text-sage-600" />
            ) : (
              <ChevronDown className="w-3 h-3 text-sage-600" />
            )}
          </button>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sage-100 border border-sage-200 text-forest-800 hidden sm:inline-block">
            Online
          </span>
        </div>
      </div>

      {/* 4 Sensor Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <IndikatorPh ph={ph} status={statusPh} />
        <IndikatorNitrogen nitrogen={nitrogen} status={statusNitrogen} />
        <IndikatorFosfor fosfor={fosfor} status={statusFosfor} />
        <IndikatorKalium kalium={kalium} status={statusKalium} />
      </div>

      {/* Expandable Prescriptive Action Drawer */}
      {showPrescription && (
        <div className="mt-3 pt-3 border-t border-bone-200/80 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-1.5 mb-2 text-forest-900">
            <Sprout className="w-3.5 h-3.5 text-sage-600" />
            <h4 className="font-bold text-[11px] uppercase tracking-wide">
              Rekomendasi Presisi Dosis Pupuk (Plot Area {sensor})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {prescriptions.map((rec, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                  rec.status === 'alert'
                    ? 'bg-clay-50/70 border-clay-200 text-clay-900'
                    : rec.status === 'warning'
                    ? 'bg-wheat-50/70 border-wheat-200 text-wheat-900'
                    : 'bg-white border-bone-200 text-forest-900'
                }`}
              >
                {rec.status === 'alert' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-clay-600 flex-shrink-0 mt-0.5" />
                ) : rec.status === 'warning' ? (
                  <Sparkles className="w-3.5 h-3.5 text-wheat-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-forest-900 mb-0.5">{rec.name}</span>
                  <span className="text-forest-800 leading-snug font-normal">{rec.dose}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorRealtime;
