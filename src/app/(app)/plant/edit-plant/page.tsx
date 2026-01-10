import { Suspense } from "react";
import EditPlantClient from "./EditPlantClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <EditPlantClient />
    </Suspense>
  );
}
