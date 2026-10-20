"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { TrendingUp, Activity, Thermometer, Droplets, FlaskConical } from "lucide-react";

// Dynamically import ReactApexChart to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] flex items-center justify-center text-xs text-sage-600">
      Memuat grafik telemetri...
    </div>
  ),
});

interface TelemetryTrendChartProps {
  nitrogen?: number;
  fosfor?: number;
  kalium?: number;
  ph?: number;
  temperature?: number;
  humidity?: number;
}

export default function TelemetryTrendChart({
  nitrogen = 45,
  fosfor = 38,
  kalium = 52,
  ph = 6.4,
  temperature = 28.5,
  humidity = 76,
}: TelemetryTrendChartProps) {
  const [activeTab, setActiveTab] = useState<"soil" | "weather">("soil");

  const hours = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
    "Sekarang",
  ];

  // Soil Telemetry Trends (NPK & pH scaled)
  const soilSeries = [
    {
      name: "Nitrogen (N) - mg/kg",
      data: [
        nitrogen - 4,
        nitrogen - 2,
        nitrogen,
        nitrogen + 3,
        nitrogen + 1,
        nitrogen - 1,
        nitrogen,
        nitrogen - 2,
        nitrogen,
      ],
    },
    {
      name: "Fosfor (P) - mg/kg",
      data: [
        fosfor - 2,
        fosfor - 1,
        fosfor,
        fosfor + 1,
        fosfor + 2,
        fosfor,
        fosfor - 1,
        fosfor,
        fosfor,
      ],
    },
    {
      name: "Kalium (K) - mg/kg",
      data: [
        kalium - 3,
        kalium - 1,
        kalium,
        kalium + 2,
        kalium + 4,
        kalium + 1,
        kalium,
        kalium - 1,
        kalium,
      ],
    },
    {
      name: "pH Tanah (x10)",
      data: [
        Math.round((ph - 0.2) * 10),
        Math.round((ph - 0.1) * 10),
        Math.round(ph * 10),
        Math.round((ph + 0.1) * 10),
        Math.round((ph + 0.2) * 10),
        Math.round(ph * 10),
        Math.round(ph * 10),
        Math.round((ph - 0.1) * 10),
        Math.round(ph * 10),
      ],
    },
  ];

  // Weather Telemetry Trends
  const weatherSeries = [
    {
      name: "Suhu Udara (°C)",
      data: [
        temperature - 4,
        temperature - 5,
        temperature - 3,
        temperature + 1,
        temperature + 4,
        temperature + 3,
        temperature,
        temperature - 2,
        temperature,
      ],
    },
    {
      name: "Kelembapan Udara (%)",
      data: [
        humidity + 8,
        humidity + 10,
        humidity + 6,
        humidity - 4,
        humidity - 12,
        humidity - 8,
        humidity + 2,
        humidity + 6,
        humidity,
      ],
    },
  ];

  const soilOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    colors: ["#2C3E2D", "#7A9471", "#D9C589", "#A36E4C"],
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: hours,
      labels: {
        style: { colors: "#4F6348", fontSize: "11px", fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#4F6348", fontSize: "11px" },
      },
    },
    grid: {
      borderColor: "#E5E0D2",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      labels: { colors: "#1B261C" },
      markers: { size: 5 },
    },
    tooltip: {
      theme: "light",
      x: { show: true },
    },
  };

  const weatherOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    colors: ["#6B4226", "#3D553E"],
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: hours,
      labels: {
        style: { colors: "#4F6348", fontSize: "11px", fontWeight: 500 },
      },
      axisBorder: { show: false },
    },
    yaxis: [
      {
        title: { text: "Suhu (°C)", style: { color: "#6B4226", fontSize: "11px" } },
        labels: { style: { colors: "#6B4226" } },
      },
      {
        opposite: true,
        title: { text: "Kelembapan (%)", style: { color: "#3D553E", fontSize: "11px" } },
        labels: { style: { colors: "#3D553E" } },
      },
    ],
    grid: {
      borderColor: "#E5E0D2",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      labels: { colors: "#1B261C" },
    },
  };

  return (
    <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2 border-b border-bone-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 text-sm">
              Grafik Tren Telemetri Lahan
            </h3>
            <p className="text-[11px] text-sage-600">Dinamika hara dan iklim mikro 24 jam</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-bone-100 rounded-lg border border-bone-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("soil")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "soil"
                ? "bg-forest-900 text-wheat-300 shadow-2xs"
                : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            <span>Hara Tanah & pH</span>
          </button>

          <button
            onClick={() => setActiveTab("weather")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "weather"
                ? "bg-forest-900 text-wheat-300 shadow-2xs"
                : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
            }`}
          >
            <Thermometer className="w-3 h-3" />
            <span>Suhu & Kelembapan</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full">
        {activeTab === "soil" ? (
          <ReactApexChart
            options={soilOptions}
            series={soilSeries}
            type="area"
            height={220}
          />
        ) : (
          <ReactApexChart
            options={weatherOptions}
            series={weatherSeries}
            type="line"
            height={220}
          />
        )}
      </div>

      {/* Chart Footer Insight */}
      <div className="mt-2 pt-2 border-t border-bone-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-sage-600">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-sage-500" />
          <span>Sampling data berkala via LoRaWAN node</span>
        </span>
        <span className="font-semibold text-forest-900">Status: Fluktuasi Stabil</span>
      </div>
    </div>
  );
}
