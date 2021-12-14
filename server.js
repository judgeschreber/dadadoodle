const express = require("express");
const app = express();
const socket = require("socket.io");
app.use(express.static("./public"));

const { v4: uuidv4 } = require("uuid");

const { engine } = require("express-handlebars");
app.engine(
    "handlebars",
    engine({ extname: ".handlebars", defaultLayout: "main" })
);

app.set("view engine", "handlebars");

console.log("hello!!");

let randomUrl;
app.get("/", (req, res) => {
    randomUrl = uuidv4();
    console.log("randomUrl ", randomUrl);
    res.render("start", {
        url: randomUrl,
    });
});

let room;
app.get("/doodle/*", (req, res) => {
    room = req.params[0];
    console.log("req.params = ", req.params[0]);
    res.render("doodle", {
        url: `http://localhost:3000/doodle/${room}`,
    });
});

app.get("/ec/*", (req, res) => {
    room = req.params[0];
    console.log("req.params = ", req.params[0]);
    res.render("ec", {
        url: `http://localhost:3000/ec/${room}`,
    });
});

const server = app.listen(3000);

let connectCounter = 0;

const io = socket(server);
io.on("connection", (socket) => {
    socket.join(room);
    connectCounter++;
    newConnection(socket);
    showNewUser(socket.id);
    socket.on("disconnecting", () => {
        console.log("disconnect!", socket.rooms);
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                console.log("in if statement");
                userLeft(socket.id);
            }
        }
    });
});

function newConnection(socket) {
    console.log("new connection: ", socket.id);
    console.log("randomUrl ", randomUrl);
    socket.on("mouse", mouseEmit);
    socket.on("mouseoff", mouseEmit);
}

function mouseEmit(data) {
    console.log("mouseEmit triggered: ", data);
    io.to(room).emit("mouse", data);
    io.to(room).emit("mouseoff", data);
}

function showNewUser(id) {
    let allIds = io.sockets.adapter.rooms.get(room).size;
    console.log("roomsize", allIds);
    data = {
        id: id,
        roomsize: allIds,
    };
    io.to(room).emit("userJoined", data);
}

function userLeft(id) {
    let allIds = io.sockets.adapter.rooms.get(room).size;
    console.log("user left: ", allIds);
    data = {
        id: id,
        roomsize: (allIds -= 1),
    };
    io.to(room).emit("userLeft", data);
}
