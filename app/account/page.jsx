
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../src/supabaseClient";
import "./account.css";

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const showMessage = (text, isSuccess = false) => {
    setMessage(text);
    setSuccess(isSuccess);
  };

  // Registration
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    showMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      console.log("SIGNUP RESPONSE:", JSON.stringify(data, null, 2));
      console.log("SIGNUP ERROR:", error);

      if (error) throw error;

      if (!data.user) {
        throw new Error("Registration সম্পন্ন হয়নি।");
      }

      setStep("otp");

      showMessage(
        "আপনার Email-এ Verification Code পাঠানো হয়েছে।",
        true
      );
    } catch (error) {
      console.error("Registration Error:", error);
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP
  async function handleVerify(e) {
    e.preventDefault();

    setLoading(true);
    showMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "signup",
      });

      if (error) throw error;

      showMessage("Email Verification সফল হয়েছে!", true);

      window.location.href = "/account/dashboard";
    } catch (error) {
      console.error("OTP Verification Error:", error);
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function resendOtp() {
    setLoading(true);
    showMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      showMessage("নতুন OTP পাঠানো হয়েছে।", true);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Login
  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    showMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      window.location.href = "/account/dashboard";
    } catch (error) {
      console.error("Login Error:", error);
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-card">

        <Link href="/" className="account-logo">
          🐟 SeaFish Bogura
        </Link>

        {step === "otp" ? (
          <>
            <h1>Email Verification</h1>

            <p>
              আপনার Email-এ পাঠানো ৬ সংখ্যার OTP লিখুন।
            </p>

            <form onSubmit={handleVerify}>
              <label>Verification Code</label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="৬ সংখ্যার OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                required
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verify হচ্ছে..." : "Verify Email"}
              </button>
            </form>

            <button
              type="button"
              className="resend-otp"
              onClick={resendOtp}
              disabled={loading}
            >
              OTP আবার পাঠান
            </button>
          </>
        ) : (
          <>
            <h1>
              {mode === "login"
                ? "Welcome Back!"
                : "Create Account"}
            </h1>

            <p>
              {mode === "login"
                ? "আপনার Account-এ Login করুন"
                : "SeaFish Bogura-তে নতুন Account তৈরি করুন"}
            </p>

            <div className="account-tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  showMessage("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  showMessage("");
                }}
              >
                Register
              </button>
            </div>

            <form
              onSubmit={
                mode === "login"
                  ? handleLogin
                  : handleRegister
              }
            >
              {mode === "register" && (
                <>
                  <label>আপনার নাম</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    required
                  />

                  <label>মোবাইল নম্বর</label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </>
              )}

              <label>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
              />

              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
                minLength={6}
                required
              />

              <button type="submit" disabled={loading}>
                {loading
                  ? "অপেক্ষা করুন..."
                  : mode === "login"
                  ? "Login করুন"
                  : "Account তৈরি করুন"}
              </button>
            </form>
          </>
        )}

        {message && (
          <p
            className={
              success ? "account-success" : "account-error"
            }
            role="status"
          >
            {message}
          </p>
        )}

        <Link href="/" className="back-home">
          ← হোম পেজে ফিরে যান
        </Link>

      </div>
    </main>
  );
}
