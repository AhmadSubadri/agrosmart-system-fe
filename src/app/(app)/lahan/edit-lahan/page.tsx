"use client";

import Header from "@/app/Components/header";
import EditSiteFormClient from "./editSiteForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditSitePage() {
  const searchParam = useSearchParams();
  const router = useRouter();
  const siteId = searchParam.get("id");

  useEffect(() => {
    if (!siteId) {
      router.replace("/lahan");
    }
  }, [siteId, router]);

  if (!siteId) return null;

  return <EditSiteFormClient siteId={siteId}></EditSiteFormClient>;
}
