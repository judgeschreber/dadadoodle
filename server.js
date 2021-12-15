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

const io = socket(server);
io.on("connection", (socket) => {
    socket.join(room);
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
    socket.on("done", doneClick);
    socket.on("clear", clearCanvas);
    socket.on("emitUserName", usersToClient);
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

function doneClick(data) {
    let doneArray = [];
    doneArray.push(data);

    io.to(room).emit("userDone", doneArray);
}

function clearCanvas(data) {
    console.log("clearCanvas in server: ", data);
    io.to(room).emit("clearCanvas", data);
}

let names = {};

function usersToClient(data) {
    let roomSize = io.sockets.adapter.rooms.get(room).size;
    console.log("usersToClient triggered in server", data);
    if (!names[room]) {
        names[room] = [];
    }
    names[room].push(data);
    console.log("names.room: ", names[room]);
    console.log("room: ", room);

    let usersData = {
        name: names[room],
        roomSize: roomSize,
    };
    io.to(room).emit("namedUsers", usersData);
}
