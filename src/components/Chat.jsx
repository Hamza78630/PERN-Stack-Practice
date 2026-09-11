import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { connectSocket } from "../socket";

const CHAT_ROOM = "support-chat";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("You must be logged in to use chat.");
            return;
        }

        const socket = connectSocket();

        const handleConnect = () => {
            setConnected(true);
            socket.emit("joinChat", CHAT_ROOM);
        };

        const handleDisconnect = () => setConnected(false);

        const handleReceiveMessage = (data) => {
            setMessages((previous) => {
                if (previous.some((item) => item.clientMessageId === data.clientMessageId)) {
                    return previous;
                }

                return [
                    ...previous,
                    { ...data, source: "socket" }
                ];
            });
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("receiveMessage", handleReceiveMessage);

        if (socket.connected) {
            handleConnect();
        }

        let unsubscribe = () => {};
        let cancelled = false;

        firebaseReady
            .then(() => {
                if (cancelled) return;

                const messagesQuery = query(
                    collection(db, "messages"),
                    where("roomId", "==", CHAT_ROOM),
                    orderBy("createdAt", "asc")
                );

                unsubscribe = onSnapshot(
                    messagesQuery,
                    (snapshot) => {
                        const storedMessages = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                            source: "firebase"
                        }));

                        setMessages((previous) => {
                            const temporarySocketMessages = previous.filter(
                                (item) =>
                                    item.source === "socket" &&
                                    !storedMessages.some(
                                        (stored) =>
                                            stored.clientMessageId === item.clientMessageId
                                    )
                            );

                            return [...storedMessages, ...temporarySocketMessages];
                        });
                    },
                    (firebaseError) => {
                        console.error(firebaseError);
                        setError("Unable to load chat history from Firebase.");
                    }
                );
            })
            .catch((firebaseError) => {
                console.error(firebaseError);
                setError("Firebase could not be initialized. Check your Firebase setup.");
            });

        return () => {
            cancelled = true;
            unsubscribe();
            socket.emit("leaveChat", CHAT_ROOM);
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const text = message.trim();
        if (!text) return;

        setError("");

        const socket = connectSocket();
        const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        if (!socket.connected) {
            setError("Socket is not connected.");
            return;
        }

        socket.emit("sendMessage", {
            roomId: CHAT_ROOM,
            text,
            clientMessageId
        });

        setMessage("");
    };

    useEffect(() => {
        const socket = connectSocket();

        const handlePersistMessage = async (data) => {
            if (!data?.shouldPersist) return;

            try {
                await firebaseReady;

                await addDoc(collection(db, "messages"), {
                    roomId: data.roomId,
                    text: data.text,
                    senderId: data.senderId,
                    senderEmail: data.senderEmail,
                    senderRole: data.senderRole,
                    clientMessageId: data.clientMessageId,
                    createdAt: serverTimestamp()
                });
            }
            catch (firebaseError) {
                console.error(firebaseError);
                setError("Message was sent live, but could not be saved to Firebase.");
            }
        };

        socket.on("persistMessage", handlePersistMessage);

        return () => {
            socket.off("persistMessage", handlePersistMessage);
        };
    }, []);

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div>
                        <h1>Live Support Chat</h1>
                        <p>Socket.IO delivers messages live. Firebase stores the history.</p>
                    </div>
                    <Link to="/" className="dashboard-home">Home</Link>
                </div>

                <div className="chat-status">
                    <span className={connected ? "status-dot online" : "status-dot"}></span>
                    {connected ? "Connected" : "Disconnected"}
                </div>

                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <p className="chat-empty">No messages yet. Start the conversation.</p>
                    ) : (
                        messages.map((item) => (
                            <div className="chat-message" key={item.id || item.clientMessageId}>
                                <strong>{item.senderEmail || "User"}</strong>
                                <span className="chat-role">{item.senderRole || ""}</span>
                                <p>{item.text}</p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={1000}
                    />
                    <button type="submit" disabled={!connected || !message.trim()}>
                        Send
                    </button>
                </form>

                {error && <p className="chat-error">{error}</p>}
            </div>
        </div>
    );
};

export default Chat;
