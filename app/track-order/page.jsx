import OrderTracking from "../../src/OrderTracking";

export const metadata = {
  title: "অর্ডার ট্র্যাকিং | Order Tracking",
  description: "আপনার SeaFish Bogura অর্ডারের বর্তমান অবস্থা এবং ডেলিভারি ট্র্যাক করুন।",
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderPage() {
  return <OrderTracking />;
}

