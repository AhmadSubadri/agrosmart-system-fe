"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { TrendingUp, Activity, Thermometer, Droplets, FlaskConical, Calendar } from "lucide-react";

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
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Dynamic Categories and Series based on timeRange
  const { categories, soilSeries, weatherSeries, subtitleText } = useMemo(() => {
    if (timeRange === "7d") {
      const cats = ["H-6", "H-5", "H-4", "H-3", "H-2", "Kemarin", "Hari Ini"];
      return {
        categories: cats,
        subtitleText: "Tren rata-rata harian 7 hari terakhir",
        soilSeries: [
          {
            name: "Nitrogen (N) - mg/kg",
            data: [nitrogen + 8, nitrogen + 6, nitrogen + 4, nitrogen + 3, nitrogen + 1, nitrogen, nitrogen],
          },
          {
            name: "Fosfor (P) - mg/kg",
            data: [fosfor + 2, fosfor + 2, fosfor + 1, fosfor + 1, fosfor, fosfor, fosfor],
          },
          {
            name: "Kalium (K) - mg/kg",
            data: [kalium + 5, kalium + 4, kalium + 3, kalium + 2, kalium + 1, kalium, kalium],
          },
          {
            name: "pH Tanah (x10)",
            data: [
              Math.round((ph + 0.1) * 10),
              Math.round((ph + 0.1) * 10),
              Math.round(ph * 10),
              Math.round(ph * 10),
              Math.round((ph - 0.1) * 10),
              Math.round(ph * 10),
              Math.round(ph * 10),
            ],
          },
        ],
        weatherSeries: [
          {
            name: "Suhu Rata-rata (°C)",
            data: [
              temperature - 1,
              temperature + 1,
              temperature - 2,
              temperature,
              temperature + 2,
              temperature - 1,
              temperature,
            ],
          },
          {
            name: "Kelembapan Rata-rata (%)",
            data: [
              humidity + 3,
              humidity - 2,
              humidity + 4,
              humidity,
              humidity - 3,
              humidity + 1,
              humidity,
            ],
          },
        ],
      };
    }

    if (timeRange === "30d") {
      const cats = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Saat Ini"];
      return {
        categories: cats,
        subtitleText: "Dinamika akumulasi hara 30 hari fase budidaya",
        soilSeries: [
          {
            name: "Nitrogen (N) - mg/kg",
            data: [nitrogen + 14, nitrogen + 10, nitrogen + 7, nitrogen + 3, nitrogen],
          },
          {
            name: "Fosfor (P) - mg/kg",
            data: [fosfor + 4, fosfor + 3, fosfor + 2, fosfor + 1, fosfor],
          },
          {
            name: "Kalium (K) - mg/kg",
            data: [kalium + 8, kalium + 6, kalium + 4, kalium + 2, kalium],
          },
          {
            name: "pH Tanah (x10)",
            data: [
              Math.round((ph + 0.2) * 10),
              Math.round((ph + 0.1) * 10),
              Math.round(ph * 10),
              Math.round((ph - 0.1) * 10),
              Math.round(ph * 10),
            ],
          },
        ],
        weatherSeries: [
          {
            name: "Suhu Rata-rata (°C)",
            data: [temperature - 2, temperature - 1, temperature + 1, temperature, temperature],
          },
          {
            name: "Kelembapan Rata-rata (%)",
            data: [humidity + 5, humidity + 2, humidity - 1, humidity, humidity],
          },
        ],
      };
    }

    // Default 24h
    const cats = [
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
    return {
      categories: cats,
      subtitleText: "Dinamika hara dan iklim mikro 24 jam terakhir",
      soilSeries: [
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
      ],
      weatherSeries: [
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
      ],
    };
  }, [timeRange, nitrogen, fosfor, kalium, ph, temperature, humidity]);

  const soilOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    colors: ["#2C3E2D", "#7A9471", "#D9C589", "#A36E4C"],
    stroke: { curve: "smooth", width: 2 },
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
      categories,
      labels: {
        style: { colors: "#4F6348", fontSize: "10px", fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#4F6348", fontSize: "10px" },
      },
    },
    grid: {
      borderColor: "#E5E0D2",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      fontWeight: 600,
      labels: { colors: "#1B261C" },
      markers: { size: 4 },
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
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#4F6348", fontSize: "10px", fontWeight: 500 },
      },
      axisBorder: { show: false },
    },
    yaxis: [
      {
        title: { text: "Suhu (°C)", style: { color: "#6B4226", fontSize: "10px" } },
        labels: { style: { colors: "#6B4226", fontSize: "10px" } },
      },
      {
        opposite: true,
        title: { text: "Kelembapan (%)", style: { color: "#3D553E", fontSize: "10px" } },
        labels: { style: { colors: "#3D553E", fontSize: "10px" } },
      },
    ],
    grid: {
      borderColor: "#E5E0D2",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      fontWeight: 600,
      labels: { colors: "#1B261C" },
    },
  };

  return (
    <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
      {/* Header, Range Selector & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 mb-2 border-b border-bone-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 text-sm">
              Grafik Tren Telemetri Lahan
            </h3>
            <p className="text-[11px] text-sage-600">{subtitleText}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-bone-100 rounded-lg border border-bone-200">
            <button
              onClick={() => setTimeRange("24h")}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                timeRange === "24h"
                  ? "bg-forest-900 text-wheat-300 shadow-2xs"
                  : "text-forest-800 hover:text-forest-900"
              }`}
            >
              24 Jam
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                timeRange === "7d"
                  ? "bg-forest-900 text-wheat-300 shadow-2xs"
                  : "text-forest-800 hover:text-forest-900"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                timeRange === "30d"
                  ? "bg-forest-900 text-wheat-300 shadow-2xs"
                  : "text-forest-800 hover:text-forest-900"
              }`}
            >
              30 Hari
            </button>
          </div>

          {/* Metric Tab Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-bone-100 rounded-lg border border-bone-200">
            <button
              onClick={() => setActiveTab("soil")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "soil"
                  ? "bg-forest-900 text-wheat-300 shadow-2xs"
                  : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
              }`}
            >
              <FlaskConical className="w-3 h-3" />
              <span>Hara Tanah</span>
            </button>

            <button
              onClick={() => setActiveTab("weather")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "weather"
                  ? "bg-forest-900 text-wheat-300 shadow-2xs"
                  : "text-forest-800 hover:text-forest-900 hover:bg-bone-200/60"
              }`}
            >
              <Thermometer className="w-3 h-3" />
              <span>Suhu & RH</span>
            </button>
          </div>
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
          <span>
            Rentang aktif: {timeRange === "24h" ? "24 Jam (Interval 3 Jam)" : timeRange === "7d" ? "7 Hari (Rata-rata Harian)" : "30 Hari (Per Minggu)"}
          </span>
        </span>
        <span className="font-semibold text-forest-900">Status: Fluktuasi Terkendali</span>
      </div>
    </div>
  );
}
