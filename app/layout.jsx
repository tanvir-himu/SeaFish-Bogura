
import Script from "next/script";

import "../src/index.css";
import "../src/App.css";

export const viewport = {
  themeColor: "#117354",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL("https://seafishbogura.netlify.app"),
  title: {
    default: "SeaFish Bogura | Buy Sea Fish Online in Bangladesh",
    template: "%s | SeaFish Bogura",
  },
  description:
    "Buy sea fish online from SeaFish Bogura. Explore Hilsa, Bhetki, Churi and Loitta fish. Order easily through WhatsApp and enjoy convenient delivery in Bogura, Bangladesh.",
  keywords: [
    "SeaFish Bogura",
    "buy sea fish online Bangladesh",
    "sea fish Bogura",
    "Hilsa fish",
    "Bhetki fish",
    "Churi fish",
    "Loitta fish",
    "online fish shop Bangladesh",
  ],
  authors: [{ name: "SeaFish Bogura" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "SeaFish Bogura",
    title: "SeaFish Bogura | Buy Sea Fish Online",
    description:
      "Explore Hilsa, Bhetki, Churi and Loitta fish at SeaFish Bogura. Order online through WhatsApp.",
    url: "https://seafishbogura.netlify.app/",
    images: [
      {
        url: "https://seafishbogura.netlify.app/images/seafish-cover.png",
        width: 1200,
        height: 630,
        alt: "SeaFish Bogura Cover",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SeaFish Bogura | Online Sea Fish Shop",
    description:
      "Buy Hilsa, Bhetki, Churi and Loitta fish online from SeaFish Bogura.",
    images: ["https://seafishbogura.netlify.app/images/seafish-cover.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "SeaFish Bogura",
  url: "https://seafishbogura.netlify.app/",
  description:
    "Online sea fish shop serving customers in Bogura, Bangladesh.",
  telephone: "+8801982395288",
  areaServed: {
    "@type": "City",
    name: "Bogura",
  },
  sameAs: ["https://www.facebook.com/profile.php?id=61595853544460"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        
{/* Google Analytics 4 */}
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-RNG2YEV1EJ"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-RNG2YEV1EJ');
  `}
</Script>
