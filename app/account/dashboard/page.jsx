
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/supabaseClient";

export default function CustomerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
    district: "",
    division: "",
    postal_code: "",
  });

  useEffect(() => {
    async function loadDashboard() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/account");
        return;
      }

      const currentUser = authData.user;
      setUser(currentUser);

      // Load Customer Profile
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        setMessage("Profile Load Error: " + error.message);
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          district: data.district || "",
          division: data.division || "",
          postal_code: data.postal_code || "",
        });
      }

      setLoading(false);

      // Load Customer Orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, items, total, status, payment_status, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (orderError) {
        setOrdersError(orderError.message);
      } else {
        setOrders(orderData || []);
      }

      setOrdersLoading(false);
    }

    loadDashboard();
  }, [router]);

  function handleChange(e) {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!user) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("customer_profiles")
      .upsert(
        {
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      setMessage("Save Failed: " + error.message);
    } else {
      setMessage("আপনার Profile সফলভাবে Update হয়েছে!");
    }

    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/account");
  }

  const inputStyle = {
    width: "100%",
    padding: 12,
    marginTop: 7,
    marginBottom: 16,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 15,
    boxSizing: "border-box",
  };

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    background: "#ffffff",
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading Dashboard...</p>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f5",
        padding: "35px 15px",
      }}
    >
      <div
        style={{
          maxWidth: 750,
          margin: "auto",
          background: "#fff",
          padding: 30,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            background: "#e0f2fe",
            color: "#0369a1",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          ← Back to Home
        </button>

        <h1 style={{ color: "#075985" }}>
          🐟 SeaFish Bogura
        </h1>

        <h2>Customer Dashboard</h2>

        <p>Welcome, {profile.full_name || user?.email}</p>
        <p style={{ color: "#64748b" }}>{user?.email}</p>

        <hr style={{ margin: "25px 0" }} />

        {/* MY ORDERS */}
        <h2>📦 My Orders</h2>
        <p style={{ color: "#64748b" }}>
          আপনার অর্ডারগুলোর বিস্তারিত এখানে দেখতে পারবেন।
        </p>

        {ordersLoading ? (
          <p>Loading Orders...</p>
        ) : ordersError ? (
          <p style={{ color: "#dc2626" }}>
            Orders Load Error: {ordersError}
          </p>
        ) : orders.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ color: "#64748b" }}>
              এখনো কোনো অর্ডার পাওয়া যায়নি।
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "#047857",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              মাছ কিনুন
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={cardStyle}>
              <h3 style={{ color: "#075985", marginTop: 0 }}>
                Order #{order.id}
              </h3>

              <p>
                <strong>Order Date:</strong>{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("en-BD")
                  : "N/A"}
              </p>

              <p><strong>Products:</strong></p>

              {Array.isArray(order.items) &&
                order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    🐟 {item.name} × {item.quantity} kg
                    <br />
                    <span style={{ color: "#64748b" }}>
                      Subtotal: ৳
                      {Number(item.subtotal || 0).toLocaleString("en-BD")}
                    </span>
                  </div>
                ))}

              <h3>
                Total: ৳
                {Number(order.total || 0).toLocaleString("en-BD")}
              </h3>

              <p>
                <strong>Order Status:</strong>{" "}
                <span style={{ color: "#0369a1" }}>
                  {order.status || "Pending"}
                </span>
              </p>

              <p>
                <strong>Payment Status:</strong>{" "}
                <span style={{ color: "#047857" }}>
                  {order.payment_status || "Pending"}
                </span>
              </p>
              <button
  type="button"
  onClick={() =>
    router.push(`/account/orders/${order.id}`)
  }
  style={{
    background: "#0369a1",
    color: "#ffffff",
    border: "none",
    padding: "11px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 12,
  }}
>
  View Order Details →
</button>
            </div>
          ))
        )}

        <hr style={{ margin: "30px 0" }} />

        {/* MY PROFILE */}
        <h2>👤 My Profile</h2>
        <p>আপনার ব্যক্তিগত তথ্য এখানে Update করুন।</p>

        <form onSubmit={handleSave}>
          <label>Full Name</label>
          <input
            style={inputStyle}
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            placeholder="আপনার নাম"
            required
          />

          <label>Phone Number</label>
          <input
            style={inputStyle}
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
          />

          <label>Delivery Address</label>
          <textarea
            style={inputStyle}
            name="address"
            value={profile.address}
            onChange={handleChange}
            placeholder="আপনার সম্পূর্ণ ঠিকানা"
            rows={3}
          />

          <label>Division</label>
          <input
            style={inputStyle}
            name="division"
            value={profile.division}
            onChange={handleChange}
            placeholder="যেমন: Rajshahi"
          />

          <label>District</label>
          <input
            style={inputStyle}
            name="district"
            value={profile.district}
            onChange={handleChange}
            placeholder="যেমন: Bogura"
          />

          <label>Postal Code</label>
          <input
            style={inputStyle}
            name="postal_code"
            value={profile.postal_code}
            onChange={handleChange}
            placeholder="যেমন: 5800"
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#047857",
              color: "white",
              border: "none",
              padding: "13px 25px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 20, color: "#047857" }}>
            {message}
          </p>
        )}

        <hr style={{ margin: "25px 0" }} />

        <button
          onClick={handleLogout}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}
