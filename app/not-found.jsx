
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "404 Page Not Found | SeaFish Bogura",
  description: "Sorry! The page you are looking for could not be found.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px",
        background: "#eaf6ff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          textAlign: "center",
        }}
      >
        <Image
          src="/images/404-seafish.png"
          alt="SeaFish Bogura 404 Page Not Found"
          width={1536}
          height={1024}
          priority
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "14px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "13px 25px",
              background: "#ffffff",
              color: "#075985",
              borderRadius: "30px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            🏠 Go to Home
          </Link>

          <Link
            href="/"
            style={{
              padding: "13px 25px",
              background: "#075985",
              color: "#ffffff",
              borderRadius: "30px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            🛒 Shop Now
          </Link>
        </div>
      </div>
    </main>
  );
}
