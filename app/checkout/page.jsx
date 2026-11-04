import Checkout from "../../src/Checkout";

export const metadata = {
  title: "অর্ডার সম্পন্ন করুন | Checkout",
  description: "SeaFish Bogura থেকে সহজে পছন্দের সামুদ্রিক মাছ অর্ডার করুন।",
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return <Checkout />;
}

