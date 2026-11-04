
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminPanel from "./AdminPanel.jsx";
import Checkout from "./Checkout.jsx";
import OrderTracking from "./OrderTracking.jsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

let Page = App;

if (path === "/admin") {
  Page = AdminPanel;
} else if (path === "/checkout") {
  Page = Checkout;
  } else if (path === "/track-order") {
  Page = OrderTracking;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
