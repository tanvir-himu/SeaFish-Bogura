"use client";

import React from "react";
import { Fish, ArrowLeft, ShieldCheck, MessageCircle } from "lucide-react";

const sections = [
  {
    title: "১. আমরা কী তথ্য সংগ্রহ করি?",
    english: "Information We Collect",
    content:
      "অর্ডার করার সময় আমরা আপনার নাম, মোবাইল নম্বর, ডেলিভারি ঠিকানা, অর্ডারকৃত পণ্যের বিবরণ এবং আপনার দেওয়া অতিরিক্ত নোট সংগ্রহ করতে পারি। WhatsApp-এ যোগাযোগ করলে আপনার পাঠানো তথ্যও আমরা পেতে পারি।",
  },
  {
    title: "২. আপনার তথ্য কীভাবে ব্যবহার করি?",
    english: "How We Use Your Information",
    content:
      "আপনার অর্ডার গ্রহণ, নিশ্চিতকরণ, ডেলিভারি ব্যবস্থা, অর্ডার ট্র্যাকিং এবং গ্রাহক সহায়তার জন্য তথ্য ব্যবহার করি।",
  },
  {
    title: "৩. তথ্য সংরক্ষণ",
    english: "Data Storage",
    content:
      "ওয়েবসাইটে দেওয়া অর্ডারের তথ্য ডাটাবেজে সংরক্ষণ করা হয়। আমরা ব্যক্তিগত তথ্য সুরক্ষিত রাখতে যুক্তিসংগত নিরাপত্তা ব্যবস্থা গ্রহণের চেষ্টা করি।",
  },
  {
    title: "৪. WhatsApp যোগাযোগ",
    english: "WhatsApp Communication",
    content:
      "গ্রাহকরা WhatsApp-এর মাধ্যমে আমাদের সঙ্গে যোগাযোগ ও অর্ডার করতে পারেন। WhatsApp-এর মাধ্যমে শেয়ার করা তথ্য WhatsApp-এর নিজস্ব Privacy Policy-এরও অধীন।",
  },
  {
    title: "৫. তৃতীয় পক্ষের সঙ্গে তথ্য শেয়ার",
    english: "Third-Party Sharing",
    content:
      "আমরা গ্রাহকের ব্যক্তিগত তথ্য বিক্রি করি না। অর্ডার ডেলিভারির প্রয়োজনে সংশ্লিষ্ট কুরিয়ার বা ডেলিভারি সেবাদাতাকে প্রয়োজনীয় নাম, ফোন নম্বর ও ঠিকানা দেওয়া হতে পারে।",
  },
  {
    title: "৬. Cookies ও প্রযুক্তি",
    english: "Cookies and Technologies",
    content:
      "ওয়েবসাইট পরিচালনার জন্য প্রয়োজনীয় প্রযুক্তি ব্যবহার করা হতে পারে। ভবিষ্যতে Analytics বা অন্য কোনো tracking প্রযুক্তি যুক্ত হলে এই নীতিমালা আপডেট করা হবে।",
  },
  {
    title: "৭. আপনার তথ্যের অধিকার",
    english: "Your Privacy Rights",
    content:
      "আপনি আপনার ব্যক্তিগত তথ্য সম্পর্কে জানতে, সংশোধনের অনুরোধ করতে বা প্রযোজ্য নিয়ম অনুযায়ী মুছে ফেলার অনুরোধ জানাতে WhatsApp-এর মাধ্যমে যোগাযোগ করতে পারেন।",
  },
  {
    title: "৮. নীতিমালার পরিবর্তন",
    english: "Policy Updates",
    content:
      "প্রয়োজনে আমরা এই Privacy Policy পরিবর্তন করতে পারি। পরিবর্তিত নীতিমালা এই পেজে প্রকাশ করা হবে।",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <style>{`
        .privacy-page {
          min-height: 100vh;
          background: #f4f8f7;
          color: #17342e;
          font-family: inherit;
        }

        .privacy-header {
          background: #fff;
          border-bottom: 1px solid #e3eeea;
          padding: 18px 6%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .privacy-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 800;
          color: #126b52;
          text-decoration: none;
        }

        .privacy-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          color: #126b52;
          font-weight: 600;
        }

        .privacy-hero {
          text-align: center;
          background: linear-gradient(135deg, #0c604d, #118a70);
          padding: 65px 20px;
          color: white;
        }

        .privacy-hero h1 {
          font-size: clamp(30px, 5vw, 46px);
          margin: 14px 0;
        }

        .privacy-hero p {
          opacity: .9;
        }

        .privacy-container {
          max-width: 900px;
          margin: -30px auto 50px;
          padding: 0 18px;
          position: relative;
        }

        .privacy-card {
          background: white;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 10px 35px rgba(0,0,0,.06);
        }

        .privacy-intro {
          line-height: 1.9;
          margin-bottom: 30px;
          color: #52635e;
        }

        .privacy-section {
          padding: 22px 0;
          border-top: 1px solid #e9efed;
        }

        .privacy-section h2 {
          font-size: 20px;
          margin: 0 0 5px;
        }

        .privacy-section small {
          color: #168369;
        }

        .privacy-section p {
          color: #53645f;
          line-height: 1.9;
          margin-top: 12px;
        }

        .privacy-contact {
          background: #e9f7f1;
          border-radius: 14px;
          padding: 25px;
          text-align: center;
          margin-top: 20px;
        }

        .privacy-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: #128c64;
          color: white;
          text-decoration: none;
          padding: 13px 22px;
          border-radius: 10px;
          margin-top: 12px;
          font-weight: 600;
        }

        .privacy-footer {
          background: #103c32;
          color: white;
          text-align: center;
          padding: 28px 15px;
        }

        @media (max-width: 600px) {
          .privacy-header { padding: 15px; }
          .privacy-brand { font-size: 18px; }
          .privacy-card { padding: 22px 18px; }
          .privacy-section h2 { font-size: 18px; }
        }
      `}</style>

      <header className="privacy-header">
        <a className="privacy-brand" href="/">
          <Fish size={29} />
          SeaFish Bogura
        </a>

        <a href="/" className="privacy-back">
          <ArrowLeft size={18} />
          হোমে ফিরুন
        </a>
      </header>

      <section className="privacy-hero">
        <ShieldCheck size={45} />
        <h1>Privacy Policy</h1>
        <p>গোপনীয়তা নীতিমালা | Your Privacy Matters</p>
        <p>Last Updated: 30 October 2026</p>
      </section>

      <main className="privacy-container">
        <article className="privacy-card">
          <p className="privacy-intro">
            SeaFish Bogura-তে আপনাকে স্বাগতম। আমরা আপনার
            ব্যক্তিগত তথ্যের গোপনীয়তাকে গুরুত্ব দিই।
            এই নীতিমালায় আমাদের ওয়েবসাইটের মাধ্যমে
            সংগ্রহ করা তথ্যের ব্যবহার ও সংরক্ষণ
            সম্পর্কে জানানো হয়েছে।
          </p>

          {sections.map((section) => (
            <section className="privacy-section" key={section.english}>
              <h2>{section.title}</h2>
              <small>{section.english}</small>
              <p>{section.content}</p>
            </section>
          ))}

          <div className="privacy-contact">
            <h2>আমাদের সঙ্গে যোগাযোগ করুন</h2>
            <p>গোপনীয়তা সংক্রান্ত প্রশ্ন থাকলে WhatsApp-এ জানান।</p>

            <a
              className="privacy-whatsapp"
              href="https://wa.me/8801982395288"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={19} />
              WhatsApp Contact
            </a>
          </div>
        </article>
      </main>

      <footer className="privacy-footer">
        © 2026 SeaFish Bogura. All Rights Reserved.
      </footer>
    </div>
  );
}
