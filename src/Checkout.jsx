"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { ShoppingBag, Fish, CheckCircle, ArrowLeft } from "lucide-react";
import "./Checkout.css";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

export default function Checkout() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [trackingUrl, setTrackingUrl] = useState("");
  console.log("Order ID:", orderId);
console.log("Tracking URL:", trackingUrl);
  const whatsappMessage = `আসসালামু আলাইকুম, SeaFish Bogura!

আমার অর্ডার নম্বর: #${orderId}

আমার অর্ডার ট্র্যাকিং লিংক:
${trackingUrl}

ধন্যবাদ।`;

const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
  whatsappMessage
)}`;

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, is_active, image_url")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setError("পণ্যের তালিকা লোড হয়নি। পরে আবার চেষ্টা করুন।");
      } else {
        setProducts(data ?? []);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const selectedProduct = products.find(
    (item) => String(item.id) === String(productId)
  );

  const qty = Number(quantity);

  const total = useMemo(() => {
    if (!selectedProduct || !Number.isInteger(qty) || qty < 1) {
      return 0;
    }

    return Number(selectedProduct.price) * qty;
  }, [selectedProduct, qty]);

  async function submitOrder(event) {
    event.preventDefault();
    setError("");
    setOrderId(null);

    if (!selectedProduct) {
      setError("একটি মাছ নির্বাচন করুন।");
      return;
    }

    if (!Number.isInteger(qty) || qty < 1) {
      setError("সঠিক পরিমাণ কেজিতে লিখুন।");
      return;
    }

    if (qty > Number(selectedProduct.stock)) {
      setError(
        `এই মাছের বর্তমান স্টক ${selectedProduct.stock} কেজি।`
      );
      return;
    }

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    const address = customer.address.trim();

    if (!name || !phone || !address) {
      setError("নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।");
      return;
    }

    if (!/^[0-9+\-\s()]{10,20}$/.test(phone)) {
      setError("সঠিক ফোন নম্বর লিখুন।");
      return;
    }

    setSubmitting(true);

    try {
        const trackingToken = Array.from(
  crypto.getRandomValues(new Uint8Array(32))
)
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

const tokenBytes = new TextEncoder().encode(trackingToken);
const tokenDigest = await crypto.subtle.digest("SHA-256", tokenBytes);

const trackingTokenHash = Array.from(new Uint8Array(tokenDigest))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

      // Insert করার আগে বর্তমান পণ্যের দাম ও স্টক আবার যাচাই।
      const { data: latest, error: productError } = await supabase
        .from("products")
        .select("id, name, price, purchase_price, stock, is_active")
        .eq("id", selectedProduct.id)
        .maybeSingle();

      if (productError) throw productError;

      if (!latest || !latest.is_active) {
        throw new Error("এই মাছটি এখন অর্ডার করা যাচ্ছে না।");
      }

      if (qty > Number(latest.stock)) {
        throw new Error(
          `পর্যাপ্ত স্টক নেই। বর্তমানে ${latest.stock} কেজি আছে।`
        );
      }

      const itemTotal = Number(latest.price) * qty;

      const payload = {
        order_source: "website",
        customer_name: name,
        phone,
        address,
        items: [
          {
            product_id: latest.id,
            purchase_price: Number(latest.purchase_price ?? 0),
            name: latest.name,
            quantity: qty,
            price: Number(latest.price),
            subtotal: itemTotal,
          },
        ],
        total: itemTotal,
        status: "pending",
        tracking_token_hash: trackingTokenHash,
        notes: customer.notes.trim(),
      };

      const { data, error: orderError } = await supabase
        .from("orders")
        .insert(payload)
        .select("id")
        .single();

      if (orderError) throw orderError;

      setOrderId(data.id);
      const url = new URL("/track-order", window.location.origin);
url.searchParams.set("token", trackingToken);
setTrackingUrl(url.toString());
      setCustomer({
        name: "",
        phone: "",
        address: "",
        notes: "",
      });
      setProductId("");
      setQuantity("1");
    } catch (err) {
      setError(
        "অর্ডার জমা হয়নি: " +
          (err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।")
      );
    } finally {
      setSubmitting(false);
    }
  }

  
if (orderId !== null) {
  return (
    <main className="checkout-page">
      <section className="checkout-card checkout-result">
        <CheckCircle size={54} />
        <h1>অর্ডার সফল হয়েছে!</h1>

        <p>আপনার অর্ডার নম্বর:</p>
        <strong>#{orderId}</strong>

        {trackingUrl && (
          <a
            href={trackingUrl}
            className="checkout-submit"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px 0",
              textDecoration: "none",
            }}
          >
            অর্ডার ট্র্যাক করুন →
          </a>
        )}

        {trackingUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="checkout-submit"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "12px",
              background: "#25D366",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            WhatsApp-এ Tracking Link শেয়ার করুন
          </a>
        )}

        <p>
          SeaFish Bogura থেকে অর্ডার নিশ্চিত করার জন্য
          আপনার সঙ্গে যোগাযোগ করা হবে।
        </p>

        <a href="/" className="checkout-submit">
          হোমপেজে ফিরে যান
        </a>
      </section>
    </main>
  );
}


  return (
    <main className="checkout-page">
      <section className="checkout-card">
        <a href="/" className="checkout-back">
          <ArrowLeft size={18} /> হোমপেজ
        </a>

        <div className="checkout-brand">
          <Fish size={30} />
          <div>
            <strong>SeaFish Bogura</strong>
            <span>BOGURA · BANGLADESH</span>
          </div>
        </div>

        <h1>আপনার অর্ডার সম্পন্ন করুন</h1>
        <p className="checkout-subtitle">
          মাছ নির্বাচন করুন এবং ডেলিভারির তথ্য দিন।
        </p>

        {loading ? (
          <p>পণ্যের তালিকা লোড হচ্ছে...</p>
        ) : (
          <form onSubmit={submitOrder} className="checkout-form">
            <label>
              পছন্দের মাছ *
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">মাছ নির্বাচন করুন</option>
                {products
                  .filter((item) => Number(item.stock) > 0)
                  .map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name} — {money(item.price)}/কেজি
                      {" (স্টক " + item.stock + " কেজি)"}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              পরিমাণ (কেজি) *
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

            {selectedProduct && (
              <div className="checkout-product-summary">
                {selectedProduct.image_url && (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                  />
                )}
                <div>
                  <strong>{selectedProduct.name}</strong>
                  <p>{money(selectedProduct.price)} × {qty} কেজি</p>
                </div>
                <strong>{money(total)}</strong>
              </div>
            )}

            <label>
              আপনার সম্পূর্ণ নাম *
              <input
                required
                maxLength={100}
                autoComplete="name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="নাম লিখুন"
              />
            </label>

            <label>
              মোবাইল নম্বর *
              <input
                type="tel"
                required
                maxLength={20}
                autoComplete="tel"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                placeholder="01XXXXXXXXX"
              />
            </label>

            <label>
              সম্পূর্ণ ডেলিভারি ঠিকানা *
              <textarea
                required
                maxLength={1000}
                autoComplete="street-address"
                rows={3}
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
                placeholder="বাড়ি, গ্রাম/এলাকা, উপজেলা, জেলা"
              />
            </label>

            <label>
              অতিরিক্ত নির্দেশনা (ঐচ্ছিক)
              <textarea
                maxLength={1000}
                rows={2}
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({ ...customer, notes: e.target.value })
                }
                placeholder="ডেলিভারি সম্পর্কে বিশেষ নির্দেশনা"
              />
            </label>

            <div className="checkout-total">
              <span>মোট পণ্যমূল্য</span>
              <strong>{money(total)}</strong>
            </div>

            <p className="checkout-note">
              ডেলিভারি চার্জ অর্ডার নিশ্চিত করার সময় জানানো হবে।
            </p>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="checkout-submit"
              disabled={submitting || products.length === 0}
            >
              <ShoppingBag size={19} />
              {submitting ? "অর্ডার জমা হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
