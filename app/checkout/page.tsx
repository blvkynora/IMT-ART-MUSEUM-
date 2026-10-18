import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Arrange the acquisition of your selected works.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="pt-[72px] md:pt-20">
      <CheckoutForm />
    </div>
  );
}
