
import ProductClient from "./ProductClient";
import { supabase } from "../../../src/supabaseClient";
import { notFound, redirect } from "next/navigation";

const SITE_URL = "https://seafishbogura.shop";

// ID অথবা Slug দিয়ে Product খুঁজবে
async function getProduct(identifier) {
  let query = supabase.from("products").select("*");

  if (/^\d+$/.test(String(identifier))) {
    query = query.eq("id", identifier);
  } else {
    query = query.eq("slug", identifier);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Product Fetch Error:", error.message);
  }

  return data || null;
}

// SEO Metadata
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

  const slug = product.slug || String(product.id);
  const productUrl = `${SITE_URL}/product/${slug}`;

  const title = `${product.name} | SeaFish Bogura`;

  const description =
    `${product.name} কিনুন SeaFish Bogura থেকে। ${
      product.description || "Bogura, Bangladesh-এ অনলাইনে মাছ অর্ডার করুন।"
    }`.slice(0, 160);

  const imageUrl =
    product.image_url || `${SITE_URL}/images/seafish-cover.png`;

  return {
    title,
    description,

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: productUrl,
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

// Product Page
export default async function ProductPage({ params }) {
  const { id } = await params;

  const initialProduct = await getProduct(id);

  if (!initialProduct) {
    notFound();
  }

  // পুরোনো ID URL থেকে নতুন Slug URL-এ Redirect
  if (/^\d+$/.test(String(id)) && initialProduct.slug) {
    redirect(`/product/${initialProduct.slug}`);
  }

  return (
    <ProductClient
      id={String(initialProduct.id)}
      initialProduct={initialProduct}
    />
  );
}
