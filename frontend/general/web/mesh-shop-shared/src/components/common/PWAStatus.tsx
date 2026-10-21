/// <reference types="vite-plugin-pwa/react" />
import { useRegisterSW } from "virtual:pwa-register/react";
import { X, RefreshCw } from "lucide-react";

export default function PWAStatus() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW();
    if (!needRefresh) return null;
    return (
        <div className="pwa-update" role="status">
            <div>
                <strong>A fresh version is ready.</strong>
                <p>Save your edits before reloading.</p>
            </div>
            <button className="button primary" onClick={() => void updateServiceWorker(true)}>
                <RefreshCw size={14} />
                Reload
            </button>
            <button className="icon-button" aria-label="Dismiss update" onClick={() => setNeedRefresh(false)}>
                <X size={15} />
            </button>
        </div>
    );
}
