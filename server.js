const express = require("express");
const app = express();

const socket = require("socket.io");

app.use(express.static("./public"));

console.log("hello!!");

const server = app.listen(3000);

const io = socket(server);
io.sockets.on("connection", newConnection);

function newConnection(socket) {
    console.log("new connection: ", socket.id);
    socket.on("mouse", mouseEmit);

    function mouseEmit(data) {
        socket.broadcast.emit("mouse", data);
    }
}
