"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import EditSiteFormClient from "./editSiteForm";

export default function EditLahanClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) {
      router.replace("/lahan");
    }
  }, [id, router]);

  if (!id) return null;

  return <EditSiteFormClient siteId={id} />;
}
