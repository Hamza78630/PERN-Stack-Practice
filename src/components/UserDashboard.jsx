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
        <div className="dashboard-page">
            <div className="dashboard-container">

                <div className="dashboard-header">
                    <div>
                        <h1>User Dashboard</h1>
                        <p>
                            Welcome back! Here's an overview of your account.
                        </p>
                    </div>

                    <div>
                        <Link
                            to="/chat"
                            className="dashboard-home"
                        >
                            Live Chat
                        </Link>

                        <Link
                            to="/map"
                            className="dashboard-home"
                        >
                            Map
                        </Link>

                        <Link
                            to="/"
                            className="dashboard-home"
                        >
                            Home
                        </Link>
                    </div>
                </div>

                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <h2>My Profile</h2>

                        <p>
                            View and update your personal information and
                            profile details.
                        </p>

                        <button
                            type="button"
                            className="profile-button"
                        >
                            View Profile
                        </button>

                        <button
                            type="button"
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h2>My Requests</h2>

                        <p>
                            Keep track of your submitted requests and their
                            current status.
                        </p>

                        <button type="button">
                            View Requests
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h2>Help & Support</h2>

                        <p>
                            Need assistance? Browse our guides or submit a
                            support request.
                        </p>

                        <button type="button">
                            Get Help
                        </button>
                    </div>

                </div>

                <div className="dashboard-section payment-section">
                    <h2>Premium Support</h2>

                    <p>
                        Get priority TechSolve support for a one-time payment
                        of $20.
                    </p>

                    <button
                        type="button"
                        onClick={handlePayment}
                        disabled={paying}
                    >
                        {paying
                            ? "Opening Checkout..."
                            : "Pay $20"}
                    </button>

                    {paymentMessage && (
                        <p className="payment-message">
                            {paymentMessage}
                        </p>
                    )}

                    {paymentError && (
                        <p className="payment-error">
                            {paymentError}
                        </p>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2>Recent Activity</h2>

                    <div className="activity">
                        <p>No recent activity.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;