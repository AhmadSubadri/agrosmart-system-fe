"use client";

import EditSensorFormClient from "./editSensorForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditSensorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sensorId = searchParams.get("id");

  // Redirect jika id tidak ada
  useEffect(() => {
    if (!sensorId) {
      router.replace("/sensor");
    }
  }, [sensorId, router]);

  // Hindari render sebelum id tersedia
  if (!sensorId) return null;

  return (
    <section>
      <EditSensorFormClient sensorId={sensorId} />
    </section>
  );
}
