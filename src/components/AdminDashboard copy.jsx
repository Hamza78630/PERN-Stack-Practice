import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [payments, setPayments] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        navigate("/login", { replace: true });
    };

    useEffect(() => {
        // Connect to Socket.IO
        const socket = connectSocket();

        // Listen for new user registrations
        const handleNewUser = (data) => {
            console.log(
                "New user registered:",
                data
            );

            setActivities((previousActivities) => [
                {
                    id: `${Date.now()}-${data.email}`,
                    message:
                        `New ${data.role.toLowerCase()} registered: ${data.name}`,
                    email: data.email
                },
                ...previousActivities
            ]);
        };

        socket.on(
            "newUserRegistered",
            handleNewUser
        );

        const handlePayment = (data) => {
            setPayments((previousPayments) => [
                data,
                ...previousPayments
            ]);

            setActivities((previousActivities) => [
                {
                    id: `${Date.now()}-payment-${data.orderId}`,
                    message:
                        `Payment received: $${(data.amount / 100).toFixed(2)}`,
                    email: `Order ${data.orderId}`
                },
                ...previousActivities
            ]);
        };

        socket.on(
            "paymentReceived",
            handlePayment
        );

        // Cleanup when dashboard closes
        return () => {
            socket.off(
                "newUserRegistered",
                handleNewUser
            );

            socket.off(
                "paymentReceived",
                handlePayment
            );

            socket.disconnect();
        };
    }, []);

    return (
        <div className="page-console">
            <div className="console-shell">

                <div className="console-topbar">
                    <div className="console-topbar-text">
                        <span className="console-tag">Admin</span>
                        <h1>Admin dashboard</h1>

                        <p>
                            Monitor users, requests and system activity.
                        </p>
                    </div>

                    <div className="console-topbar-actions">
                        <Link to="/chat" className="pill-link">Live Chat</Link>
                        <Link to="/" className="pill-link">Home</Link>

                        <button
                            type="button"
                            className="btn-outline-danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="stat-row">

                    <div className="stat-card">
                        <h2>125</h2>
                        <p>Total Users</p>
                    </div>

                    <div className="stat-card">
                        <h2>18</h2>
                        <p>Pending Requests</p>
                    </div>

                    <div className="stat-card">
                        <h2>94</h2>
                        <p>Resolved Requests</p>
                    </div>

                    <div className="stat-card">
                        <h2>4</h2>
                        <p>Active Admins</p>
                    </div>

                </div>

                <div className="card-row">

                    <div className="console-card">
                        <h2>User Management</h2>

                        <p>
                            View registered users, monitor
                            their activity and manage user accounts.
                        </p>

                        <button type="button" className="btn-amber">
                            Manage Users
                        </button>
                    </div>

                    <div className="console-card">
                        <h2>Support Requests</h2>

                        <p>
                            Review incoming support requests
                            and monitor their progress.
                        </p>

                        <button type="button" className="btn-amber">
                            View Requests
                        </button>
                    </div>

                    <div className="console-card">
                        <h2>System Activity</h2>

                        <p>
                            Monitor recent activity and keep
                            track of important system events.
                        </p>

                        <button type="button" className="btn-amber">
                            View Activity
                        </button>
                    </div>

                </div>

                <div className="console-card">
                    <h2>Recent Payments</h2>

                    <div className="activity-feed">
                        {payments.length === 0 ? (
                            <p className="activity-empty">
                                No payments received during this session.
                            </p>
                        ) : (
                            payments.map((payment) => (
                                <p className="activity-entry" key={payment.orderId}>
                                    Payment received: $
                                    {(payment.amount / 100).toFixed(2)}
                                </p>
                            ))
                        )}
                    </div>
                </div>

                <div className="console-card">
                    <h2>Recent Activity</h2>

                    <div className="activity-feed">
                        {activities.length === 0 ? (
                            <p className="activity-empty">
                                No recent activity.
                            </p>
                        ) : (
                            activities.map((activity) => (
                                <p className="activity-entry" key={activity.id}>
                                    {activity.message}{" "}
                                    ({activity.email})
                                </p>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
