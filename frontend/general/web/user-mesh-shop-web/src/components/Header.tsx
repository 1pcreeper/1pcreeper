import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, UserRound } from "lucide-react";
import { Brand, useAuth } from "@mesh-shop/shared";

export default function Header() {
    const { account, logout } = useAuth();
    return (
        <header className="visitor-header">
            <Brand />
            <nav aria-label="Main navigation">
                <NavLink to="/game/maps/0">Explore the district</NavLink>
                <a href="/home#collections">Collections</a>
                <a href="/home#about">Our perspective</a>
            </nav>
            <div className="header-actions">
                {account ? (
                    <button className="text-button" onClick={() => void logout()}>
                        <UserRound size={15} />
                        {account.displayName.split(" ")[0]} · Sign out
                    </button>
                ) : (
                    <Link className="text-button" to="/auth/login">
                        Sign in <ArrowUpRight size={16} />
                    </Link>
                )}
                <span className="header-divider" />
                <span className="edition">BETA / 01</span>
            </div>
        </header>
    );
}
