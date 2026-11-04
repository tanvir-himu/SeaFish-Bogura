
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Supabase পরীক্ষা চলছে...");

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase
          .from("products")
          .select("id")
          .limit(1);

        if (error) {
          setStatus("ডেটাবেসে সমস্যা: " + error.message);
        } else {
          setStatus("সংযোগ সফল! Supabase ডেটাবেসে যোগাযোগ হচ্ছে।");
        }
      } catch (err) {
        setStatus("সমস্যা: " + err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <main style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>SeaFish Bogura — Connection Test</h1>
      <p>{status}</p>
    </main>
  );
}
