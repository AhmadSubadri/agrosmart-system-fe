"use client";

import Image from "next/image";

interface MapProps {
  image?: string;
  alt?: string;
}

export default function Map({ image, alt }: MapProps) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100">
      {image ? (
        <Image
          src={image}
          alt={alt || "Peta Lahan"}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
          <img
            src="/assets/img/Lahan-cianjur.jpg"
            alt="gambar lahan"
            className="object- object-cover"
          />
        </div>
      )}

      {/* ALERT SENSOR (siap diaktifkan) */}
      {/*
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Alert1 className="absolute top-[30%] left-[40%]" />
        <Alert2 className="absolute top-[50%] left-[60%]" />
      </div>
      */}
    </div>
  );
}
