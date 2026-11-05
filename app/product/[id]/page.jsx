
import ProductClient from "./ProductClient";
import { supabase } from "../../../src/supabaseClient";
import { notFound } from "next/navigation";

const SITE_URL = "https://seafishbogura.shop";

async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Product Fetch Error:", error.message);
  }

  return data || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | SeaFish Bogura",
      description: "The requested fish product could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${product.name} | SeaFish Bogura`;

  const description =
    `${product.name} কিনুন SeaFish Bogura থেকে। ${
      product.description || "Bogura, Bangladesh-এ অনলাইনে মাছ অর্ডার করুন।"
    }`.slice(0, 160);

  const imageUrl =
    product.image_url ||
    `${SITE_URL}/images/seafish-cover.png`;

  return {
    title,
    description,

    alternates: {
      canonical: `/product/${id}`,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/product/${id}`,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  const initialProduct = await getProduct(id);

  // Product না পাওয়া গেলে Custom 404 দেখাবে
  if (!initialProduct) {
    notFound();
  }

  return (
    <ProductClient
      id={id}
      initialProduct={initialProduct}
    />
  );
}
