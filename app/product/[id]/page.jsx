import ProductClient from "./ProductClient";
import { supabase } from "../../../src/supabaseClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  try {
    const { data: product } = await supabase
      .from("products")
      .select("id, name, description, image_url, price")
      .eq("id", id)
      .single();

    if (product) {
      const title = `${product.name} | SeaFish Bogura`;
      const description = `${product.name} কিনুন SeaFish Bogura থেকে। ${product.description || ""}`.trim();
      const imageUrl =
        product.image_url ||
        "https://seafishbogura.netlify.app/images/seafish-cover.png";

      return {
        title,
        description,
        alternates: {
          canonical: `/product/${id}`,
        },
        openGraph: {
          title,
          description,
          url: `https://seafishbogura.netlify.app/product/${id}`,
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
  } catch (e) {
    // fallback if fetch fails
  }

  return {
    title: "Product Details | SeaFish Bogura",
    description: "Buy fresh sea fish online from SeaFish Bogura.",
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let initialProduct = null;
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    initialProduct = data;
  } catch (e) {
    // fallback to client load
  }

  return <ProductClient id={id} initialProduct={initialProduct} />;
}

