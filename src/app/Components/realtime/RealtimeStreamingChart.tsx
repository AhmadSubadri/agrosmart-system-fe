"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  Activity,
  Zap,
  FlaskConical,
  Radio,
  Clock,
  RefreshCw,
} from "lucide-react";

// Dynamically import ReactApexChart without loading callback
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RealtimeStreamingChartProps {
  activePlotIndex: number; // 0 for Plot 1, 1 for Plot 2, -1 for All Plots
  nitrogenVal?: number;
  fosforVal?: number;
  kaliumVal?: number;
  phVal?: number;
  tempVal?: number;
  humVal?: number;
  ecVal?: number;
  lastUpdated?: string;
  isLiveActive?: boolean;
}

interface StreamPoint {
  time: string;
  n: number;
  p: number;
  k: number;
  ph: number;
  temp: number;
  hum: number;
  ec: number;
}

export default function RealtimeStreamingChart({
  activePlotIndex,
  nitrogenVal = 140,
  fosforVal = 367,
  kaliumVal = 362,
  phVal = 6.4,
  tempVal = 27.8,
  humVal = 65.8,
  ecVal = 844,
  lastUpdated,
  isLiveActive = true,
}: RealtimeStreamingChartProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [streamMode, setStreamMode] = useState<"nutrients" | "physics">("nutrients");
  const [streamBuffer, setStreamBuffer] = useState<StreamPoint[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Distinct contrast colors for nutrients
  const NUTRIENT_COLORS = {
    nitrogen: "#10B981", // Emerald Green
    fosfor: "#3B82F6",   // Royal Blue
    kalium: "#F59E0B",   // Amber Gold
    ph: "#8B5CF6",       // Violet Purple
  };

  const PHYSICS_COLORS = {
    temp: "#EA580C", // Warm Orange
    hum: "#0284C7",  // Water Blue
    ec: "#6366F1",   // Indigo
  };

  // Generate initial rolling buffer (last 8 ticks)
  useEffect(() => {
    const now = new Date();
    const initialPoints: StreamPoint[] = [];

    for (let i = 7; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 15000); // 15 sec ticks
      const timeLabel = t.toTimeString().split(" ")[0]; // HH:MM:SS

      const noise = Math.sin(i * 1.3) * 1.5;
      const kNoise = Math.cos(i * 1.1) * 2.5;

      initialPoints.push({
        time: timeLabel,
        n: Math.round(Math.max(10, nitrogenVal + noise)),
        p: Math.round(Math.max(10, fosforVal + (i % 2 === 0 ? 1 : -1))),
        k: Math.round(Math.max(10, kaliumVal + kNoise)),
        ph: Number((phVal + Math.sin(i) * 0.05).toFixed(2)),
        temp: Number((tempVal + noise * 0.1).toFixed(1)),
        hum: Math.round(humVal + noise * 0.5),
        ec: Math.round(ecVal + noise * 3),
      });
    }

    setStreamBuffer(initialPoints);
  }, [activePlotIndex]);

  // Whenever new live readings arrive from parent auto-sync, push a new point
  useEffect(() => {
    if (!lastUpdated) return;

    const timeLabel = new Date().toTimeString().split(" ")[0];

    setStreamBuffer((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].time === timeLabel) {
        return prev;
      }

      const newPoint: StreamPoint = {
        time: timeLabel,
        n: Math.round(nitrogenVal),
        p: Math.round(fosforVal),
        k: Math.round(kaliumVal),
        ph: Number(phVal.toFixed(2)),
        temp: Number(tempVal.toFixed(1)),
        hum: Math.round(humVal),
        ec: Math.round(ecVal),
      };

      const updated = [...prev, newPoint];
      if (updated.length > 10) {
        updated.shift();
      }
      return updated;
    });
  }, [lastUpdated, nitrogenVal, fosforVal, kaliumVal, phVal, tempVal, humVal, ecVal]);

  const categories = useMemo(() => {
    return streamBuffer.map((pt) => pt.time);
  }, [streamBuffer]);

  // Series based on streamMode
  const { series, chartColors, yAxisConfig } = useMemo(() => {
    if (streamMode === "nutrients") {
      return {
        series: [
          {
            name: "Nitrogen (N) - mg/kg",
            data: streamBuffer.map((pt) => pt.n),
          },
          {
            name: "Fosfor (P) - mg/kg",
            data: streamBuffer.map((pt) => pt.p),
          },
          {
            name: "Kalium (K) - mg/kg",
            data: streamBuffer.map((pt) => pt.k),
          },
          {
            name: "pH Tanah",
            data: streamBuffer.map((pt) => pt.ph),
          },
        ],
        chartColors: [
          NUTRIENT_COLORS.nitrogen,
          NUTRIENT_COLORS.fosfor,
          NUTRIENT_COLORS.kalium,
          NUTRIENT_COLORS.ph,
        ],
        yAxisConfig: [
          {
            title: {
              text: "Hara N-P-K (mg/kg)",
              style: { color: "#1B261C", fontSize: "10px", fontWeight: 700 },
            },
            labels: {
              style: { colors: "#374151", fontSize: "10px", fontWeight: 600 },
              formatter: (v: number) => `${Math.round(v)}`,
            },
          },
          {
            opposite: true,
            min: 4.5,
            max: 8.5,
            decimalsInFloat: 1,
            title: {
              text: "Kemasaman pH",
              style: { color: NUTRIENT_COLORS.ph, fontSize: "10px", fontWeight: 700 },
            },
            labels: {
              style: { colors: NUTRIENT_COLORS.ph, fontSize: "10px", fontWeight: 700 },
              formatter: (v: number) => `${Number(v).toFixed(1)}`,
            },
          },
        ],
      };
    }

    // Physical soil factors (Temp, Humidity, EC)
    return {
      series: [
        {
          name: "Suhu Tanah (°C)",
          data: streamBuffer.map((pt) => pt.temp),
        },
        {
          name: "Kelembapan Tanah (%)",
          data: streamBuffer.map((pt) => pt.hum),
        },
        {
          name: "EC Tanah (uS/cm)",
          data: streamBuffer.map((pt) => pt.ec),
        },
      ],
      chartColors: [
        PHYSICS_COLORS.temp,
        PHYSICS_COLORS.hum,
        PHYSICS_COLORS.ec,
      ],
      yAxisConfig: [
        {
          title: {
            text: "Suhu (°C) & RH (%)",
            style: { color: "#1B261C", fontSize: "10px", fontWeight: 700 },
          },
          labels: {
            style: { colors: "#374151", fontSize: "10px", fontWeight: 600 },
            formatter: (v: number) => `${Math.round(v)}`,
          },
        },
        {
          opposite: true,
          title: {
            text: "Konduktivitas EC (µS/cm)",
            style: { color: PHYSICS_COLORS.ec, fontSize: "10px", fontWeight: 700 },
          },
          labels: {
            style: { colors: PHYSICS_COLORS.ec, fontSize: "10px", fontWeight: 700 },
            formatter: (v: number) => `${Math.round(v)}`,
          },
        },
      ],
    };
  }, [streamMode, streamBuffer, NUTRIENT_COLORS, PHYSICS_COLORS]);

  const options: ApexOptions = useMemo(() => {
    return {
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 800,
          },
        },
      },
      colors: chartColors,
      stroke: { curve: "smooth", width: 2.5 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: { colors: "#4F6348", fontSize: "10px", fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: yAxisConfig,
      grid: {
        borderColor: "#E5E0D2",
        strokeDashArray: 4,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "11px",
        fontWeight: 700,
        labels: { colors: "#1B261C" },
        markers: { size: 5 },
      },
      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        y: {
          formatter: (v: number, opts: any) => {
            const seriesName = opts?.w?.globals?.seriesNames?.[opts.seriesIndex] || "";
            if (seriesName.includes("pH")) return `pH ${Number(v).toFixed(2)}`;
            if (seriesName.includes("Suhu")) return `${Number(v).toFixed(1)} °C`;
            if (seriesName.includes("Kelembapan")) return `${Math.round(v)} %`;
            if (seriesName.includes("EC")) return `${Math.round(v)} µS/cm`;
            return `${Math.round(v)} mg/kg`;
          },
        },
      },
    };
  }, [categories, chartColors, yAxisConfig]);

  const plotLabel = activePlotIndex === -1 ? "Semua Plot Area" : `Plot Area ${activePlotIndex + 1}`;

  return (
    <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-bone-200">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center font-bold shadow-2xs">
              <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
            </div>
            {isLiveActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-forest-900 text-sm sm:text-base">
                Live Telemetry Streaming Chart
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed
              </span>
            </div>
            <p className="text-[11px] text-sage-600">
              Aliran data telemetri real-time untuk <span className="font-bold text-forest-900">{plotLabel}</span>
            </p>
          </div>
        </div>

        {/* Stream Mode Toggle (Hara vs Fisika) */}
        <div className="flex items-center gap-1 p-0.5 bg-bone-100 rounded-lg border border-bone-200 self-start sm:self-auto">
          <button
            onClick={() => setStreamMode("nutrients")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              streamMode === "nutrients"
                ? "bg-forest-900 text-wheat-300 shadow-2xs"
                : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            <span>Hara Tanah (N-P-K & pH)</span>
          </button>

          <button
            onClick={() => setStreamMode("physics")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              streamMode === "physics"
                ? "bg-forest-900 text-wheat-300 shadow-2xs"
                : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Fisik Tanah (Suhu, RH, EC)</span>
          </button>
        </div>
      </div>

      {/* Streaming Canvas */}
      <div className="w-full min-h-[230px]">
        {!isMounted ? (
          <div className="h-[230px] flex items-center justify-center text-xs text-sage-600">
            <RefreshCw className="w-4 h-4 animate-spin text-forest-700 mr-2" />
            Menyiapkan streaming grafik telemetri...
          </div>
        ) : (
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={230}
          />
        )}
      </div>

      {/* Stream Status Footer */}
      <div className="mt-2 pt-2 border-t border-bone-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-sage-600">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-sage-500" />
            <span>Update Tiap 15 Detik (Buffer {streamBuffer.length} Titik)</span>
          </span>
        </div>

        {streamMode === "nutrients" ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-forest-900">N: {Math.round(nitrogenVal)} mg/kg</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold text-forest-900">P: {Math.round(fosforVal)} mg/kg</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-forest-900">K: {Math.round(kaliumVal)} mg/kg</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="font-semibold text-forest-900">pH: {phVal.toFixed(1)}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              <span className="font-semibold text-forest-900">Suhu: {tempVal.toFixed(1)}°C</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span className="font-semibold text-forest-900">RH: {Math.round(humVal)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span className="font-semibold text-forest-900">EC: {Math.round(ecVal)} µS/cm</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
