import { Suspense } from "react";
import EditLahanClient from "./EditLahanClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <EditLahanClient />
    </Suspense>
  );
}
