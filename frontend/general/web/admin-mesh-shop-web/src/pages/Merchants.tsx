import { useState } from "react";
import { Check, UsersRound } from "lucide-react";
import { ErrorState, Loading, Notice, Pagination, services, useAsync, useAuth } from "@mesh-shop/shared";
import CreateSpaceModal from "../components/CreateSpaceModal";
export default function Merchants() {
    const { account } = useAuth();
    const canApprove = account?.roles.some((role) =>
        ["ADMIN", "GENERAL_ADMIN"].includes(role.replace(/^ROLE_/, "").toUpperCase()),
    );
    const [page, setPage] = useState(0),
        [search, setSearch] = useState("");
    const { data, loading, error, reload } = useAsync(
        () => services.game.findMerchants({ page, size: 12, search }),
        [page, search],
    );
    const [busy, setBusy] = useState(""),
        [notice, setNotice] = useState(""),
        [create, setCreate] = useState(false);
    const approve = async (id: string) => {
        if (!canApprove) return;
        setBusy(id);
        setNotice("");
        try {
            await services.game.approveMerchant(id);
            reload();
        } catch (error) {
            setNotice((error as Error).message);
        } finally {
            setBusy("");
        }
    };
    return (
        <main className="page-content">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">THE PEOPLE BEHIND THE SPACES</span>
                    <h1>Meet your merchants.</h1>
                    <p>Review applications and make room for the next independent maker.</p>
                </div>
                <span className="large-icon">
                    <UsersRound size={30} />
                </span>
            </div>
            <div className="search-input">
                <input
                    aria-label="Search merchants"
                    placeholder="Search merchants…"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(0);
                    }}
                />
            </div>
            {notice && <Notice error>{notice}</Notice>}
            {loading ? (
                <Loading />
            ) : error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : (
                <div className="merchant-grid">
                    {data?.content.map((merchant) => (
                        <article className="merchant-card" key={merchant.id}>
                            <span className="merchant-monogram">
                                {merchant.name
                                    .split(" ")
                                    .map((s) => s[0])
                                    .filter((s) => s !== "&")
                                    .slice(0, 2)
                                    .join("")}
                            </span>
                            <span className={`status-pill ${merchant.status === "APPROVED" ? "published" : "draft"}`}>
                                {merchant.status === "APPROVED" ? "Approved" : "Awaiting review"}
                            </span>
                            <h2>{merchant.name}</h2>
                            <p>{merchant.category}</p>
                            <span className="merchant-email">{merchant.email}</span>
                            {merchant.status === "PENDING" ? (
                                <button
                                    className="button primary"
                                    disabled={Boolean(busy) || !canApprove}
                                    onClick={() => void approve(merchant.id)}
                                >
                                    <Check size={16} />
                                    {busy === merchant.id
                                        ? "Approving…"
                                        : canApprove
                                          ? "Approve merchant"
                                          : "Administrator approval required"}
                                </button>
                            ) : (
                                <button className="button secondary" onClick={() => setCreate(true)}>
                                    Create a space
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}
            <Pagination data={data} onPage={setPage} busy={loading} label="Merchants" />
            {create && <CreateSpaceModal onClose={() => setCreate(false)} />}
        </main>
    );
}
