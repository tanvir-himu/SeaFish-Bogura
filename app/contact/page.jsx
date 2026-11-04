import ContactUs from "../../src/components/ContactUs";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact SeaFish Bogura through WhatsApp, phone or Facebook for sea fish prices, orders and customer support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | SeaFish Bogura",
    description:
      "Contact SeaFish Bogura through WhatsApp, phone or Facebook for sea fish prices, orders and customer support.",
    url: "https://seafishbogura.netlify.app/contact",
  },
};

export default function ContactPage() {
  return <ContactUs />;
}

