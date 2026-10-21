import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
    ArrowUpRight,
    Box,
    ChevronDown,
    Globe2,
    LayoutDashboard,
    LogOut,
    Menu,
    Plus,
    UsersRound,
    X,
} from "lucide-react";
import { Brand, isMockMode, useAuth } from "@mesh-shop/shared";

export default function AdminShell() {
    const { account, logout } = useAuth(),
        [open, setOpen] = useState(false);
    return (
        <div className="admin-app">
            <button
                className="mobile-nav-toggle icon-button"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
            >
                <Menu size={20} />
            </button>
            <aside className={`admin-sidebar ${open ? "mobile-open" : ""}`}>
                <div className="admin-brand">
                    <Brand studio />
                    <button
                        className="icon-button mobile-only"
                        aria-label="Close navigation"
                        onClick={() => setOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="workspace-switch">
                    <span className="workspace-avatar">MD</span>
                    <div>
                        <strong>Mesh District</strong>
                        <small>{isMockMode ? "Local workspace" : "Production workspace"}</small>
                    </div>
                    <ChevronDown size={14} />
                </div>
                <span className="nav-label">WORKSPACE</span>
                <nav onClick={() => setOpen(false)} aria-label="Workspace navigation">
                    <NavLink to="/dashboard">
                        <LayoutDashboard size={18} />
                        Overview
                    </NavLink>
                    <NavLink to="/meshes">
                        <Box size={18} />
                        Mesh library
                    </NavLink>
                    <NavLink to="/game/maps/0">
                        <Globe2 size={18} />
                        World editor
                    </NavLink>
                    <NavLink to="/merchants">
                        <UsersRound size={18} />
                        Merchants
                    </NavLink>
                </nav>
                <Link to="/meshes/new" className="button secondary sidebar-create">
                    <Plus size={16} />
                    Create a mesh
                </Link>
                <div className="sidebar-bottom">
                    <a
                        className="preview-link"
                        href={import.meta.env.VITE_USER_APP_URL || "http://localhost:5173"}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Visit the district
                        <ArrowUpRight size={15} />
                    </a>
                    <div className="sidebar-status">
                        <span className="status-dot" />
                        {isMockMode ? "LOCAL DEMO" : "CONNECTED TO GATEWAY"}
                    </div>
                    <div className="account-row">
                        <span className="avatar">{account?.name?.slice(0, 1) || "A"}</span>
                        <span>
                            <strong>{account?.displayName || "Administrator"}</strong>
                            <small>Workspace admin</small>
                        </span>
                        <button className="icon-button" aria-label="Sign out" onClick={() => void logout()}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
            <div className="admin-main">
                <header className="admin-topbar">
                    <span>
                        Workspace <span className="muted">/</span> <strong>Mesh District</strong>
                    </span>
                    <span className="tag">{isMockMode ? "DEVELOPMENT" : "PRODUCTION"}</span>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
