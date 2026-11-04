import PrivacyPolicy from "../../src/components/PrivacyPolicy";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the SeaFish Bogura Privacy Policy to learn how customer information is collected, used and protected.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | SeaFish Bogura",
    description:
      "Read the SeaFish Bogura Privacy Policy to learn how customer information is collected, used and protected.",
    url: "https://seafishbogura.netlify.app/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}

