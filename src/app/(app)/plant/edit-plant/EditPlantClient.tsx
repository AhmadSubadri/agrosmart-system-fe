"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import EditPlantFormClient from "./editPlantForm";

export default function EditPlantClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plantId = searchParams.get("id");

  useEffect(() => {
    if (!plantId) {
      router.replace("/plant");
    }
  }, [plantId, router]);

  if (!plantId) return null;

  return <EditPlantFormClient plantId={plantId} />;
}
