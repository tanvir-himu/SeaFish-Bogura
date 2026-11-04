
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET: Load approved product reviews
export async function GET(request) {
  try {
    const supabase = getSupabase();
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID প্রয়োজন।" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, customer_name, rating, review_text, created_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      reviews: data || [],
    });
  } catch (error) {
    console.error("Fetch Reviews Error:", error);

    return NextResponse.json(
      { error: "Reviews লোড করা যায়নি।" },
      { status: 500 }
    );
  }
}

// POST: Submit a product review
export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const {
      productId,
      orderId,
      phone,
      rating,
      reviewText,
    } = body;

    if (
      !productId ||
      !orderId ||
      !phone ||
      !rating ||
      !reviewText?.trim()
    ) {
      return NextResponse.json(
        { error: "সব তথ্য পূরণ করুন।" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\s/g, "");
    const cleanReview = reviewText.trim();

    if (!/^[0-9+()-]{10,20}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "সঠিক ফোন নম্বর দিন।" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return NextResponse.json(
        { error: "১ থেকে ৫ স্টার নির্বাচন করুন।" },
        { status: 400 }
      );
    }

    if (cleanReview.length < 5 || cleanReview.length > 1000) {
      return NextResponse.json(
        { error: "Review ৫ থেকে ১০০০ অক্ষরের মধ্যে লিখুন।" },
        { status: 400 }
      );
    }

    // Verify the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, phone, customer_name, status, items")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json(
        { error: "অর্ডার পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    if (
      String(order.phone).replace(/\s/g, "") !== cleanPhone
    ) {
      return NextResponse.json(
        { error: "ফোন নম্বর অর্ডারের সঙ্গে মিলছে না।" },
        { status: 403 }
      );
    }

    if (String(order.status).toLowerCase() !== "delivered") {
      return NextResponse.json(
        { error: "শুধু Delivered অর্ডারে Review দেওয়া যাবে।" },
        { status: 403 }
      );
    }

    // Check product in order
    const items = Array.isArray(order.items) ? order.items : [];

    const hasProduct = items.some(
      (item) => String(item.product_id) === String(productId)
    );

    if (!hasProduct) {
      return NextResponse.json(
        { error: "এই পণ্যটি আপনার অর্ডারে নেই।" },
        { status: 403 }
      );
    }

    // Insert review as pending
    const { data: review, error: insertError } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        order_id: order.id,
        customer_name: order.customer_name || "Verified Customer",
        rating: Number(rating),
        review_text: cleanReview,
        status: "pending",
      })
      .select("id, status")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "এই অর্ডার থেকে ইতিমধ্যে Review দেওয়া হয়েছে।" },
          { status: 409 }
        );
      }

      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message:
        "আপনার Review জমা হয়েছে। Admin অনুমোদনের পর এটি প্রকাশিত হবে।",
      review,
    });
  } catch (error) {
    console.error("Review API Error:", error);

    return NextResponse.json(
      { error: "Review জমা দেওয়া যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
