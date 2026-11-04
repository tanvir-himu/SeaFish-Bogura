
"use client";

import { useEffect, useState } from "react";
import "./ProductReviews.css";

export default function ProductReviews({ productId }) {
  const [rating, setRating] = useState(5);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [reviewText, setReviewText] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  async function loadReviews() {
    try {
      const response = await fetch(
        `/api/reviews?productId=${encodeURIComponent(productId)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setReviews(result.reviews || []);
    } catch (error) {
      console.error("Review loading error:", error);
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function submitReview(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          orderId: orderId.trim(),
          phone: phone.trim(),
          rating,
          reviewText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Review জমা হয়নি।");
      }

      setSuccess(true);
      setMessage(result.message);

      setOrderId("");
      setPhone("");
      setReviewText("");
      setRating(5);

    } catch (error) {
      setSuccess(false);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="customer-reviews">

      <h2>⭐ গ্রাহকদের মতামত</h2>

      <div className="review-summary">
        <strong>{averageRating}/5</strong>
        <span className="summary-stars">★★★★★</span>
        <small>{reviews.length} টি অনুমোদিত Review</small>
      </div>

      <div className="review-list">
        {reviewsLoading ? (
          <p>Review লোড হচ্ছে...</p>
        ) : reviews.length === 0 ? (
          <p>এখনো কোনো Review প্রকাশিত হয়নি।</p>
        ) : (
          reviews.map((item) => (
            <article className="review-item" key={item.id}>
              <div className="review-item-header">
                <strong>{item.customer_name}</strong>
                <span className="verified-label">
                  ✓ Verified Customer
                </span>
              </div>

              <div className="review-item-stars">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </div>

              <p>{item.review_text}</p>

              <small>
                {new Date(item.created_at).toLocaleDateString("bn-BD")}
              </small>
            </article>
          ))
        )}
      </div>

      <hr />

      <h2>আপনার মতামত দিন</h2>

      <p className="review-description">
        শুধু Delivered অর্ডারের ক্রেতারা Review দিতে পারবেন।
      </p>

      <form onSubmit={submitReview} className="review-form">

        <label>আপনার রেটিং *</label>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= rating ? "active" : ""}
              onClick={() => setRating(star)}
              aria-label={`${star} star`}
              aria-pressed={rating === star}
            >
              ★
            </button>
          ))}
        </div>

        <label htmlFor="review-order">Order ID *</label>
        <input
          id="review-order"
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="আপনার Order ID লিখুন"
          required
        />

        <label htmlFor="review-phone">
          অর্ডারের মোবাইল নম্বর *
        </label>
        <input
          id="review-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          required
        />

        <label htmlFor="review-text">
          আপনার অভিজ্ঞতা লিখুন *
        </label>
        <textarea
          id="review-text"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
          minLength={5}
          maxLength={1000}
          rows={5}
          required
        />

        <button
          type="submit"
          className="review-submit"
          disabled={loading}
        >
          {loading ? "জমা হচ্ছে..." : "Review জমা দিন"}
        </button>

        {message && (
          <p
            className={success ? "review-success" : "review-error"}
            role="status"
          >
            {message}
          </p>
        )}

      </form>
    </section>
  );
}
