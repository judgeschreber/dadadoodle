const express = require("express");
const app = express();

const artists = require("./artists.js");
app.use(express.static("./public"));

const { v4: uuidv4 } = require("uuid");

const { engine } = require("express-handlebars");
app.engine(
    "handlebars",
    engine({ extname: ".handlebars", defaultLayout: "main" })
);

app.set("view engine", "handlebars");

let randomUrl;
app.get("/", (req, res) => {
    randomUrl = uuidv4();
    res.render("start", {
        url: randomUrl,
    });
});

let uniqeUrl;
let ec;
app.get("/doodle/*", (req, res) => {
    uniqeUrl = req.params[0];
    ec = false;
    res.render("doodle", {
        url: `https://dadadoodle.herokuapp.com/doodle/${uniqeUrl}`,
    });
});

app.get("/ec/*", (req, res) => {
    uniqeUrl = req.params[0];
    ec = true;
    res.render("ec", {
        url: `https://dadadoodle.herokuapp.com/ec/${uniqeUrl}`,
    });
});

const server = app.listen(process.env.PORT || 3000);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(
            null,
            req.headers.referer.startsWith(`http://localhost:3000/`) ||
                req.headers.referer.startsWith(
                    "https://dadadoodle.herokuapp.com"
                )
        ),
});

//const io = socket(server);

let room;
let rooms = {};
io.on("connection", (socket) => {
    newConnection(socket);
    showNewUser(socket.id);
    roomFull(socket);
    socket.on("disconnecting", () => {
        if (room) {
            let allIds = io.sockets.adapter.rooms.get(room).size;
            userLeft(socket.id, allIds);
        }
    });
});

function roomFull(socket) {
    room = rooms[socket.handshake.headers.referer];
    if (ec && io.sockets.adapter.rooms.get(room).size > 2) {
        socket.emit("roomFull", "this room is full");
    }
}

let roomName = 0;
function newConnection(socket) {
    if (!rooms.hasOwnProperty(socket.handshake.headers.referer)) {
        rooms[socket.handshake.headers.referer] = roomName++;
    }
    room = rooms[socket.handshake.headers.referer];
    socket.join(room);

    socket.on("mouse", (data) => {
        room = rooms[socket.handshake.headers.referer];
        socket.to(room).emit("mouse", data);
        socket.to(room).emit("mouseoff", data);
    });
    socket.on("mouseoff", (data) => {
        room = rooms[socket.handshake.headers.referer];
        socket.to(room).emit("mouse", data);
        socket.to(room).emit("mouseoff", data);
    });
    socket.on("done", doneClick);
    socket.on("clear", clearCanvas);
    socket.on("clearFree", clearFree);
    socket.on("emitUserName", usersToClient);
}

function showNewUser(id) {
    let allIds = io.sockets.adapter.rooms.get(room).size;

    if (ec && allIds > 2) {
        return;
    }

    data = {
        id: id,
        roomsize: allIds,
    };
    io.to(room).emit("userJoined", data);
}

function userLeft(id, allIds) {
    if (room) {
        data = {
            id: id,
            roomsize: (allIds -= 1),
        };
        io.to(room).emit("userLeft", data);
    }
}

function doneClick(data) {
    let doneArray = [];
    doneArray.push(data);

    io.to(room).emit("userDone", doneArray);
}

function clearCanvas(data) {
    io.to(room).emit("clearCanvas", data);
}

function clearFree(data) {
    io.to(room).emit("clearFree", data);
}

let names = {};

function usersToClient(data) {
    let roomSize = io.sockets.adapter.rooms.get(room).size;
    if (!names[room]) {
        names[room] = [];
    }
    let artsyName;
    artsyName = `${data}${
        artists.first[Math.floor(Math.random() * artists.first.length)]
    } ${artists.last[Math.floor(Math.random() * artists.last.length)]}`;
    names[room].push(artsyName);

    let usersData = {
        name: names[room],
        roomSize: roomSize,
    };
    io.to(room).emit("namedUsers", usersData);
}
