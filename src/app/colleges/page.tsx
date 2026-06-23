import { Suspense } from "react";
import CollegesClient from "./colleges-client";

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading...</div>}>
      <CollegesClient />
    </Suspense>
  );
}
