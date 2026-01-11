import { Suspense } from "react";
import GuestCheckoutClient from "./GuestCheckoutClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando checkout...</div>}>
      <GuestCheckoutClient />
    </Suspense>
  );
}
