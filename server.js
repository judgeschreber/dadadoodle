const express = require("express");
const app = express();

const artists = require("./artists.js");
console.log(artists);
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
let ec;
app.get("/doodle/*", (req, res) => {
    room = req.params[0];
    ec = false;
    console.log("req.params = ", req.params[0]);
    res.render("doodle", {
        url: `https://dadadoodle.herokuapp.com/doodle/${room}`,
    });
});

app.get("/ec/*", (req, res) => {
    room = req.params[0];
    ec = true;
    console.log("req.params = ", req.params[0]);
    res.render("ec", {
        url: `https://dadadoodle.herokuapp.com/ec/${room}`,
    });
});

const server = app.listen(process.env.PORT || 3000);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(
            null,
            req.headers.referer.startsWith("http://localhost:3000") ||
                req.headers.referer.startsWith(
                    "https://dadadoodle.herokuapp.com"
                )
        ),
});

//const io = socket(server);
io.on("connection", (socket) => {
    socket.join(room);
    roomFull(socket);
    newConnection(socket);
    showNewUser(socket.id);
    socket.on("disconnecting", () => {
        console.log("disconnect!", socket.rooms);
        for (const room of socket.rooms) {
            if (room && room !== socket.id) {
                console.log("in if statement");
                userLeft(socket.id);
            }
        }
    });
});

function roomFull(socket) {
    if (ec && io.sockets.adapter.rooms.get(room).size > 2) {
        socket.emit("roomFull", "this room is full");
    }
}

function newConnection(socket) {
    console.log("new connection: ", socket.id);
    console.log("randomUrl ", randomUrl);
    socket.on("mouse", (data) => {
        console.log("mouseEmit triggered: ", data);

        socket.to(room).emit("mouse", data);
        socket.to(room).emit("mouseoff", data);
    });
    socket.on("mouseoff", (data) => {
        console.log("mouseEmit triggered: ", data);

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

    console.log("if ec: roomsize", allIds);
    data = {
        id: id,
        roomsize: allIds,
    };
    io.to(room).emit("userJoined", data);
}

function userLeft(id) {
    if (room) {
        let allIds = io.sockets.adapter.rooms.get(room).size;
        console.log("user left: ", allIds);
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
    console.log("clearCanvas in server: ", data);
    io.to(room).emit("clearCanvas", data);
}

function clearFree(data) {
    console.log("clearCanvas in server: ", data);
    io.to(room).emit("clearFree", data);
}

let names = {};

function usersToClient(data) {
    let roomSize = io.sockets.adapter.rooms.get(room).size;
    console.log("usersToClient triggered in server", data);
    if (!names[room]) {
        names[room] = [];
    }
    let artsyName;
    artsyName = `${data}${
        artists.first[Math.floor(Math.random() * artists.first.length)]
    } ${artists.last[Math.floor(Math.random() * artists.last.length)]}`;
    console.log("artsyName = ", artsyName);
    names[room].push(artsyName);
    console.log("names.room: ", names[room]);
    console.log("room: ", room);

    let usersData = {
        name: names[room],
        roomSize: roomSize,
    };
    io.to(room).emit("namedUsers", usersData);
}
