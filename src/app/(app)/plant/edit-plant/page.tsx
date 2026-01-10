"use client";

import EditPlantFormClient from "./editPlantForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditPlantPage() {
  const searchParam = useSearchParams();
  const router = useRouter();
  const siteId = searchParam.get("id");

  useEffect(() => {
    if (!siteId) {
      router.replace("/plant");
    }
  }, [siteId, router]);

  if (!siteId) return null;

  return <EditPlantFormClient plantId={siteId}></EditPlantFormClient>;
}
