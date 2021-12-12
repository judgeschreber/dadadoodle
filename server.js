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

app.get("/", (req, res) => {
    let randomUrl = uuidv4();
    console.log("randomUrl ", randomUrl);
    res.render("start", {
        url: randomUrl,
    });
});

app.get("/doodle/*", (req, res) => {
    res.render("doodle");
});

const server = app.listen(3000);

const io = socket(server);
io.sockets.on("connection", newConnection);

function newConnection(socket) {
    console.log("new connection: ", socket.id);
    socket.on("mouse", mouseEmit);
    socket.on("mouseoff", mouseEmit);

    function mouseEmit(data) {
        console.log("mouseEmit triggered");
        socket.broadcast.emit("mouse", data);
        socket.broadcast.emit("mouseoff", data);
    }
}
