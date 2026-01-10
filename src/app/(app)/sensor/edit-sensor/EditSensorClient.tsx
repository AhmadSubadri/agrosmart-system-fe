"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import EditSensorFormClient from "./editSensorForm";

export default function EditSensorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sensorId = searchParams.get("id");

  useEffect(() => {
    if (!sensorId) {
      router.replace("/sensor");
    }
  }, [sensorId, router]);

  if (!sensorId) return null;

  return (
    <section>
      <EditSensorFormClient sensorId={sensorId} />
    </section>
  );
}
