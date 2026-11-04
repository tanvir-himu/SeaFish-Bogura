"use client";
import ProductReviews from "./ProductReviews";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductDetails from "../../../src/components/ProductDetails";
import { supabase } from "../../../src/supabaseClient";

export default function ProductClient({ id, initialProduct }) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    async function loadProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, initialProduct]);

  const handleAddToCart = (item) => {
    // If user adds to cart from standalone product page, navigate to home or store in localStorage
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("seafish_cart") || "[]");
        const found = existing.find((p) => p.id === item.id);
        let updated;
        if (found) {
          updated = existing.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + 1 } : p
          );
        } else {
          updated = [...existing, { ...item, qty: 1 }];
        }
        localStorage.setItem("seafish_cart", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      router.push("/");
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="site-shell">
      <>
  <ProductDetails
    product={product}
    loading={loading}
    onAddToCart={handleAddToCart}
    onBack={handleBack}
  />

  {!loading && product && (
    <ProductReviews productId={product.id} />
  )}
</>
    </div>
  );
}

