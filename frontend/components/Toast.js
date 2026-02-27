"use client";

import { createContext, useContext, useState, useCallback } from "react";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const toast = {
        success: (title, msg) => addToast("success", title, msg),
        error: (title, msg) => addToast("error", title, msg),
        info: (title, msg) => addToast("info", title, msg),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className={styles.container}>
                {toasts.map((t) => (
                    <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
                        <div className={styles.icon}>
                            {t.type === "success" && "✓"}
                            {t.type === "error" && "✕"}
                            {t.type === "info" && "ℹ"}
                        </div>
                        <div className={styles.content}>
                            <div className={styles.title}>{t.title}</div>
                            {t.message && <div className={styles.message}>{t.message}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
