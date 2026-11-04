"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  ShieldCheck,
  PackageCheck,
  Fish,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-US")}`;

export default function ProductDetails({
  product,
  onAddToCart,
  onBack,
  loading,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!product) return;

    setImageError(false);
    document.title = `${product.name} | SeaFish Bogura`;

    const description = document.querySelector(
      'meta[name="description"]'
    );

    if (description) {
      description.setAttribute(
        "content",
        `${product.name} কিনুন SeaFish Bogura থেকে। ${product.description || ""}`
      );
    }

    window.scrollTo(0, 0);
  }, [product]);

  if (loading) {
    return (
      <div className="product-loading">
        <Fish size={35} />
        <p>পণ্যের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <Fish size={48} />
        <h2>পণ্য পাওয়া যায়নি!</h2>
        <button onClick={onBack}>হোম পেজে ফিরে যান</button>
      </div>
    );
  }

  const inStock = Number(product.stock) > 0;
  const discount = Number(product.discount_percent || 0);

  const oldPrice =
    discount > 0
      ? Number(product.price) / (1 - discount / 100)
      : 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: product.image_url || undefined,
    sku: String(product.id),
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: Number(product.price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://seafishbogura.netlify.app/product/${product.id}`,
    },
  };

  return (
    <div className="product-details-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <div className="details-topbar">
        <button className="details-back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          হোম পেজে ফিরে যান
        </button>

        <div className="details-brand">
          <Fish size={22} />
          <span>SeaFish<span>.</span></span>
        </div>
      </div>

      <main className="details-main">
        <div className="details-breadcrumb">
          <span onClick={onBack}>হোম</span>
          <span>/</span>
          <span>আমাদের মাছ</span>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        <section className="details-product-card">
          <div className="details-gallery">
            <div className="details-main-image">
              {discount > 0 && (
                <span className="details-discount">
                  {discount}% OFF
                </span>
              )}

              {!imageError && product.image_url ? (
                <img
  src={product.image_url}
  alt={`${product.name} - SeaFish Bogura`}
  title={`${product.name} | SeaFish Bogura`}
  loading="eager"
  decoding="async"
  fetchPriority="high"
  width="600"
  height="600"
  onError={() => setImageError(true)}
/>
              ) : (
                <div className="details-image-placeholder">
                  <Fish size={85} />
                  <span>{product.name}</span>
                  <small>Product image unavailable</small>
                </div>
              )}
            </div>

            <div className="details-image-caption">
              <ShieldCheck size={17} />
              <span>SeaFish Bogura Product Collection</span>
            </div>
          </div>

          <div className="details-product-info">
            <span className="details-category">
              {product.english || "SEA FISH COLLECTION"}
            </span>

            <h1>{product.name}</h1>

            <div className="details-stock">
              {inStock ? (
                <>
                  <CheckCircle2 size={17} />
                  <span>স্টকে উপলব্ধ</span>
                </>
              ) : (
                <>
                  <XCircle size={17} />
                  <span>বর্তমানে স্টক শেষ</span>
                </>
              )}
            </div>

            <p className="details-description">
              {product.description || "এই পণ্য সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।"}
            </p>

            <div className="details-price-box">
              <div className="details-price">
                {money(product.price)}
              </div>

              {discount > 0 && (
                <div className="details-old-price">
                  {money(oldPrice)}
                  <span>{discount}% ছাড়</span>
                </div>
              )}

              <p>প্রতি {product.weight || "কেজি"}</p>
            </div>

            <div className="details-specifications">
              <div>
                <span>পণ্যের নাম</span>
                <strong>{product.name}</strong>
              </div>

              <div>
                <span>ওজন</span>
                <strong>{product.weight || "তথ্য যোগ করা হয়নি"}</strong>
              </div>

              <div>
                <span>স্টক</span>
                <strong>{inStock ? "উপলব্ধ" : "স্টক শেষ"}</strong>
              </div>
            </div>

            <button
              className="details-add-button"
              onClick={() => onAddToCart(product)}
              disabled={!inStock}
            >
              <ShoppingCart size={21} />
              {inStock ? "কার্টে যোগ করুন" : "স্টক শেষ"}
            </button>

            <div className="details-benefits">
              <div>
                <Truck size={23} />
                <span>
                  <strong>ডেলিভারি সুবিধা</strong>
                  <small>গন্তব্য অনুযায়ী ডেলিভারি</small>
                </span>
              </div>

              <div>
                <ShieldCheck size={23} />
                <span>
                  <strong>নিরাপদ অর্ডার</strong>
                  <small>সহজ অর্ডার প্রক্রিয়া</small>
                </span>
              </div>

              <div>
                <PackageCheck size={23} />
                <span>
                  <strong>যত্নসহকারে প্যাকেজিং</strong>
                  <small>প্যাকেজিংয়ের প্রতি গুরুত্ব</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="details-description-section">
          <span>PRODUCT INFORMATION</span>
          <h2>পণ্য সম্পর্কে বিস্তারিত</h2>
          <p>
            {product.description ||
              `${product.name} সম্পর্কে বিস্তারিত তথ্য শীঘ্রই আপডেট করা হবে।`}
          </p>
        </section>

        <div className="details-bottom-note">
          <Fish size={22} />
          <span>SeaFish Bogura | সাগরের স্বাদ, আপনার ঘরে।</span>
        </div>
      </main>
    </div>
  );
}