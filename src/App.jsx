
"use client";

import SEO from "./SEO";
import ProductDetails from "./components/ProductDetails";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { supabase } from "./supabaseClient";
import { useEffect, useMemo, useState } from "react";
import {
  Search, ShoppingBag, Menu, X, Plus, Minus,
  Fish, Truck, ShieldCheck, Headphones, ArrowRight,
  MessageCircle, Trash2, Waves, UserRound
} from "lucide-react";
import "./App.css";



const categories = [
  { id: "all", label: "সব মাছ" },
  { id: "ilish", label: "ইলিশ" },
  { id: "bhetki", label: "ভেটকি" },
  { id: "churi", label: "ছুরি" },
  { id: "loitta", label: "লইট্টা" },
];

const money = (value) =>
  `৳${Number(value).toLocaleString("en-US")}`;
function PrivacyPage() {
  return <PrivacyPolicy />;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
      console.log("Supabase products:", data, error);

    if (error) {
      console.error("Product loading error:", error.message);
    } else {
      setProducts(data ?? []);
    }

    setLoadingProducts(false);
  };

  fetchProducts();
}, []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
const [submittingOrder, setSubmittingOrder] = useState(false);

const [customer, setCustomer] = useState({
  name: "",
  phone: "",
  address: "",
  notes: "",
});
// Payment System
const [paymentMethod, setPaymentMethod] = useState("COD");
const [advancePaymentMethod, setAdvancePaymentMethod] = useState("bKash");
const [transactionId, setTransactionId] = useState("");

const [orderMessage, setOrderMessage] = useState("");
const [orderError, setOrderError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
const [trackingUrl, setTrackingUrl] = useState("");
const slides = [
  {
    eyebrow: "BHETKI FISH COLLECTION",
    title: "টাটকা ভেটকি মাছ,",
    highlight: "সেরা মানের নিশ্চয়তা।",
    description: "ফিশারি ঘাট থেকে বেছে নিন পছন্দের ভেটকি মাছ।",
    image: "/images/bhetki-fish-market.png",
    alt: "ফিশারি ঘাটে প্রচুর ভেটকি মাছ",
  },
  {
    eyebrow: "LOITTA FISH COLLECTION",
    title: "সুস্বাদু লইট্টা মাছ,",
    highlight: "আপনার পছন্দে।",
    description: "SeaFish Bogura-তে দেখুন লইট্টা মাছের সংগ্রহ।",
    image: "/images/loitta-fish-market.png",
    alt: "ফিশারি ঘাটে প্রচুর লইট্টা মাছ",
  },
  {
    eyebrow: "CHURI FISH COLLECTION",
    title: "টাটকা ছুরি মাছ,",
    highlight: "সহজ অর্ডার।",
    description: "পছন্দের মাছ অর্ডার করুন সহজেই।",
    image: "/images/churi-fish-market.png",
    alt: "ফিশারি ঘাটে প্রচুর ছুরি মাছ",
  },
];
useEffect(() => {
  const timer = window.setInterval(() => {
    setActiveSlide((current) => (current + 1) % slides.length);
  }, 4500);

  return () => window.clearInterval(timer);
}, []);

  const filteredProducts = useMemo(() => {
  return products.filter((product) => {
    const matchesCategory =
      category === "all" ||
      product.category?.toLowerCase() === category.toLowerCase();

    const matchesQuery =
      `${product.name ?? ""} ${product.description ?? ""} ${product.category ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());

    return matchesCategory && matchesQuery;
  });
}, [products, category, query]);

  function addToCart(product) {
  setCart((current) => {
    const found = current.find((item) => item.id === product.id);

    if (found) {
      return current.map((item) =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    }

    return [...current, { ...product, qty: 1 }];
  });

  setCartOpen(true);
}

const openProduct = (product) => {
  window.history.pushState(
    {},
    "",
    `/product/${encodeURIComponent(product.id)}`
  );

  setSelectedProduct(product);
  setCurrentPath(window.location.pathname);
  window.scrollTo(0, 0);
};

const goHome = () => {
  window.history.pushState({}, "", "/");
  setSelectedProduct(null);
  setCurrentPath("/");
  window.scrollTo(0, 0);
};

function changeQty(id, amount) {
  setCart((current) =>
    current
      .map((item) =>
        item.id === id
          ? { ...item, qty: item.qty + amount }
          : item
      )
      .filter((item) => item.qty > 0)
  );
}
  
function shareTrackingLink() {
  if (!trackingUrl) return;

  const shareData = {
    title: "SeaFish Bogura — Order Tracking",
    text: "আপনার SeaFish Bogura অর্ডার ট্র্যাক করুন:",
    url: trackingUrl,
  };

  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      if (error.name !== "AbortError") {
        navigator.clipboard?.writeText(trackingUrl);
      }
    });
  } else {
    navigator.clipboard?.writeText(trackingUrl);
    alert("ট্র্যাকিং লিংক কপি করার চেষ্টা করা হয়েছে।");
  }
}

function sendTrackingWhatsApp() {
  if (!trackingUrl) return;

  const phone = "8801982395288";

  const message = [
    "আসসালামু আলাইকুম, SeaFish Bogura।",
    "আমার অর্ডার ট্র্যাকিং লিংক:",
    trackingUrl,
  ].join("\n");

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

function contactWhatsApp() {
  const phone = "8801982395288";

  const message =
    "আসসালামু আলাইকুম, SeaFish Bogura। " +
    "আমি মাছের দাম ও ডেলিভারি সম্পর্কে জানতে চাই।";

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.location.href = url;
}

async function checkCustomerLogin() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    alert("অর্ডার করতে হলে প্রথমে Login অথবা Register করুন।");
    window.location.href = "/account?redirect=checkout";
    return false;
  }

  return true;
}
async function checkCustomerLogin() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    alert("অর্ডার করতে হলে প্রথমে Login অথবা Register করুন।");
    window.location.href = "/account?redirect=checkout";
    return false;
  }

  return true;
}


  function sendWhatsAppOrder() {
    
function contactWhatsApp() {
  const phone = "8801982395288";

  const message =
    "আসসালামু আলাইকুম, SeaFish Bogura। " +
    "আমি মাছের দাম ও ডেলিভারি সম্পর্কে জানতে চাই।";

  const url =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.location.href = url;
}

    if (cart.length === 0) return;

    // নিজের WhatsApp Business নম্বর বসাবেন।
    const phone = "8801982395288";
    const lines = cart.map(
      (item) =>
        `${item.name} x ${item.qty} kg = ${money(item.price * item.qty)}`
    );

    const message = [
  "আসসালামু আলাইকুম, SeaFish Bogura থেকে অর্ডার করতে চাই।",
  "",
  ...lines,
  "",
  `মোট পণ্যমূল্য: ${money(cartTotal)}`,
  `মোট ওজন: ${totalWeight} kg`,
  `ডেলিভারি চার্জ: ${deliveryCharge === 0 ? "ফ্রি" : money(deliveryCharge)}`,
  `সর্বমোট: ${money(grandTotal)}`,
  "",
  deliveryCharge === 0
    ? "অভিনন্দন! ২০ কেজি বা তার বেশি অর্ডারের জন্য Free Delivery প্রযোজ্য।"
    : "২০ কেজির কম অর্ডারে ডেলিভারি চার্জ ৳150।"
].join("\n");

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }
  async function submitWebsiteOrder(event) {
  event.preventDefault();

  const loggedIn = await checkCustomerLogin();

  if (!loggedIn) return;

  // বাকি আগের কোড অপরিবর্তিত রাখুন
  event.preventDefault();

  setOrderError("");
  setOrderMessage("");

  if (cart.length === 0) {
    setOrderError("আপনার কার্ট খালি।");
    return;
  }

  const customerName = customer.name.trim();
  const customerPhone = customer.phone.trim();
  const customerAddress = customer.address.trim();

  if (!customerName || !customerPhone || !customerAddress) {
    setOrderError("নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।");
    return;
  }

  if (!/^[0-9+\-\s()]{10,20}$/.test(customerPhone)) {
    setOrderError("সঠিক ফোন নম্বর লিখুন।");
    return;
  }
  // Payment Validation
if (
  (paymentMethod === "FULL_ADVANCE" ||
    (paymentMethod === "COD" && deliveryCharge > 0)) &&
  !transactionId.trim()
) {
  setOrderError("পেমেন্ট করার পর Transaction ID লিখুন।");
  return;
}

if (
  paymentMethod === "COD" &&
  deliveryCharge > 0 &&
  !["bKash", "Nagad"].includes(advancePaymentMethod)
) {
  setOrderError("Delivery Advance-এর পেমেন্ট মাধ্যম নির্বাচন করুন।");
  return;
}

if (
  paymentMethod === "FULL_ADVANCE" &&
  !["bKash", "Nagad"].includes(advancePaymentMethod)
) {
  setOrderError("Full Payment-এর মাধ্যম নির্বাচন করুন।");
  return;
}

  setSubmittingOrder(true);

  try {
    const trackingToken = Array.from(
  crypto.getRandomValues(new Uint8Array(32))
)
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

const tokenDigest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(trackingToken)
);

const trackingTokenHash = Array.from(new Uint8Array(tokenDigest))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
    // Supabase থেকে বর্তমান পণ্যের স্টক যাচাই
    const productIds = cart.map((item) => item.id);

    const { data: currentProducts, error: stockError } = await supabase
      .from("products")
      .select("id, name, price, stock, is_active")
      .in("id", productIds);

    if (stockError) {
      throw new Error("পণ্যের স্টক যাচাই করা যায়নি: " + stockError.message);
    }

    for (const item of cart) {
      const latest = currentProducts?.find(
        (product) => String(product.id) === String(item.id)
      );

      if (!latest || !latest.is_active) {
        throw new Error(`${item.name} এখন অর্ডার করা যাচ্ছে না।`);
      }

      if (Number(latest.stock) < item.qty) {
        throw new Error(
          `${item.name}-এর পর্যাপ্ত স্টক নেই। বর্তমানে স্টক: ${latest.stock} কেজি।`
        );
      }
    }

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.qty,
      price: Number(item.price),
      subtotal: Number(item.price) * item.qty,
    }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    console.log("Order RLS diagnostic:", {
  order_source: "website",
  status: "pending",
  cartCount: cart.length,
  hasTrackingTokenHash: Boolean(trackingTokenHash),
});
const { data: authData, error: authError } =
  await supabase.auth.getUser();

if (authError || !authData.user) {
  throw new Error("আপনাকে আবার Login করতে হবে।");
}
    
const { error: insertError } = await supabase
  .from("orders")
.insert({
  user_id: authData.user.id,
  order_source: "website",
  customer_name: customerName,
  phone: customerPhone,
  address: customerAddress,
  items: orderItems,

  total: finalTotal,
  delivery_charge: deliveryCharge,
  discount_amount: discountAmount,

  payment_method:
    paymentMethod === "COD"
      ? "Cash on Delivery"
      : "Full Advance",

  advance_payment_method: advancePaymentMethod,
  transaction_id: transactionId.trim() || null,
  advance_amount: advanceAmount,
  payment_status: "pending",

  status: "pending",
  tracking_token_hash: trackingTokenHash,
  notes: customer.notes.trim(),
});

if (insertError) {
  throw new Error("অর্ডার জমা হয়নি: " + insertError.message);
}


    if (insertError) {
  console.error("Order insert error:", insertError);
  console.error("Order payload:", {
    order_source: "website",
    status: "pending",
    tracking_token_hash: trackingTokenHash,
  });

  throw new Error("অর্ডার জমা হয়নি: " + insertError.message);
}
    const trackingUrl = new URL("/track-order", window.location.origin);
trackingUrl.searchParams.set("token", trackingToken);

setOrderMessage(
  setOrderMessage("আপনার অর্ডার সফল হয়েছে!")
);

setTrackingUrl(trackingUrl.toString());

    setOrderMessage("আপনার অর্ডার সফল হয়েছে!");
    setCart([]);
    setCustomer({ name: "", phone: "", address: "", notes: "" });
    
  } catch (err) {
    setOrderError(err.message || "অর্ডার জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  } finally {
    setSubmittingOrder(false);
  }
}
  const cartCount = cart.reduce(
  (sum, item) => sum + item.qty,
  0
);

const cartTotal = cart.reduce(
  (sum, item) => sum + Number(item.price) * item.qty,
  0
);
// SeaFish Bogura Delivery Calculation
const totalWeight = cart.reduce(
  (sum, item) => sum + Number(item.qty),
  0
);

const deliveryCharge = totalWeight >= 20 ? 0 : 150;

const grandTotal = cartTotal + deliveryCharge;
// Payment Calculation
const discountAmount =
  paymentMethod === "FULL_ADVANCE" ? 50 : 0;

const finalTotal = Math.max(0, grandTotal - discountAmount);

const advanceAmount =
  paymentMethod === "COD" ? deliveryCharge : finalTotal;

const dueAmount =
  paymentMethod === "COD" ? cartTotal : 0;
const productId = decodeURIComponent(
  currentPath.split("/product/")[1] || ""
);

const routeProduct = products.find(
  (item) => String(item.id) === productId
);
if (mounted && currentPath === "/contact") {
  return (
    <>
      <SEO page="contact" />
      <ContactUs />
    </>
  );
}

if (mounted && currentPath === "/privacy-policy") {
  return (
    <>
      <SEO page="privacy" />
      <PrivacyPolicy />
    </>
  );
}

if (currentPath.startsWith("/product/")) {
  return (
    <ProductDetails
  product={routeProduct || selectedProduct}
  loading={loadingProducts}
  onAddToCart={addToCart}
  onBack={goHome}
/>
  );
}

  return (
  <>
    <SEO page="home" />

    <div className="site-shell">
      <div className="announcement">
        <span>🐟</span>
        SeaFish Bogura-তে স্বাগতম
        <span className="announcement-divider">•</span>
        সামুদ্রিক মাছের নতুন ঠিকানা
      </div>

      
<header className="navbar">
  <a href="#home" className="brand">
    <img
      src="/images/seafish-logo.webp"
      alt="SeaFish Bogura"
      className="brand-logo"
    />
  </a>

  <button
    className="mobile-toggle"
    onClick={() => setMobileMenu(!mobileMenu)}
    aria-label="মেনু খুলুন"
  >
    {mobileMenu ? <X /> : <Menu />}
  </button>

  <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
    <a href="#home" onClick={() => setMobileMenu(false)}>হোম</a>
    <a href="#products" onClick={() => setMobileMenu(false)}>সব মাছ</a>
    <a href="#why-us" onClick={() => setMobileMenu(false)}>আমাদের সম্পর্কে</a>
    <a href="#contact" onClick={() => setMobileMenu(false)}>যোগাযোগ</a>
  </nav>

  <div className="nav-actions">
    {/* Customer Profile */}
    <button
      className="icon-button"
      onClick={async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          window.location.href = "/account";
        } else {
          window.location.href = "/account/dashboard";
        }
      }}
      aria-label="My Account"
      title="My Account"
    >
      <UserRound size={21} />
    </button>

    {/* Shopping Cart */}
    <button
      className="icon-button"
      onClick={() => setCartOpen(true)}
      aria-label="কার্ট দেখুন"
    >
      <ShoppingBag size={21} />
      <span className="cart-count">{cartCount}</span>
    </button>
  </div>
</header>


      <main>
        <section className="hero-slider" id="home">
  {slides.map((slide, index) => (
    <div
      key={slide.eyebrow}
      className={`hero-slide ${
        activeSlide === index ? "active" : ""
      }`}
      style={{ backgroundImage: `url("${slide.image}")` }}
      aria-hidden={activeSlide !== index}
    >
      <div className="hero-overlay"></div>

      <div className="hero-slide-content">
        <span className="slide-eyebrow">{slide.eyebrow}</span>

        <h1>
          {slide.title}
          <br />
          <span>{slide.highlight}</span>
        </h1>

        <p>{slide.description}</p>

        <a className="slide-button" href="#products">
          মাছ কিনুন <ArrowRight size={19} />
        </a>
      </div>
    </div>
  ))}

  <button
    type="button"
    className="slider-arrow slider-prev"
    aria-label="আগের ছবি"
    onClick={() =>
      setActiveSlide(
        (current) => (current - 1 + slides.length) % slides.length
      )
    }
  >
    &#10094;
  </button>

  <button
    type="button"
    className="slider-arrow slider-next"
    aria-label="পরের ছবি"
    onClick={() =>
      setActiveSlide((current) => (current + 1) % slides.length)
    }
  >
    &#10095;
  </button>

  <div className="slider-dots">
    {slides.map((slide, index) => (
      <button
        type="button"
        key={slide.eyebrow}
        className={`slider-dot ${
          activeSlide === index ? "active" : ""
        }`}
        onClick={() => setActiveSlide(index)}
        aria-label={`স্লাইড ${index + 1}`}
        aria-current={activeSlide === index ? "true" : undefined}
      />
    ))}
  </div>
</section>

        
<section className="benefits about-section" id="why-us">
  <div className="about-heading">
    <span className="section-kicker">WHY SEAFISH BOGURA</span>
    <h2>কেন আমাদের থেকেই মাছ কিনবেন?</h2>
    <p>
      সমুদ্র উপকূলে সকালে ধরা মাছ সংগ্রহ করে,
      উপযুক্ত প্যাকেজিং ও কুরিয়ারের মাধ্যমে আপনার কাছে
      পৌঁছে দেওয়ার উদ্যোগ SeaFish Bogura-এর।
    </p>
  </div>

  <div className="about-grid">
    <div className="about-card">
      <span>🌊</span>
      <h3>সমুদ্র উপকূল থেকে সংগ্রহ</h3>
      <p>
        গ্রাহকের অর্ডার অনুযায়ী সমুদ্র উপকূল থেকে মাছ
        সংগ্রহের ব্যবস্থা।
      </p>
    </div>

    <div className="about-card">
      <span>🐟</span>
      <h3>মাছের সতেজতায় গুরুত্ব</h3>
      <p>
        মাছের সতেজতা বজায় রাখতে উপযুক্ত প্যাকেজিং
        ও পরিবহনের ওপর গুরুত্ব দেওয়া হয়।
      </p>
    </div>

    <div className="about-card">
      <span>📦</span>
      <h3>কুরিয়ার ডেলিভারি</h3>
      <p>
        কুরিয়ার সুবিধা ও গন্তব্য অনুযায়ী মাছ পাঠানোর
        ব্যবস্থা করা হবে।
      </p>
    </div>

    <div className="about-card">
      <span>💬</span>
      <h3>সহজ অর্ডার</h3>
      <p>
        ওয়েবসাইটে মাছ বেছে নিন এবং WhatsApp-এর মাধ্যমে
        অর্ডার নিশ্চিত করুন।
      </p>
    </div>
  </div>

  <div className="about-footer">
    <h3>SeaFish Bogura</h3>
    <p>সমুদ্র উপকূল থেকে আপনার ঘরে, মাছ পৌঁছে দেওয়ার নতুন উদ্যোগ।</p>
  </div>
</section>


        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="section-kicker">OUR COLLECTION</span>
              <h2>পছন্দের মাছ বেছে নিন<span>.</span></h2>
              <p>মাছের তালিকা দেখুন এবং আপনার পছন্দেরটি কার্টে যোগ করুন।</p>
            </div>

            <div className="search-box">
              <Search size={19} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="মাছ খুঁজুন..."
                aria-label="মাছ খুঁজুন"
              />
            </div>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item.id}
                className={category === item.id ? "category-chip active" : "category-chip"}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {loadingProducts && (
  <p className="loading-message">
    মাছের তালিকা লোড হচ্ছে...
  </p>
)}

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const discount = Number(product.discount_percent ?? 0);
const oldPrice =
  discount > 0
    ? Number(product.price) / (1 - discount / 100)
    : 0;

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                   <img
  src={product.image_url || "/images/seafish-cover.png"}
  alt={product.name}
  loading="lazy"
  onClick={() => openProduct(product)}
  style={{ cursor: "pointer" }}
/>

                    {discount > 0 && (
                      <span className="discount-badge">{discount}% OFF</span>
                    )}

                    
<button
  className="add-button"
  disabled={Number(product.stock) <= 0}
  onClick={() => addToCart(product)}
>
  {Number(product.stock) <= 0 ? (
    "স্টক শেষ"
  ) : (
    <>
      <Plus size={16} /> যোগ করুন
    </>
  )}
</button>

                  </div>

                  <div className="product-info">
                    <span className="product-english">{product.english}</span>
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-bottom">
                      <div>
                        <div className="price-line">
                          <strong>{money(product.price)}</strong>
                          {discount > 0 && (
  <del>{money(oldPrice)}</del>
)}
                        </div>
                        <span className="weight-label">{product.weight}</span>
                      </div>

                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                        disabled={Number(product.stock) <= 0}
                      >
                        <Plus size={16} /> যোগ করুন
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-results">
              <Fish size={35} />
              <h3>কোনো মাছ পাওয়া যায়নি</h3>
              <p>অন্য নাম দিয়ে খুঁজে দেখুন।</p>
            </div>
          )}

          
        </section>

        <section className="order-banner" id="contact">
          <div className="order-banner-icon"><MessageCircle size={28} /></div>
          <div>
            <span>NEED HELP ORDERING?</span>
            <h2>অর্ডার করতে সাহায্য লাগবে?</h2>
            <p>আপনার পছন্দের মাছ সম্পর্কে জানতে আমাদের সঙ্গে যোগাযোগ করুন।</p>
          </div>
          <button className="banner-button" onClick={contactWhatsApp}>
  WhatsApp-এ যোগাযোগ করুন <ArrowRight size={18} />
</button>
        </section>
                <section className="local-seo-section">
          <div className="local-seo-container">

            <span className="section-kicker">
              SEAFISH BOGURA
            </span>

            <h2>বগুড়া জেলায় সামুদ্রিক মাছের অনলাইন শপ</h2>

            <p>
              SeaFish Bogura brings online sea fish shopping
              to customers across Bogura District, Bangladesh.
              Explore our seafood collection, including Hilsa,
              Bhetki, Churi (Ribbon Fish), and Loitta.
            </p>

            <p>
              Browse available fish, check prices, and place
              your order through our website or WhatsApp.
              We aim to make seafood shopping convenient
              for customers across Bogura District.
            </p>

            <div className="local-seo-tags">
              <span>ইলিশ মাছ</span>
              <span>ভেটকি মাছ</span>
              <span>ছুরি মাছ</span>
              <span>লইট্টা মাছ</span>
              <span>Sea Fish Bogura</span>
            </div>

          </div>
        </section>

        </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon"><Fish size={25} /></span>
          <span>
            <strong>SeaFish<span className="brand-accent">.</span></strong>
            <small>BOGURA · BANGLADESH</small>
          </span>
        </a>
        <p>সাগরের স্বাদ, আপনার ঘরে।</p>
        <a href="/privacy-policy">
  Privacy Policy
</a>
<a href="/contact">Contact Us</a>
        <span className="copyright">© 2026 SeaFish Bogura</span>
      </footer>

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Shopping Cart"
          >
            <div className="drawer-heading">
              <div>
                <span className="section-kicker">YOUR SELECTION</span>
                <h2>আপনার কার্ট ({cartCount})</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
                aria-label="কার্ট বন্ধ করুন"
              >
                <X />
              </button>
            </div>
            
{orderMessage && (
  <div className="order-success" role="status">
    <p>{orderMessage}</p>

    
{trackingUrl && (
  <div className="tracking-actions">
    <a
      className="checkout-button"
      href={trackingUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      📦 অর্ডার ট্র্যাক করুন
    </a>

    <button
      type="button"
      className="continue-button"
      onClick={sendTrackingWhatsApp}
    >
      💬 WhatsApp-এ ট্র্যাকিং পাঠান
    </button>

    <button
      type="button"
      className="continue-button"
      onClick={shareTrackingLink}
    >
      🔗 ট্র্যাকিং লিংক শেয়ার করুন
    </button>
  </div>
)}

  </div>
)}


            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={45} />
                <h3>আপনার কার্ট খালি</h3>
                <p>পছন্দের মাছ কার্টে যোগ করুন।</p>
                <button
  className="primary-button"
  onClick={() => {
    setCartOpen(false);
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }}
>
  মাছ দেখুন
</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image_url || "/images/seafish-cover.png"} alt={item.name} />
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{money(item.price)} / কেজি</span>
                        <div className="quantity-control">
                          <button onClick={() => changeQty(item.id, -1)} aria-label="পরিমাণ কমান">
                            <Minus size={14} />
                          </button>
                          <span>{item.qty} kg</span>
                          <button onClick={() => changeQty(item.id, 1)} aria-label="পরিমাণ বাড়ান">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-end">
                        <strong>{money(item.price * item.qty)}</strong>
                        <button
                          className="remove-button"
                          onClick={() =>
                            setCart((current) =>
                              current.filter((entry) => entry.id !== item.id)
                            )
                          }
                          aria-label="পণ্য সরান"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-line">
                    <span>পণ্যের মোট মূল্য</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>


{checkoutOpen && (
  <form className="checkout-form" onSubmit={submitWebsiteOrder}>
    <h3>ডেলিভারির তথ্য</h3>
    <p>আপনার অর্ডার সম্পন্ন করতে নিচের তথ্য দিন।</p>

    <label>
      আপনার নাম *
      <input
        type="text"
        required
        maxLength={100}
        autoComplete="name"
        value={customer.name}
        onChange={(e) =>
          setCustomer({ ...customer, name: e.target.value })
        }
        placeholder="সম্পূর্ণ নাম"
      />
    </label>

    <label>
      ফোন নম্বর *
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
      সম্পূর্ণ ঠিকানা *
      <textarea
        required
        maxLength={1000}
        autoComplete="street-address"
        value={customer.address}
        onChange={(e) =>
          setCustomer({ ...customer, address: e.target.value })
        }
        placeholder="বাড়ি, এলাকা, উপজেলা, জেলা"
        rows={3}
      />
    </label>

    <label>
      অতিরিক্ত নোট (ঐচ্ছিক)
      <textarea
        maxLength={1000}
        value={customer.notes}
        onChange={(e) =>
          setCustomer({ ...customer, notes: e.target.value })
        }
        placeholder="ডেলিভারি সম্পর্কে কিছু জানাতে চাইলে লিখুন"
        rows={2}
      />
    </label>
    <div className="payment-section">
  <div className="payment-heading">
    <span className="payment-heading-icon">💳</span>
    <div>
      <h3>পেমেন্ট পদ্ধতি নির্বাচন করুন</h3>
      <p>আপনার সুবিধামতো পেমেন্ট করুন</p>
    </div>
  </div>

  {/* Payment Option 1 */}
  <label className={`payment-choice ${paymentMethod === "COD" ? "selected" : ""}`}>
    <span className="payment-number">1</span>

    <input
      type="radio"
      name="paymentMethod"
      value="COD"
      checked={paymentMethod === "COD"}
      onChange={() => setPaymentMethod("COD")}
    />

    <span className="payment-choice-content">
      <strong>Cash on Delivery</strong>
      <small>ডেলিভারির সময় পণ্যের টাকা পরিশোধ করুন</small>
      <em>আগে অর্ডার করুন, পরে পেমেন্ট করুন</em>
    </span>

    <span className="payment-discount">সহজ পেমেন্ট</span>
  </label>

  {/* Payment Option 2 */}
  <label className={`payment-choice ${paymentMethod === "FULL_ADVANCE" ? "selected" : ""}`}>
    <span className="payment-number">2</span>

    <input
      type="radio"
      name="paymentMethod"
      value="FULL_ADVANCE"
      checked={paymentMethod === "FULL_ADVANCE"}
      onChange={() => setPaymentMethod("FULL_ADVANCE")}
    />

    <span className="payment-choice-content">
      <strong>Full Advance Payment</strong>
      <small>অর্ডারের সম্পূর্ণ টাকা অগ্রিম পরিশোধ করুন</small>
      <em>এখনই পেমেন্ট করলে ৳৫০ ছাড় পাবেন</em>
    </span>

    <span className="payment-discount">৳৫০ Discount</span>
  </label>

  {/* Payment Details */}
  {(paymentMethod === "FULL_ADVANCE" ||
    (paymentMethod === "COD" && deliveryCharge > 0)) && (
    <div className="payment-details-card">
      <h4>📱 পেমেন্টের তথ্য দিন</h4>

      <p className="payment-details-subtitle">
        নিচের নম্বরে Send Money করে Transaction ID দিন।
      </p>

      <strong className="payment-method-label">
        পেমেন্ট মাধ্যম নির্বাচন করুন *
      </strong>

      <div className="payment-method-grid">
        <label className={`payment-method-option ${advancePaymentMethod === "bKash" ? "active" : ""}`}>
          <input
            type="radio"
            name="advancePaymentMethod"
            value="bKash"
            checked={advancePaymentMethod === "bKash"}
            onChange={() => setAdvancePaymentMethod("bKash")}
          />
          <img
  src="/images/bkash.png"
  alt="bKash"
  className="payment-brand-logo"
/>
        
        </label>

        <label className={`payment-method-option ${advancePaymentMethod === "Nagad" ? "active" : ""}`}>
          <input
            type="radio"
            name="advancePaymentMethod"
            value="Nagad"
            checked={advancePaymentMethod === "Nagad"}
            onChange={() => setAdvancePaymentMethod("Nagad")}
          />
          <img
  src="/images/nagad.png"
  alt="Nagad"
  className="payment-brand-logo"
/>
          
        </label>
      </div>

      <label className="payment-number-label">
        পেমেন্ট নম্বর
        <input
          type="text"
          value="01982395288"
          readOnly
        />
      </label>

      <p className="payment-send-note">
        bKash / Nagad Personal (Send Money)
      </p>

      <label className="transaction-label">
        Transaction ID *
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="আপনার Transaction ID লিখুন"
          required
        />
      </label>

      <p className="payment-amount-note">
        এখন Send Money করুন: <strong>{money(advanceAmount)}</strong>
      </p>
    </div>
  )}
</div>

    <div className="checkout-total">
  <div>
    পণ্যের মোট মূল্য: <strong>{money(cartTotal)}</strong>
  </div>

  <div>
    ডেলিভারি চার্জ:{" "}
    <strong>
      {deliveryCharge === 0 ? "ফ্রি" : money(deliveryCharge)}
    </strong>
  </div>

  {deliveryCharge === 0 && (
    <p className="checkout-delivery-note">
      🎉 ২০ কেজি বা তার বেশি অর্ডারে Free Delivery!
    </p>
  )}

  <div>
    সর্বমোট: <strong>{money(grandTotal)}</strong>
  </div>
</div>

    {orderError && (
      <p className="admin-error" role="alert">
        {orderError}
      </p>
    )}

    <button
      className="checkout-button"
      type="submit"
      disabled={submittingOrder || cart.length === 0}
    >
      {submittingOrder ? "অর্ডার জমা হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
    </button>

    <button
      className="continue-button"
      type="button"
      disabled={submittingOrder}
      onClick={() => {
        setCheckoutOpen(false);
        setOrderError("");
      }}
    >
      ফিরে যান
    </button>
  </form>
)}
                  <p>ডেলিভারি চার্জ অর্ডার নিশ্চিত করার সময় জানানো হবে।</p>
                  <button
  className="checkout-button"
  type="button"
  onClick={async () => {
  const loggedIn = await checkCustomerLogin();

  if (!loggedIn) return;

  setCheckoutOpen(true);
  setOrderError("");
  setOrderMessage("");
}}
>
  <ShoppingBag size={19} /> ওয়েবসাইটে অর্ডার করুন
</button>

<button
  className="continue-button"
  type="button"
  onClick={sendWhatsAppOrder}
>
  <MessageCircle size={18} /> WhatsApp-এ অর্ডার করুন
</button>
                  <button
  type="button"
  className="continue-button"
  onClick={() => {
    setCartOpen(false);

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 300);
  }}
>
  আরও মাছ দেখুন
</button>
                </div>
              </>
            )}
            
          </aside>
        </div>
      )}
        </div>
  </>
  );
}
