import { io } from "socket.io-client";


const socket = io(
    "http://localhost:3002",
    {
        autoConnect: false
    }
);


export const connectSocket = () => {

    const token =
        localStorage.getItem("token");


    socket.auth = {
        token: token
    };


    if (!socket.connected) {

        socket.connect();

    }

    return socket;

};


export default socket;