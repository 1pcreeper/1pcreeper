import { useEffect, useRef, type ReactNode } from "react";
import { Link, useRouteError } from "react-router-dom";
import { ArrowUpRight, Box, X, AlertCircle, LoaderCircle } from "lucide-react";
import type { ObjectType } from "../../models/dto/mesh.dto";

export function Brand({ studio = false }: { studio?: boolean }) {
    return (
        <Link to={studio ? "/dashboard" : "/home"} className="brand">
            <span className="brand-icon">
                <Box size={23} strokeWidth={1.6} />
            </span>
            <span>
                mesh<span className="brand-suffix">{studio ? "studio" : "district"}</span>
                <small>{studio ? "SPATIAL COMMERCE CONSOLE" : "A NEW PERSPECTIVE ON DESIGN"}</small>
            </span>
        </Link>
    );
}
export function Modal({
    title,
    children,
    onClose,
    wide = false,
    fullScreen = false,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
    wide?: boolean;
    fullScreen?: boolean;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        dialog.current?.showModal();
        const node = dialog.current;
        return () => node?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className={`modal ${wide ? "modal-wide" : ""} ${fullScreen ? "modal-fullscreen" : ""}`}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === dialog.current) onClose();
            }}
            aria-label={title}
        >
            <div className="modal-heading">
                <h2>{title}</h2>
                <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>
            {children}
        </dialog>
    );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
    return (
        <div className={`notice ${error ? "notice-error" : ""}`} role={error ? "alert" : "status"}>
            <AlertCircle size={16} />
            <span>{children}</span>
        </div>
    );
}
export function Loading({ label = "Loading your space…" }: { label?: string }) {
    return (
        <div className="state-screen">
            <LoaderCircle className="spin" size={25} />
            <p>{label}</p>
        </div>
    );
}
export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="state-screen">
            <AlertCircle size={30} />
            <h2>We couldn’t open this space</h2>
            <p>{error}</p>
            {onRetry && (
                <button className="button primary" onClick={onRetry}>
                    Try again
                </button>
            )}
            <Link to="/">
                Return home <ArrowUpRight size={16} />
            </Link>
        </div>
    );
}
export function RouteError() {
    const error = useRouteError();
    return <ErrorState error={error instanceof Error ? error.message : "This page could not be found."} />;
}
export function ObjectArtwork({
    type = "CHAIR",
    color = "#d8be88",
    className = "",
}: {
    type?: ObjectType;
    color?: string;
    className?: string;
}) {
    return (
        <svg
            className={`object-artwork ${className}`}
            viewBox="0 0 320 230"
            fill="none"
            role="img"
            aria-label={`${type.toLowerCase()} preview`}
        >
            <ellipse cx="167" cy="196" rx="100" ry="16" fill="#000" opacity=".13" />
            {["OBJ", "ASSET", "BOX"].includes(type) ? (
                <>
                    <path d="m85 82 79-36 76 39-76 41Z" fill={color} />
                    <path d="m85 82 79 44v75l-79-43Z" fill={color} />
                    <path d="m164 126 76-41v75l-76 41Z" fill={color} />
                    <path d="m164 126 76-41v75l-76 41Z" fill="black" opacity=".2" />
                    <path d="m85 82 79 44 76-41M164 126v75" stroke="white" strokeOpacity=".2" strokeWidth="2" />
                </>
            ) : type === "LAMP" ? (
                <>
                    <path d="M142 185c0-7 15-12 29-12s29 5 29 12-15 12-29 12-29-5-29-12Z" fill={color} />
                    <path d="M167 92h8v92h-8z" fill={color} />
                    <path d="M103 108a68 68 0 0 1 136 0Z" fill={color} />
                    <ellipse cx="171" cy="108" rx="68" ry="13" fill="#efdec0" />
                    <path d="M105 102c10-40 38-57 68-60" stroke="white" strokeOpacity=".18" strokeWidth="5" />
                </>
            ) : type === "TABLE" ? (
                <>
                    <path d="m105 139-9 54h14l14-51M213 132l15 57h-13l-17-48M162 139v52h13v-52" fill="#73523b" />
                    <ellipse cx="165" cy="128" rx="98" ry="42" fill={color} />
                    <path
                        d="M67 124v9c0 23 44 42 98 42s98-19 98-42v-9c0 23-44 42-98 42s-98-19-98-42"
                        fill="#000"
                        opacity=".12"
                    />
                </>
            ) : type === "BUILDING" ? (
                <>
                    <path d="m66 185 95-45 100 36-90 43Z" fill="#798372" />
                    <path d="M78 180V87l78-32 93 25v97l-79 26Z" fill={color} />
                    <path d="m78 87 92 30 79-37-93-25Z" fill="#e6d6be" />
                    <path d="M170 117v86l79-26V80Z" fill="#000" opacity=".14" />
                    <path d="m102 141 20 7v43l-20-6Zm38 9 17 6v32l-17-5Z" fill="#405448" />
                    <path d="m82 126 83 27 17-9-88-30Z" fill="#d8f36a" />
                </>
            ) : (
                <>
                    <path d="m97 164-3 31 10 2 6-32M222 162l5 30-10 3-8-30" fill="#735440" />
                    <path d="M90 132V90q0-22 24-23l88 4q24 2 24 28v47Z" fill={color} />
                    <path
                        d="M107 83q38-5 91 3"
                        stroke="white"
                        strokeOpacity=".18"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <path d="m86 143 54-24 100 18-61 44-93-11Z" fill={color} />
                    <path d="m87 145 92 23 61-28v24l-61 30-92-25Z" fill={color} />
                    <path d="m87 145 92 23v26l-92-25Z" fill="#000" opacity=".12" />
                    <path d="M76 120q0-10 13-9l17 5q10 3 10 14v31q0 12-11 9l-21-5q-8-2-8-12Z" fill={color} />
                    <path d="M217 125q0-11 11-12l17 5q8 2 8 11v28q0 9-10 12l-13 3q-13 2-13-10Z" fill={color} />
                    <path d="m109 139 47 9 60-8-37 25Z" fill="#fff" opacity=".08" />
                </>
            )}
        </svg>
    );
}
