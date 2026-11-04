"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Fish,
  RefreshCw,
} from "lucide-react";
import "./OrderTracking.css";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const statusDetails = {
  pending: {
    label: "অর্ডার অপেক্ষমাণ",
    description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে। নিশ্চিতকরণের অপেক্ষায় আছে।",
    icon: Clock,
  },
  confirmed: {
    label: "অর্ডার নিশ্চিত",
    description: "আপনার অর্ডারটি নিশ্চিত করা হয়েছে।",
    icon: CheckCircle,
  },
  processing: {
    label: "প্রস্তুত করা হচ্ছে",
    description: "আপনার অর্ডারটি প্রস্তুত করা হচ্ছে।",
    icon: Package,
  },
  delivered: {
    label: "ডেলিভারি সম্পন্ন",
    description: "আপনার অর্ডারটি ডেলিভারি সম্পন্ন হয়েছে।",
    icon: Truck,
  },
  cancelled: {
    label: "অর্ডার বাতিল",
    description: "আপনার অর্ডারটি বাতিল করা হয়েছে।",
    icon: XCircle,
  },
};

export default function OrderTracking() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder() {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setError("Tracking link সঠিক নয়। আপনার অর্ডারের Tracking Link ব্যবহার করুন।");
      setLoading(false);
      return;
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("Tracking link সঠিক নয়।");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("track-order", {
          body: {
            mode: "token",
            token,
          },
        });

      if (functionError) {
        throw new Error("অর্ডারের তথ্য পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
      }

      if (data?.error) {
        throw new Error(
          data.error === "Order not found"
            ? "অর্ডার পাওয়া যায়নি। Tracking Link পরীক্ষা করুন।"
            : data.error
        );
      }

      if (!data?.order) {
        throw new Error("অর্ডারের তথ্য পাওয়া যায়নি।");
      }

      setOrder(data.order);
    } catch (err) {
      setOrder(null);
      setError(err.message || "অর্ডার লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, []);

  const status = statusDetails[order?.status] || {
    label: order?.status || "অজানা",
    description: "অর্ডারের বর্তমান অবস্থা জানতে আমাদের সঙ্গে যোগাযোগ করুন।",
    icon: Package,
  };

  const StatusIcon = status.icon;
  const paymentStatusDetails = {
  pending: {
    label: "পেমেন্ট যাচাই চলছে",
    description: "আপনার পেমেন্ট এখনো যাচাই করা হয়নি।",
    color: "#d97706",
  },
  verified: {
    label: "পেমেন্ট নিশ্চিত হয়েছে",
    description: "আপনার পেমেন্ট সফলভাবে যাচাই করা হয়েছে।",
    color: "#16a34a",
  },
  rejected: {
    label: "পেমেন্ট গ্রহণ করা হয়নি",
    description: "আপনার Transaction ID যাচাই করা যায়নি। আমাদের সঙ্গে যোগাযোগ করুন।",
    color: "#dc2626",
  },
};

const paymentStatus =
  paymentStatusDetails[order?.payment_status] ||
  paymentStatusDetails.pending;

  return (
    <main className="tracking-page">
      <section className="tracking-card">
        <a href="/" className="tracking-back">
          <ArrowLeft size={18} />
          হোমপেজে ফিরে যান
        </a>

        <div className="tracking-brand">
          <Fish size={32} />
          <div>
            <strong>SeaFish Bogura</strong>
            <span>BOGURA · BANGLADESH</span>
          </div>
        </div>

        <h1>আপনার অর্ডার ট্র্যাক করুন</h1>
        <p className="tracking-subtitle">
          আপনার অর্ডারের বর্তমান অবস্থা এখানে দেখতে পারবেন।
        </p>

        {loading ? (
          <div className="tracking-message">
            <RefreshCw className="tracking-spinner" size={30} />
            <p>অর্ডারের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="tracking-error" role="alert">
            <XCircle size={28} />
            <p>{error}</p>
            <button
              type="button"
              className="tracking-button"
              onClick={loadOrder}
            >
              <RefreshCw size={17} />
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : order ? (
          <>
            <div className="tracking-status">
              <StatusIcon size={34} />
              <div>
                <span>বর্তমান অবস্থা</span>
                <h2>{status.label}</h2>
                <p>{status.description}</p>
              </div>
            </div>

            <div className="tracking-details">
              <div>
                <span>অর্ডার নম্বর</span>
                <strong>#{order.id}</strong>
              </div>
              <div>
                <span>অর্ডারের তারিখ</span>
                <strong>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("bn-BD")
                    : "—"}
                </strong>
              </div>
              <div>
                <span>মোট পণ্যমূল্য</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
            <div className="tracking-payment">
  <h3>পেমেন্টের তথ্য</h3>

  <div>
    <span>পেমেন্ট পদ্ধতি</span>
    <strong>{order.payment_method || "Cash on Delivery"}</strong>
  </div>

  <div>
    <span>পেমেন্ট মাধ্যম</span>
    <strong>{order.advance_payment_method || "N/A"}</strong>
  </div>

  <div>
    <span>Transaction ID</span>
    <strong>{order.transaction_id || "প্রযোজ্য নয়"}</strong>
  </div>

  <div>
    <span>Advance Amount</span>
    <strong>{money(order.advance_amount)}</strong>
  </div>

  <div>
    <span>Payment Status</span>
    <strong style={{ color: paymentStatus.color }}>
      {paymentStatus.label}
    </strong>
  </div>

  <p>{paymentStatus.description}</p>
</div>

            <div className="tracking-items">
              <h3>অর্ডারের পণ্য</h3>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    className="tracking-item"
                    key={`${item.product_id ?? item.name}-${index}`}
                  >
                    <div>
                      <strong>{item.name || "মাছ"}</strong>
                      <span>
                        {item.quantity} কেজি × {money(item.price)}
                      </span>
                    </div>
                    <strong>
                      {money(
                        item.subtotal ??
                          Number(item.quantity || 0) *
                            Number(item.price || 0)
                      )}
                    </strong>
                  </div>
                ))
              ) : (
                <p>পণ্যের বিবরণ পাওয়া যায়নি।</p>
              )}
            </div>

            <button
              type="button"
              className="tracking-button"
              onClick={loadOrder}
            >
              <RefreshCw size={17} />
              স্ট্যাটাস রিফ্রেশ করুন
            </button>
          </>
        ) : null}

        <p className="tracking-footer">
          সহায়তা প্রয়োজন হলে SeaFish Bogura-এর সঙ্গে যোগাযোগ করুন।
        </p>
      </section>
    </main>
  );
}
