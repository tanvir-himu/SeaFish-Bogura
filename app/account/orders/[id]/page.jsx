
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../src/supabaseClient";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

useEffect(() => {
  let channel = null;
  let cancelled = false;

  async function loadOrder() {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (cancelled) return;

    if (authError || !authData.user) {
      router.replace("/account");
      return;
    }

    const currentUser = authData.user;
    const orderId = String(params.id);

    // Subscribe to realtime updates
    channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("ORDER REALTIME UPDATE:", payload.new);

          if (payload.new.user_id === currentUser.id) {
            setOrder((previous) => ({
              ...previous,
              ...payload.new,
            }));
          }
        }
      )
      .subscribe((status, err) => {
        console.log("ORDER REALTIME STATUS:", status);

        if (err) {
          console.error("Realtime Subscription Error:", err);
        }
      });

    // Load initial order
    const { data, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", currentUser.id)
      .single();

    if (cancelled) return;

    if (orderError) {
      setError(
        orderError.code === "PGRST116"
          ? "অর্ডারটি পাওয়া যায়নি অথবা আপনার দেখার অনুমতি নেই।"
          : orderError.message
      );
      setLoading(false);
      return;
    }

    setOrder(data);
    setLoading(false);
  }

  if (params.id) {
    loadOrder();
  }

  return () => {
    cancelled = true;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, [params.id, router]);



  const money = (amount) =>
    "৳" + Number(amount || 0).toLocaleString("en-BD");
  
const trackingSteps = [
  { status: "pending", label: "অর্ডার গ্রহণ করা হয়েছে" },
  { status: "confirmed", label: "অর্ডার নিশ্চিত করা হয়েছে" },
  { status: "processing", label: "অর্ডার প্রস্তুত করা হচ্ছে" },
  { status: "delivered", label: "অর্ডার ডেলিভারি সম্পন্ন" },
];

const currentStep = trackingSteps.findIndex(
  (step) => step.status === String(order?.status || "").toLowerCase()
);


  const statusColor = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "delivered") return "#047857";
    if (value === "cancelled") return "#dc2626";
    if (value === "pending") return "#d97706";

    return "#0369a1";
  };

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    marginBottom: 18,
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading Order Details...</p>;
  }

  if (error || !order) {
    return (
      <main style={{ padding: 30, textAlign: "center" }}>
        <h2>Order Not Found</h2>
        <p style={{ color: "#dc2626" }}>
          {error || "অর্ডারটি পাওয়া যায়নি।"}
        </p>
        <button onClick={() => router.push("/account/dashboard")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f5",
        padding: "30px 15px",
      }}
    >
      <div style={{ maxWidth: 750, margin: "auto" }}>
        <button
          onClick={() => router.push("/account/dashboard")}
          style={{
            background: "#e0f2fe",
            color: "#0369a1",
            border: "none",
            padding: "11px 17px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20,
            fontWeight: "bold",
          }}
        >
          ← Back to My Orders
        </button>

        <div style={cardStyle}>
          <h1 style={{ color: "#075985", marginTop: 0 }}>
            🐟 SeaFish Bogura
          </h1>

          <h2>Order Details</h2>

          <p>
            <strong>Order ID:</strong> #{order.id}
          </p>

          <p>
            <strong>Order Date:</strong>{" "}
            {order.created_at
              ? new Date(order.created_at).toLocaleString("en-BD")
              : "N/A"}
          </p>

          <p>
            <strong>Order Status:</strong>{" "}
            <span style={{ color: statusColor(order.status) }}>
              {order.status || "Pending"}
            </span>
          </p>

          <p>
            <strong>Payment Status:</strong>{" "}
            {order.payment_status || "Pending"}
          </p>
        </div>
        
{/* ORDER TRACKING TIMELINE */}
<div style={cardStyle}>
  <h2>🚚 Order Tracking</h2>

  {String(order.status).toLowerCase() === "cancelled" ? (
    <div
      style={{
        padding: 15,
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: 8,
        fontWeight: "bold",
      }}
    >
      ❌ এই অর্ডারটি Cancel করা হয়েছে।
    </div>
  ) : (
    <div style={{ marginTop: 25 }}>
      {trackingSteps.map((step, index) => {
        const completed = index <= currentStep;

        return (
          <div
            key={step.status}
            style={{
              display: "flex",
              gap: 15,
              minHeight: 75,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 28,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: "50%",
                  background: completed ? "#047857" : "#e2e8f0",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                {completed ? "✓" : index + 1}
              </div>

              {index !== trackingSteps.length - 1 && (
                <div
                  style={{
                    width: 3,
                    flex: 1,
                    minHeight: 40,
                    background: index < currentStep ? "#047857" : "#e2e8f0",
                  }}
                />
              )}
            </div>

            <div style={{ paddingBottom: 20 }}>
              <strong
                style={{
                  color: completed ? "#047857" : "#94a3b8",
                }}
              >
                {step.label}
              </strong>

              <p
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  marginTop: 5,
                }}
              >
                {completed
                  ? "সম্পন্ন"
                  : "এখনো সম্পন্ন হয়নি"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>


        <div style={cardStyle}>
          <h2>🐟 Ordered Products</h2>

          {Array.isArray(order.items) && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "13px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <strong>{item.name}</strong>
                <p style={{ margin: "7px 0", color: "#64748b" }}>
                  Quantity: {item.quantity} kg
                </p>
                <p style={{ margin: 0 }}>
                  Price: {money(item.price)} / kg
                </p>
                <p style={{ marginBottom: 0, fontWeight: "bold" }}>
                  Subtotal: {money(item.subtotal)}
                </p>
              </div>
            ))
          ) : (
            <p>No product information available.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2>💰 Payment Summary</h2>

          <p>
            Product Total: {money(
              Number(order.total || 0) -
              Number(order.delivery_charge || 0) +
              Number(order.discount_amount || 0)
            )}
          </p>

          <p>
            Delivery Charge: {money(order.delivery_charge)}
          </p>

          <p>
            Discount: {money(order.discount_amount)}
          </p>

          <hr />

          <h2 style={{ color: "#047857" }}>
            Grand Total: {money(order.total)}
          </h2>

          <p>
            <strong>Payment Method:</strong>{" "}
            {order.payment_method || "N/A"}
          </p>

          <p>
            <strong>Transaction ID:</strong>{" "}
            {order.transaction_id || "N/A"}
          </p>
        </div>

        <div style={cardStyle}>
          <h2>📍 Delivery Information</h2>

          <p>
            <strong>Name:</strong> {order.customer_name}
          </p>

          <p>
            <strong>Phone:</strong> {order.phone}
          </p>

          <p>
            <strong>Address:</strong> {order.address}
          </p>

          {order.notes && (
            <p>
              <strong>Notes:</strong> {order.notes}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
