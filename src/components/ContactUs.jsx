"use client";

import React from "react";
import {
  Fish, ArrowLeft, MessageCircle,
  Phone, MapPin, Clock
} from "lucide-react";

export default function ContactUs() {
  const phone = "+8801982395288";

  return (
    <div className="contact-page">
      <style>{`
        .contact-page {
          min-height: 100vh;
          background: #f3f8f6;
          color: #173c32;
          font-family: inherit;
        }

        .contact-header {
          background: white;
          padding: 18px 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5eeea;
        }

        .contact-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #117354;
          font-size: 22px;
          font-weight: 800;
          text-decoration: none;
        }

        .contact-back {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #117354;
          text-decoration: none;
          font-weight: 600;
        }

        .contact-hero {
          text-align: center;
          padding: 65px 20px 90px;
          color: white;
          background: linear-gradient(135deg, #0d5946, #159878);
        }

        .contact-hero h1 {
          font-size: clamp(32px, 5vw, 46px);
          margin: 15px 0;
        }

        .contact-hero p {
          opacity: .9;
          line-height: 1.8;
        }

        .contact-container {
          max-width: 1050px;
          padding: 0 18px;
          margin: -45px auto 60px;
          position: relative;
        }

        .contact-card {
          background: white;
          border-radius: 20px;
          padding: 35px;
          box-shadow: 0 12px 40px rgba(0,0,0,.06);
        }

        .contact-heading {
          text-align: center;
          margin-bottom: 30px;
        }

        .contact-heading h2 {
          font-size: 25px;
          margin-bottom: 10px;
        }

        .contact-heading p {
          color: #71817b;
          line-height: 1.7;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .contact-option {
          border: 1px solid #e6eeeb;
          border-radius: 16px;
          padding: 25px 15px;
          text-align: center;
          transition: .25s;
        }

        .contact-option:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,.07);
        }

        .contact-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 15px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9f6f0;
          color: #117354;
        }

        .contact-option h3 {
          margin: 8px 0;
          font-size: 19px;
        }

        .contact-option p {
          color: #71817b;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .contact-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: 9px;
          color: white;
          background: #117354;
          text-decoration: none;
          font-weight: 600;
          box-sizing: border-box;
        }

        .facebook-button { background: #1877f2; }
        .whatsapp-button { background: #159b63; }
        .phone-button { background: #117354; }

        .contact-info {
          background: #eaf6f0;
          padding: 25px;
          border-radius: 15px;
          margin-top: 30px;
        }

        .contact-info h3 {
          margin-bottom: 17px;
        }

        .contact-info p {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #526c61;
          margin: 12px 0;
          line-height: 1.6;
        }

        .contact-footer {
          background: #103d32;
          color: white;
          text-align: center;
          padding: 28px 15px;
        }

        @media(max-width: 700px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-card {
            padding: 25px 18px;
          }

          .contact-brand {
            font-size: 18px;
          }
        }
      `}</style>

      <header className="contact-header">
        <a href="/" className="contact-brand">
  <Fish size={28} />
  Contact Us
</a>

        <a href="/" className="contact-back">
          <ArrowLeft size={18} />
          হোমে ফিরুন
        </a>
      </header>

      <section className="contact-hero">
        <MessageCircle size={45} />
        <h1>Contact Us</h1>
        <p>
          আপনার যেকোনো প্রশ্ন বা অর্ডারের প্রয়োজনে
          <br />
          আমাদের সঙ্গে যোগাযোগ করুন।
        </p>
      </section>

      <main className="contact-container">
        <div className="contact-card">

          <div className="contact-heading">
            <h2>আমাদের সঙ্গে যোগাযোগ করুন</h2>
            <p>
              SeaFish Bogura সবসময় আপনার সহযোগিতায়
              পাশে থাকতে আগ্রহী।
            </p>
          </div>

          <div className="contact-grid">

            <div className="contact-option">
              <div className="contact-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#1877F2">
  <path d="M24 12a12 12 0 1 0-13.875 11.854v-8.386H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.955.925-1.955 1.874V12h3.328l-.532 3.468h-2.796v8.386A12.002 12.002 0 0 0 24 12z"/>
</svg>
              </div>
              <h3>Facebook Page</h3>
              <p>আমাদের Facebook পেজে যুক্ত থাকুন।</p>
              <a
                className="contact-button facebook-button"
                href="https://www.facebook.com/profile.php?id=61595853544460"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M24 12a12 12 0 1 0-13.875 11.854v-8.386H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.955.925-1.955 1.874V12h3.328l-.532 3.468h-2.796v8.386A12.002 12.002 0 0 0 24 12z"/>
</svg>
                Visit Facebook
              </a>
            </div>

            <div className="contact-option">
              <div className="contact-icon">
                <MessageCircle size={30} />
              </div>
              <h3>WhatsApp</h3>
              <p>দাম, পণ্য ও অর্ডার সম্পর্কে জানতে লিখুন।</p>
              <a
                className="contact-button whatsapp-button"
                href="https://wa.me/8801982395288"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            <div className="contact-option">
              <div className="contact-icon">
                <Phone size={30} />
              </div>
              <h3>Call Us</h3>
              <p>{phone}</p>
              <a
                className="contact-button phone-button"
                href="tel:+8801982395288"
              >
                <Phone size={18} />
                Call Now
              </a>
            </div>

          </div>

          <div className="contact-info">
            <h3>Business Information</h3>

            <p>
              <MapPin size={20} />
              Bogura, Bangladesh
            </p>

            <p>
              <Phone size={20} />
              {phone}
            </p>

            <p>
              <Clock size={20} />
              যোগাযোগের সময়: WhatsApp-এ মেসেজ পাঠাতে পারেন।
            </p>
          </div>

        </div>
      </main>

      <footer className="contact-footer">
        © {new Date().getFullYear()} SeaFish Bogura.
        All Rights Reserved.
      </footer>
    </div>
  );
}
