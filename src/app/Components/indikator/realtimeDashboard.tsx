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
    <div className="bg-bone-50 border border-bone-300/80 rounded-2xl p-4 sm:p-5 shadow-soft">
      {/* Node Header */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrescription(!showPrescription)}
            className="px-3 py-1 bg-white border border-bone-300 hover:border-sage-400 text-forest-900 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-wheat-600" />
            <span>Preskripsi Pupuk</span>
            {showPrescription ? (
              <ChevronUp className="w-3 h-3 text-sage-600" />
            ) : (
              <ChevronDown className="w-3 h-3 text-sage-600" />
            )}
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800 hidden sm:inline-block">
            Node Online
          </span>
        </div>
      </div>

      {/* 4 Sensor Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <IndikatorPh ph={ph} status={statusPh} />
        <IndikatorNitrogen nitrogen={nitrogen} status={statusNitrogen} />
        <IndikatorFosfor fosfor={fosfor} status={statusFosfor} />
        <IndikatorKalium kalium={kalium} status={statusKalium} />
      </div>

      {/* Expandable Prescriptive Action Drawer */}
      {showPrescription && (
        <div className="mt-4 pt-3.5 border-t border-bone-200/80 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 mb-2 text-forest-900">
            <Sprout className="w-4 h-4 text-sage-600" />
            <h4 className="font-extrabold text-xs uppercase tracking-wide">
              Rekomendasi Presisi Dosis Pupuk (Plot Area {sensor})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {prescriptions.map((rec, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  rec.status === 'alert'
                    ? 'bg-clay-50/70 border-clay-200 text-clay-900'
                    : rec.status === 'warning'
                    ? 'bg-wheat-50/70 border-wheat-200 text-wheat-900'
                    : 'bg-white border-bone-200 text-forest-900'
                }`}
              >
                {rec.status === 'alert' ? (
                  <ShieldAlert className="w-4 h-4 text-clay-600 flex-shrink-0 mt-0.5" />
                ) : rec.status === 'warning' ? (
                  <Sparkles className="w-4 h-4 text-wheat-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-forest-900 mb-0.5">{rec.name}</span>
                  <span className="text-forest-800 leading-relaxed font-normal">{rec.dose}</span>
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
