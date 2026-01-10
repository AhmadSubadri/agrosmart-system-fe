import { Suspense } from "react";
import EditSensorClient from "./EditSensorClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <EditSensorClient />
    </Suspense>
  );
}
