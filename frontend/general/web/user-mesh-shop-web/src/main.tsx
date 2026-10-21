import React from "react";
import ReactDOM from "react-dom/client";
import "@mesh-shop/shared/styles.css";
import App from "./App";
import { PWAStatus } from "@mesh-shop/shared";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
        <PWAStatus />
    </React.StrictMode>,
);
