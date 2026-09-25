import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

const UserDashboard = () => {
    const [paymentMessage, setPaymentMessage] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [paying, setPaying] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();

    useEffect(() => {
        const payment = searchParams.get("payment");

        if (payment === "success") {
            setPaymentMessage(
                "Checkout completed. Your payment is being confirmed."
            );

            searchParams.delete("payment");
            setSearchParams(searchParams, { replace: true });
        }
        else if (payment === "cancelled") {
            setPaymentMessage(
                "Payment was cancelled. No payment was completed."
            );

            searchParams.delete("payment");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handlePayment = async () => {
        setPaying(true);
        setPaymentError("");
        setPaymentMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://127.0.0.1:3002/payment/create-checkout-session",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPaymentError(
                    data.message || "Unable to start payment"
                );
                return;
            }

            window.location.href = data.url;
        }
        catch (error) {
            setPaymentError(
                "Unable to connect to payment server"
            );
        }
        finally {
            setPaying(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        navigate("/login", { replace: true });
    };

    return (
        <div className="page-console">
            <div className="console-shell">

                <div className="console-topbar">
                    <div className="console-topbar-text">
                        <span className="console-tag">User</span>
                        <h1>Your dashboard</h1>
                        <p>
                            Here's an overview of your account and support activity.
                        </p>
                    </div>

                    <div className="console-topbar-actions">
                        <Link to="/chat" className="pill-link">Live Chat</Link>
                        <Link to="/map" className="pill-link">Map</Link>
                        <Link to="/" className="pill-link">Home</Link>
                    </div>
                </div>

                <div className="card-row">

                    <div className="console-card">
                        <h2>My Profile</h2>

                        <p>
                            View and update your personal information and
                            profile details.
                        </p>

                        <div className="console-card-actions">
                            <button type="button" className="btn-outline">
                                View Profile
                            </button>

                            <button
                                type="button"
                                className="btn-outline-danger"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="console-card">
                        <h2>My Requests</h2>

                        <p>
                            Keep track of your submitted requests and their
                            current status.
                        </p>

                        <button type="button" className="btn-amber">
                            View Requests
                        </button>
                    </div>

                    <div className="console-card">
                        <h2>Help &amp; Support</h2>

                        <p>
                            Need assistance? Browse our guides or submit a
                            support request.
                        </p>

                        <button type="button" className="btn-amber">
                            Get Help
                        </button>
                    </div>

                </div>

                <div className="console-card">
                    <div className="console-card-title-row">
                        <h2>Premium Support</h2>
                        <span className="price-tag">$20 one-time</span>
                    </div>

                    <p>
                        Get priority TechSolve support for a one-time payment
                        of $20.
                    </p>

                    <button
                        type="button"
                        className="btn-amber"
                        onClick={handlePayment}
                        disabled={paying}
                    >
                        {paying
                            ? "Opening Checkout..."
                            : "Pay $20"}
                    </button>

                    {paymentMessage && (
                        <p className="banner-success">
                            {paymentMessage}
                        </p>
                    )}

                    {paymentError && (
                        <p className="banner-error">
                            {paymentError}
                        </p>
                    )}
                </div>

                <div className="console-card">
                    <h2>Recent Activity</h2>

                    <div className="activity-feed">
                        <p className="activity-empty">No recent activity.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
