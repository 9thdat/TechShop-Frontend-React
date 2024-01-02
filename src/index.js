import React from "react";
import {createRoot} from "react-dom/client";
import {AuthProvider} from "./contexts/AuthProvider";

import App from "./App";
import "./index.css";
import "tailwindcss/tailwind.css";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = createRoot(document.getElementById("root"));

root.render(
    <AuthProvider>
        <App/>
        <ToastContainer/>
    </AuthProvider>
);
