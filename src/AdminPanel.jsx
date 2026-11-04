"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "./supabaseClient";
import "./AdminPanel.css";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  purchase_price: "",
  stock: "",
  image_url: "",
  category: "Fish",
  discount_percent: "0",
  is_active: true,
};

const money = (value) =>
  "৳" + Number(value || 0).toLocaleString("en-BD");
const getCroppedImage = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("ছবি Crop করা যায়নি।"));
        return;
      }

      resolve(
  new File([blob], "cropped-product.webp", {
    type: "image/webp",
  })
);
    }, "image/webp", 0.82);
  });
};

export default function AdminPanel() {
    
    


  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [reportPeriod, setReportPeriod] = useState("daily");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [manualOrder, setManualOrder] = useState({
  customer_name: "",
  phone: "",
  address: "",
  notes: "",
});

const [manualOrderItems, setManualOrderItems] = useState([]);
const [selectedProductId, setSelectedProductId] = useState("");
const [selectedQty, setSelectedQty] = useState("1");
const [savingManualOrder, setSavingManualOrder] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState(null);
  useEffect(() => {
  if (!imageFile) {
    setImagePreview("");
    return;
  }

  const previewUrl = URL.createObjectURL(imageFile);
  setImagePreview(previewUrl);

  return () => {
    URL.revokeObjectURL(previewUrl);
  };
}, [imageFile]);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);

const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [showCropper, setShowCropper] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 1. Supabase Session Check
useEffect(() => {
  let alive = true;

  supabase.auth.getSession().then(({ data, error }) => {
    if (!alive) return;

    if (error) setError(error.message);

    setSession(data?.session ?? null);
    setLoading(false);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, nextSession) => {
      if (!alive) return;

      setSession(nextSession);
      setLoading(false);
    }
  );

  return () => {
    alive = false;
    listener.subscription.unsubscribe();
  };
}, []);


// 2. Admin Permission Check
// 2. Admin Permission Check
useEffect(() => {
  let alive = true;

  async function checkAdmin() {
    setAdminChecking(true);
    setIsAdmin(false);

    try {
      const userId = session?.user?.id;

      if (!userId) {
        setIsAdmin(false);
        return;
      }

      const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!alive) return;

      if (adminError) {
        setError("Admin যাচাই ব্যর্থ: " + adminError.message);
        setIsAdmin(false);
        return;
      }

      if (!data) {
        setError("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
        setIsAdmin(false);
        return;
      }

      setError("");
      setIsAdmin(true);

    } catch (err) {
      if (alive) {
        setError("Admin যাচাই সমস্যা: " + err.message);
        setIsAdmin(false);
      }
    } finally {
      if (alive) {
        setAdminChecking(false);
      }
    }
  }

  checkAdmin();

  return () => {
    alive = false;
  };
}, [session?.user?.id]);


// 3. Load Admin Data
useEffect(() => {
  if (isAdmin) {
    loadData();
  }
}, [isAdmin]);
async function loadData() {
  setError("");

  const [p, o] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false }),

    supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false }),
  ]);

  if (p.error) {
    setError("Products: " + p.error.message);
  } else {
    setProducts(p.data ?? []);
  }

  if (o.error) {
    setError((previous) =>
      [previous, "Orders: " + o.error.message]
        .filter(Boolean)
        .join(" | ")
    );
  } else {
    setOrders(o.data ?? []);
  }
}
  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) setError(error.message);
    setBusy(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setPassword("");
    setTab("dashboard");
  }

  function newProduct() {
    setEditingId(null);
    setProduct(emptyProduct);
    setImageFile(null);
    setMessage("");
    setTab("products");
  }

  function editProduct(item) {
    setImageFile(null);
    setEditingId(item.id);
    setProduct({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
purchase_price: String(item.purchase_price ?? 0),
stock: String(item.stock),
      image_url: item.image_url ?? "",
      category: item.category ?? "Fish",
      is_active: item.is_active,
      discount_percent: String(item.discount_percent ?? 0),
    });
    setTab("products");
  }

  async function saveProduct(event) {
  event.preventDefault();

  setBusy(true);
  setError("");
  setMessage("");

  try {
    let imageUrl = product.image_url.trim();

    // Validate product information
    const price = Number(product.price);
    const stock = Number(product.stock);

    if (
      !product.name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      throw new Error("সঠিক পণ্যের নাম, দাম ও স্টক দিন।");
    }

    // Upload image if a local file is selected
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("শুধু Image File Upload করতে পারবেন।");
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("ছবির সাইজ 5MB-এর কম হতে হবে।");
      }

      const safeFileName = imageFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );

      const filePath = `products/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const payload = {
      name: product.name.trim(),
      description: product.description.trim(),
      price,
purchase_price: Number(product.purchase_price || 0),
stock,
      image_url: imageUrl,
      category: product.category.trim() || "Fish",
      is_active: product.is_active,
      discount_percent: Number(product.discount_percent || 0),
    };

    const result = editingId
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      throw result.error;
    }

    setMessage(
      editingId ? "পণ্য আপডেট হয়েছে।" : "পণ্য যোগ হয়েছে।"
    );

    setProduct(emptyProduct);
    setImageFile(null);
    setEditingId(null);

    await loadData();

  } catch (err) {
    setError(err.message || "পণ্য সংরক্ষণ করা যায়নি।");
  } finally {
    setBusy(false);
  }
}

  async function deleteProduct(item) {
    if (!window.confirm(`${item.name} মুছে ফেলবেন?`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else {
      setMessage("পণ্য মুছে ফেলা হয়েছে।");
      await loadData();
    }
  }
  function addManualOrderItem() {
  const productId = selectedProductId;
  const qty = Number(selectedQty);

  const selectedProduct = products.find(
    (item) => String(item.id) === String(productId)
  );

  if (!selectedProduct) {
    setError("প্রথমে একটি মাছ নির্বাচন করুন।");
    return;
  }

  if (!Number.isInteger(qty) || qty < 1) {
    setError("সঠিক পরিমাণ লিখুন।");
    return;
  }

  if (qty > Number(selectedProduct.stock)) {
    setError(
      `${selectedProduct.name}-এর স্টক মাত্র ${selectedProduct.stock} কেজি।`
    );
    return;
  }

  const existing = manualOrderItems.find(
    (item) => String(item.product_id) === String(productId)
  );

  const newQty = (existing?.quantity ?? 0) + qty;

  if (newQty > Number(selectedProduct.stock)) {
    setError(
      `${selectedProduct.name}-এর পর্যাপ্ত স্টক নেই।`
    );
    return;
  }

  setManualOrderItems((current) => {
    const found = current.find(
      (item) => String(item.product_id) === String(productId)
    );

    if (found) {
      return current.map((item) =>
        String(item.product_id) === String(productId)
          ? { ...item, quantity: newQty, subtotal: newQty * item.price }
          : item
      );
    }

    return [
      ...current,
      {
        product_id: selectedProduct.id,
        purchase_price: Number(selectedProduct.purchase_price ?? 0),
        name: selectedProduct.name,
        quantity: qty,
        price: Number(selectedProduct.price),
        subtotal: Number(selectedProduct.price) * qty,
      },
    ];
  });

  setSelectedProductId("");
  setSelectedQty("1");
  setError("");
}

function removeManualOrderItem(productId) {
  setManualOrderItems((current) =>
    current.filter(
      (item) => String(item.product_id) !== String(productId)
    )
  );
}

async function saveManualWhatsAppOrder(event) {
  event.preventDefault();
  setError("");
  setMessage("");

  if (manualOrderItems.length === 0) {
    setError("অর্ডারে অন্তত একটি মাছ যোগ করুন।");
    return;
  }

  if (
    !manualOrder.customer_name.trim() ||
    !manualOrder.phone.trim() ||
    !manualOrder.address.trim()
  ) {
    setError("ক্রেতার নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।");
    return;
  }

  const phone = manualOrder.phone.trim();

  if (!/^[0-9+\-\s()]{10,20}$/.test(phone)) {
    setError("সঠিক ফোন নম্বর লিখুন।");
    return;
  }

  setSavingManualOrder(true);

  try {
    const total = manualOrderItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    const payload = {
      order_source: "whatsapp",
      customer_name: manualOrder.customer_name.trim(),
      phone,
      address: manualOrder.address.trim(),
      items: manualOrderItems,
      total,
      status: "pending",
      notes: manualOrder.notes.trim(),
    };

    const { error: insertError } = await supabase
      .from("orders")
      .insert(payload);

    if (insertError) {
      throw new Error(insertError.message);
    }

    setMessage("WhatsApp অর্ডার সফলভাবে সংরক্ষণ হয়েছে।");

    setManualOrder({
      customer_name: "",
      phone: "",
      address: "",
      notes: "",
    });

    setManualOrderItems([]);
    setSelectedProductId("");
    setSelectedQty("1");

    await loadData();
  } catch (err) {
    setError("অর্ডার সংরক্ষণ করা যায়নি: " + err.message);
  } finally {
    setSavingManualOrder(false);
  }
}

  async function updateStatus(orderId, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) setError(error.message);
    else {
      setMessage("অর্ডার আপডেট হয়েছে।");
      await loadData();
    }
  }
  async function updatePaymentStatus(orderId, paymentStatus) {
  setError("");
  setMessage("");

  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);

  if (error) {
    setError("Payment Status Update Failed: " + error.message);
  } else {
    setMessage(
      paymentStatus === "verified"
        ? "Payment সফলভাবে Verify হয়েছে।"
        : "Payment Reject করা হয়েছে।"
    );

    await loadData();
  }
}
function exportSalesCSV() {
  const headers = [
    "Order ID",
    "Customer",
    "Phone",
    "Fish",
    "Quantity (KG)",
    "Total Sales",
    "Date",
  ];

  const rows = filteredSalesOrders.map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    return [
      order.id,
      order.customer_name,
      order.phone,
      items.map((item) => item.name || item.product_name || "Fish").join(", "),
      items.reduce(
        (sum, item) => sum + Number(item.quantity || item.qty || 0),
        0
      ),
      order.total,
      new Date(order.created_at).toLocaleDateString("en-GB"),
    ];
  });

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row.map((value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`
      ).join(",")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `SeaFish-Sales-${reportPeriod}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function exportSalesPDF() {
  window.print();
}

  // 1. Loading Check
if (loading) {
  return (
    <div className="admin-loading">
      Loading SeaFish Admin...
    </div>
  );
}

// 2. Login Check
if (!session) {
  return (
    <main className="admin-login-page">
      {/* এখানে আপনার আগের সম্পূর্ণ Login JSX রাখুন */}
    </main>
  );
}

// 3. Admin Permission Checking
if (adminChecking) {
  return (
    <div className="admin-loading">
      Admin Permission যাচাই হচ্ছে...
    </div>
  );
}

// 4. Admin Access Check
if (!isAdmin) {
  return (
    <main className="admin-login-page">
      {/* এখানে আপনার আগের সম্পূর্ণ Admin Access JSX রাখুন */}
    </main>
  );
}

  if (!session) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-brand-mark">SF</div>
          <p className="admin-eyebrow">SEAFISH BOGURA</p>
          <h1>Admin Login</h1>
          <p className="admin-muted">আপনার অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।</p>

          <label>
            ইমেইল
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            পাসওয়ার্ড
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="admin-error">{error}</p>}

          <button className="admin-primary" disabled={busy}>
            {busy ? "অপেক্ষা করুন..." : "লগইন করুন"}
          </button>
          <a href="/" className="admin-back-link">← হোমপেজে ফিরুন</a>
        </form>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <h1>Admin Access</h1>
          <p className="admin-error">
            {error || "আপনার Admin অনুমতি যাচাই করা হচ্ছে..."}
          </p>
          <p className="admin-muted">
            Supabase-এর admin_users টেবিলে আপনার User ID যোগ করা হয়েছে কি না
            যাচাই করুন।
          </p>
          <button className="admin-secondary" onClick={logout}>Log out</button>
        </section>
      </main>
    );
  }

  const pending = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter(
  (order) => order.status === "delivered"
);

const totalSales = deliveredOrders.reduce(
  (sum, order) => sum + Number(order.total || 0),
  0
);

const totalDeliveredOrders = deliveredOrders.length;

const totalFishSold = deliveredOrders.reduce(
    (sum, order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    return sum + items.reduce(
      (itemSum, item) =>
        itemSum + Number(item.quantity || item.qty || 0),
      0
    );
  },
  0
);
  const now = new Date();

const todayStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
);

const tomorrowStart = new Date(todayStart);
tomorrowStart.setDate(tomorrowStart.getDate() + 1);

const weekStart = new Date(todayStart);
const day = weekStart.getDay();
weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));

const nextWeekStart = new Date(weekStart);
nextWeekStart.setDate(nextWeekStart.getDate() + 7);

const monthStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

const nextMonthStart = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  1
);

const periodStart =
  reportPeriod === "daily" ? todayStart :
  reportPeriod === "weekly" ? weekStart :
  monthStart;

const periodEnd =
  reportPeriod === "daily" ? tomorrowStart :
  reportPeriod === "weekly" ? nextWeekStart :
  nextMonthStart;

const filteredSalesOrders = deliveredOrders.filter((order) => {
  const orderDate = new Date(order.created_at);

  return orderDate >= periodStart && orderDate < periodEnd;
});

const periodRevenue = filteredSalesOrders.reduce(
  (sum, order) => sum + Number(order.total || 0),
  0
);

const periodFishSold = filteredSalesOrders.reduce(
  (sum, order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    return sum + items.reduce(
      (itemSum, item) =>
        itemSum + Number(item.quantity || item.qty || 0),
      0
    );
  },
  0
);
const fishSalesSummary = filteredSalesOrders.reduce(
  (summary, order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((item) => {
      const name =
        item.name ||
        item.product_name ||
        item.fish_name ||
        "অজানা মাছ";

      const quantity = Number(
        item.quantity || item.qty || 0
      );

      summary[name] = (summary[name] || 0) + quantity;
    });

    return summary;
  },
  {}
);
const fishWiseProfitSummary = filteredSalesOrders.reduce(
  (summary, order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((item) => {
      const name =
        item.name ||
        item.product_name ||
        item.fish_name ||
        "অজানা মাছ";

      const quantity = Number(item.quantity || item.qty || 0);
      const price = Number(item.price || 0);
      const revenue = Number(item.subtotal ?? price * quantity);

      const purchasePrice = Number(item.purchase_price || 0);
      const hasCost =
        item.purchase_price !== undefined &&
        item.purchase_price !== null &&
        purchasePrice > 0;

      if (!summary[name]) {
        summary[name] = {
          name,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          missingCost: false,
        };
      }

      summary[name].quantity += quantity;
      summary[name].revenue += revenue;
      summary[name].cost += purchasePrice * quantity;
      summary[name].profit += revenue - purchasePrice * quantity;

      if (!hasCost) {
        summary[name].missingCost = true;
      }
    });

    return summary;
  },
  {}
);

const fishWiseProfit = Object.values(fishWiseProfitSummary);

const topSellingFish = Object.entries(fishSalesSummary)
  .map(([name, quantity]) => ({
    name,
    quantity,
  }))
  .sort((a, b) => b.quantity - a.quantity)[0] || null;


const dailySalesData = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (6 - index));

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const sales = deliveredOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= date && orderDate < nextDate;
    })
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  return {
    date: date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    }),
    sales,
  };
});

const maxDailySales = Math.max(
  ...dailySalesData.map((item) => item.sales),
  1
);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-logo">🐟 SeaFish <span>Admin</span></a>

        {[
          ["dashboard", "▦ Dashboard"],
          ["products", "🐟 Products"],
          ["orders", "🛍 Orders"],
          ["sales", "📊 Sales Report"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`admin-nav ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}

        <div className="admin-sidebar-bottom">
          <a href="/">↗ ওয়েবসাইট দেখুন</a>
          <button className="admin-logout" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">STORE MANAGEMENT</p>
            <h1>
              {tab === "dashboard" ? "Dashboard" :
               tab === "products" ? "Products" : "Orders"}
            </h1>
          </div>
          <span className="admin-user">{session.user.email}</span>
        </header>

        {message && <p className="admin-success">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        {tab === "dashboard" && (
          <>
            <section className="admin-stats">
              <article className="admin-stat">
                <span>মোট পণ্য</span><strong>{products.length}</strong>
              </article>
              <article className="admin-stat">
                <span>মোট অর্ডার</span><strong>{orders.length}</strong>
              </article>
              <article className="admin-stat">
                <span>Pending</span><strong>{pending}</strong>
              </article>
              <article className="admin-stat">
                <span>অর্ডারের মোট মূল্য*</span><strong>{money(revenue)}</strong>
              </article>
            </section>
            <p className="admin-muted">
              *এটি বাতিল হয়নি এমন অর্ডারের মূল্য, নিশ্চিত আদায়কৃত বিক্রি নয়।
            </p>
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>সাম্প্রতিক অর্ডার</h2>
                <button className="admin-secondary" onClick={() => setTab("orders")}>
                  সব অর্ডার
                </button>
              </div>
              <OrdersTable
  orders={orders.slice(0, 5)}
  onStatus={updateStatus}
  onPaymentStatus={updatePaymentStatus}
/>
            </section>
          </>
        )}

        {tab === "products" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>{editingId ? "পণ্য সম্পাদনা" : "পণ্য ম্যানেজমেন্ট"}</h2>
              <button className="admin-primary" onClick={newProduct}>+ নতুন পণ্য</button>
            </div>

            <form className="admin-product-form" onSubmit={saveProduct}>
                <label>
  Discount (%)
  <input
    type="number"
    min="0"
    max="100"
    value={product.discount_percent}
    onChange={(e) =>
      setProduct({
        ...product,
        discount_percent: e.target.value,
      })
    }
    placeholder="যেমন: 10"
  />
</label>
              <label>পণ্যের নাম
                <input required value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })} />
              </label>
              <label>দাম (৳)
                <input required type="number" min="0" step="0.01" value={product.price}
                  onChange={(e) => setProduct({ ...product, price: e.target.value })} />
              </label>
              <label>ক্রয়মূল্য (৳)
  <input
    required
    type="number"
    min="0"
    step="0.01"
    value={product.purchase_price ?? ""}
    onChange={(e) =>
      setProduct({
        ...product,
        purchase_price: e.target.value
      })
    }
    placeholder="মাছ কেনার দাম"
  />
</label>
              <label>স্টক
                <input required type="number" min="0" step="1" value={product.stock}
                  onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
              </label>
              <label>ক্যাটাগরি
                <input value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })} />
              </label>
              <label className="admin-full-width">
  কম্পিউটার থেকে ছবি Upload করুন

  <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setSelectedImageForCrop(imageUrl);
      setImageFile(file);
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  }}
/>
  </label>
  {showCropper && selectedImageForCrop && (
  <div className="crop-modal">
    <div className="crop-container">
      <h3>ছবি Crop করুন</h3>

      <div className="crop-area">
        <Cropper
          image={selectedImageForCrop}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(area, pixels) => {
            setCroppedAreaPixels(pixels);
          }}
        />
      </div>

      <label>
        Zoom করুন
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </label>

      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-primary"
          onClick={() => setShowCropper(false)}
        >
          বাতিল
        </button>
      </div>
    </div>
  </div>
)}

  {imageFile && (
  <div className="admin-image-preview">
    <p>ছবির Preview:</p>

    <img
      src={imagePreview}
      alt="Product Preview"
      style={{
        width: "180px",
        height: "140px",
        objectFit: "cover",
        borderRadius: "10px",
        marginTop: "8px",
      }}
    />

    <p>{imageFile.name}</p>

    <button
      type="button"
      className="admin-secondary"
      onClick={() => {
        setImageFile(null);
      }}
    >
      ছবি পরিবর্তন করুন
    </button>
  </div>
)}

<label className="admin-full-width">
  অথবা ছবির URL দিন

  <input
    type="url"
    value={product.image_url}
    onChange={(e) =>
      setProduct({
        ...product,
        image_url: e.target.value,
      })
    }
    placeholder="https://..."
  />
</label>
              <label className="admin-full-width">বিবরণ
                <textarea value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={product.is_active}
                  onChange={(e) => setProduct({ ...product, is_active: e.target.checked })} />
                ওয়েবসাইটে দেখান
              </label>
              
<div className="admin-form-actions">
  {showCropper && selectedImageForCrop && (
    <button
      type="button"
      className="admin-primary"
      disabled={busy}
      onClick={async () => {
        try {
          if (!croppedAreaPixels || !selectedImageForCrop) {
            throw new Error("ছবি নির্বাচন করুন।");
          }

          const croppedFile = await getCroppedImage(
            selectedImageForCrop,
            croppedAreaPixels
          );

          const previewUrl = URL.createObjectURL(croppedFile);

          setImageFile(croppedFile);
          setImagePreview(previewUrl);
          setShowCropper(false);
          setSelectedImageForCrop(null);
          setError("");
          setMessage(
            `ছবি Crop সফল হয়েছে! WebP Size: ${(croppedFile.size / 1024).toFixed(2)} KB`
          );
        } catch (err) {
          setError("ছবি Crop করা যায়নি: " + err.message);
        }
      }}
    >
      ছবি Crop ও সংরক্ষণ করুন
    </button>
  )}

  <button
    type="submit"
    className="admin-primary"
    disabled={busy || showCropper}
  >
    {busy
      ? "সংরক্ষণ হচ্ছে..."
      : editingId
      ? "পরিবর্তন সংরক্ষণ করুন"
      : "পণ্য যোগ করুন"}
  </button>
</div>

            </form>

            <div className="admin-product-grid">
              {products.map((item) => (
                <article className="admin-product-card" key={item.id}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} />
                    : <div className="admin-image-placeholder">🐟</div>}
                  <div className="admin-product-details">
                    <h3>{item.name}</h3>
                    <p>{money(item.price)} · স্টক {item.stock}</p>
                    <p>{item.is_active ? "সক্রিয়" : "লুকানো"}</p>
                    <div className="admin-actions">
                      <button className="admin-secondary" onClick={() => editProduct(item)}>
                        Edit
                      </button>
                      <button className="admin-danger" onClick={() => deleteProduct(item)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>সব অর্ডার ({orders.length})</h2>
              <button className="admin-secondary" onClick={loadData}>Refresh</button>
            </div>
            <div className="admin-panel" style={{ marginBottom: 24 }}>
  <div className="admin-panel-heading">
    <h2>+ WhatsApp অর্ডার যোগ করুন</h2>
  </div>

  <form
    className="admin-product-form"
    onSubmit={saveManualWhatsAppOrder}
  >
    <label>
      ক্রেতার নাম *
      <input
        required
        maxLength={100}
        value={manualOrder.customer_name}
        onChange={(e) =>
          setManualOrder({
            ...manualOrder,
            customer_name: e.target.value,
          })
        }
        placeholder="ক্রেতার সম্পূর্ণ নাম"
      />
    </label>

    <label>
      ফোন নম্বর *
      <input
        required
        type="tel"
        maxLength={20}
        value={manualOrder.phone}
        onChange={(e) =>
          setManualOrder({
            ...manualOrder,
            phone: e.target.value,
          })
        }
        placeholder="01XXXXXXXXX"
      />
    </label>

    <label className="admin-full-width">
      ডেলিভারি ঠিকানা *
      <textarea
        required
        maxLength={1000}
        value={manualOrder.address}
        onChange={(e) =>
          setManualOrder({
            ...manualOrder,
            address: e.target.value,
          })
        }
        placeholder="বাড়ি, এলাকা, উপজেলা, জেলা"
      />
    </label>

    <div className="admin-full-width">
      <h3>অর্ডারের মাছ নির্বাচন করুন</h3>

      <div className="admin-order-product-picker">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">মাছ নির্বাচন করুন</option>
          {products
            .filter(
              (item) =>
                item.is_active && Number(item.stock) > 0
            )
            .map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name} — {money(item.price)}/কেজি
                {" · স্টক " + item.stock + " কেজি"}
              </option>
            ))}
        </select>

        <input
          type="number"
          min="1"
          step="1"
          value={selectedQty}
          onChange={(e) => setSelectedQty(e.target.value)}
          aria-label="মাছের পরিমাণ কেজিতে"
          placeholder="কেজি"
        />

        <button
          type="button"
          className="admin-secondary"
          onClick={addManualOrderItem}
        >
          মাছ যোগ করুন
        </button>
      </div>
    </div>

    {manualOrderItems.length > 0 && (
      <div className="admin-full-width">
        <h3>নির্বাচিত মাছ</h3>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>মাছ</th>
                <th>পরিমাণ</th>
                <th>একক দাম</th>
                <th>মোট</th>
                <th>বাদ দিন</th>
              </tr>
            </thead>
            <tbody>
              {manualOrderItems.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.name}</td>
                  <td>{item.quantity} কেজি</td>
                  <td>{money(item.price)}</td>
                  <td>{money(item.subtotal)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-danger"
                      onClick={() =>
                        removeManualOrderItem(item.product_id)
                      }
                    >
                      বাদ দিন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          **মোট পণ্যমূল্য:{" "}
          {money(
            manualOrderItems.reduce(
              (sum, item) => sum + Number(item.subtotal),
              0
            )
          )}
        </p>
      </div>
    )}

    <label className="admin-full-width">
      অতিরিক্ত নোট
      <textarea
        maxLength={1000}
        value={manualOrder.notes}
        onChange={(e) =>
          setManualOrder({
            ...manualOrder,
            notes: e.target.value,
          })
        }
        placeholder="ডেলিভারি চার্জ, ক্রেতার বিশেষ অনুরোধ ইত্যাদি"
      />
    </label>

    <div className="admin-form-actions">
      <button
        type="submit"
        className="admin-primary"
        disabled={savingManualOrder}
      >
        {savingManualOrder
          ? "অর্ডার সংরক্ষণ হচ্ছে..."
          : "WhatsApp অর্ডার সংরক্ষণ করুন"}
      </button>
    </div>
  </form>
</div>
            <OrdersTable
  orders={orders}
  onStatus={updateStatus}
  onPaymentStatus={updatePaymentStatus}
/>
          </section>
          )}
          {tab === "sales" && (
  <section className="admin-panel sales-report-panel">
    <div className="admin-panel-heading">
      <h2>📊 Sales Report</h2>
      <div className="admin-actions" style={{ margin: "20px 0" }}>
  <button
    className={reportPeriod === "daily" ? "admin-primary" : "admin-secondary"}
    onClick={() => setReportPeriod("daily")}
  >
    Daily
  </button>

  <button
    className={reportPeriod === "weekly" ? "admin-primary" : "admin-secondary"}
    onClick={() => setReportPeriod("weekly")}
  >
    Weekly
  </button>

  <button
    className={reportPeriod === "monthly" ? "admin-primary" : "admin-secondary"}
    onClick={() => setReportPeriod("monthly")}
  >
    Monthly
  </button>
  <div className="admin-actions" style={{ marginBottom: "20px" }}>
  <button className="admin-secondary" onClick={exportSalesCSV}>
    📥 Export CSV
  </button>

  <button className="admin-primary" onClick={exportSalesPDF}>
    📄 Export PDF
  </button>
</div>
</div>
      <span>শুধু Delivered Orders</span>
    </div>

    <section className="admin-stats">
      <article className="admin-stat">
        <span>মোট বিক্রি</span>
        <strong>{money(periodRevenue)}</strong>
      </article>

      <article className="admin-stat">
        <span>Delivered Orders</span>
        <strong>{filteredSalesOrders.length}</strong>
      </article>

      <article className="admin-stat">
        <span>মোট বিক্রিত মাছ</span>
        <strong>{periodFishSold.toLocaleString("bn-BD")} কেজি</strong>
      </article>
    </section>

    <div className="admin-panel-heading">
      <div
  className="admin-stats"
  style={{
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    maxWidth: "650px"
  }}
>
  <article className="admin-stat">
    <span>🏆 সর্বাধিক বিক্রিত মাছ</span>

    <strong style={{
  whiteSpace: "nowrap",
  fontSize: "22px"
}}>
  {topSellingFish
    ? topSellingFish.name
    : "এখনো বিক্রি নেই"}
</strong>

    <p>
      {topSellingFish
        ? `${topSellingFish.quantity} কেজি বিক্রি`
        : ""}
    </p>
  </article>

  <article className="admin-stat">
    <span>📦 মোট Delivered অর্ডার</span>
    <strong>{filteredSalesOrders.length}</strong>
  </article>
</div>

<section className="admin-panel" style={{ marginTop: "24px" }}>
  <section className="admin-panel" style={{ marginTop: "24px" }}>
  <h2>💰 মাছভিত্তিক লাভ-ক্ষতির হিসাব</h2>

  <div style={{ overflowX: "auto" }}>
    <table className="admin-table">
      <thead>
        <tr>
          <th>মাছের নাম</th>
          <th>বিক্রি (কেজি)</th>
          <th>মোট বিক্রয়</th>
          <th>ক্রয়মূল্য</th>
          <th>লাভ</th>
        </tr>
      </thead>

      <tbody>
        {fishWiseProfit.map((fish, index) => (
          <tr key={index}>
            <td>{fish.name}</td>
            <td>{fish.quantity}</td>
            <td>{money(fish.revenue)}</td>
            <td>{money(fish.cost)}</td>
            <td>
              {fish.missingCost
                ? "খরচ অসম্পূর্ণ"
                : money(fish.profit)}
            </td>
          </tr>
        ))}

        {fishWiseProfit.length === 0 && (
          <tr>
            <td colSpan={5}>কোনো বিক্রির তথ্য নেই</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
  <h2>📈 গত ৭ দিনের বিক্রির চার্ট</h2>

  <div style={{
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
    height: "230px",
    padding: "20px 10px",
    borderBottom: "1px solid #ddd"
  }}>
    {dailySalesData.map((item, index) => (
      <div
        key={index}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          height: "100%",
          gap: "8px"
        }}
      >
        <small style={{ fontSize: "11px" }}>
          {money(item.sales)}
        </small>

        <div style={{
          width: "100%",
          maxWidth: "55px",
          height: `${Math.max(
            (item.sales / maxDailySales) * 130,
            3
          )}px`,
          background: "#078b98",
          borderRadius: "7px 7px 0 0",
          transition: "height 0.3s"
        }} />

        <small>{item.date}</small>
      </div>
    ))}
  </div>
</section>
      <h2>Delivered Orders তালিকা</h2>
    </div>

    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>ক্রেতা</th>
            <th>মাছ</th>
            <th>পরিমাণ</th>
            <th>মোট বিক্রি</th>
            <th>তারিখ</th>
          </tr>
        </thead>

        <tbody>
          {filteredSalesOrders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>
                {(Array.isArray(order.items) ? order.items : [])
                  .map((item) => item.name || item.product_name || "মাছ")
                  .join(", ")}
              </td>
              <td>
                {(Array.isArray(order.items) ? order.items : [])
                  .reduce(
                    (sum, item) =>
                      sum + Number(item.quantity || item.qty || 0),
                    0
                  )} কেজি
              </td>
              <td>{money(order.total)}</td>
              <td>
                {new Date(order.created_at).toLocaleDateString("bn-BD")}
              </td>
            </tr>
          ))}

          {deliveredOrders.length === 0 && (
            <tr>
              <td colSpan="6">এখনো কোনো Delivered Order নেই।</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
)}

      </main>
    </div>
  );
}


function OrdersTable({ orders, onStatus, onPaymentStatus }) {
  if (!orders.length) {
    return <p className="admin-muted">এখনো কোনো অর্ডার নেই।</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
<th>ক্রেতা</th>
<th>উৎস</th>
<th>মোট</th>
<th>পেমেন্ট তথ্য</th>
<th>পেমেন্ট যাচাই</th>
<th>স্ট্যাটাস</th>
<th>তারিখ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                <strong>{order.customer_name}</strong>
                <small>{order.phone}</small>
                <small>{order.address}</small>
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <details>
                    <summary>পণ্য দেখুন</summary>
                    {order.items.map((item, i) => (
                      <div key={i}>
                        {item.name || item.product_name || "পণ্য"} ×
                        {item.quantity || item.qty || 1}
                      </div>
                    ))}
                  </details>
                )}
              </td>
              <td>
                {order.order_source === "whatsapp" ? "WhatsApp" : "Website"}
              </td>
              <td>{money(order.total)}</td>
              <td>
  <strong>{order.payment_method || "N/A"}</strong>

  <small>
    মাধ্যম: {order.advance_payment_method || "N/A"}
  </small>

  <small>
    Transaction ID: {order.transaction_id || "নেই"}
  </small>

  <small>
    Advance: {money(order.advance_amount)}
  </small>

  <small>
    Payment Status: {order.payment_status || "pending"}
  </small>
</td>
<td>
  {order.transaction_id ? (
    <>
      {order.payment_status === "verified" ? (
        <span style={{ color: "green", fontWeight: "bold" }}>
          ✓ Verified
        </span>
      ) : order.payment_status === "rejected" ? (
        <span style={{ color: "red", fontWeight: "bold" }}>
          ✕ Rejected
        </span>
      ) : (
        <div className="admin-actions">
          <button
            className="admin-primary"
            onClick={() =>
              onPaymentStatus(order.id, "verified")
            }
          >
            Verify
          </button>

          <button
            className="admin-danger"
            onClick={() =>
              onPaymentStatus(order.id, "rejected")
            }
          >
            Reject
          </button>
        </div>
      )}
    </>
  ) : (
    <span className="admin-muted">Transaction নেই</span>
  )}
</td>
              <td>
                <select value={order.status}
                  onChange={(e) => onStatus(order.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{new Date(order.created_at).toLocaleString("bn-BD")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
