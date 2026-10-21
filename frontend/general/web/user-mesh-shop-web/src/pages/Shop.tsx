import { Link } from "react-router-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Header from "../components/Header";
export default function Shop() {
    return (
        <div className="visitor-app">
            <Header />
            <main className="shop-placeholder">
                <span className="coming-icon">
                    <ShoppingBag size={35} />
                </span>
                <span className="eyebrow">SOMETHING GOOD IS TAKING SHAPE</span>
                <h1>
                    A familiar way to shop.
                    <br />
                    <em>Coming soon.</em>
                </h1>
                <p>
                    We’re making space for the classic shop. In the meantime, meet the makers, wander their rooms, and
                    get closer to the objects in 3D.
                </p>
                <Link className="button primary large" to="/game/maps/0">
                    Explore the district <ArrowUpRight size={19} />
                </Link>
                <span className="muted">Purchasing and checkout are planned for a future release.</span>
            </main>
        </div>
    );
}
