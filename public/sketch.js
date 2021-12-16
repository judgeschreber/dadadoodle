let ec = false;
const parsedUrl = new URL(window.location.href);
console.log(parsedUrl);
if (parsedUrl.pathname.startsWith("/ec")) {
    ec = true;
}

let buttons = document.getElementsByClassName("buttons");
let colorButton = document.getElementsByClassName("color-button");

let inviteButton = document.getElementsByClassName("invite-button");
let inviteField = document.getElementsByClassName("invite-field");
let copyText = document.querySelector("#input");
let newUser = document.querySelector("#users");
let numberOfDoodlers = document.querySelector("#number-of-doodlers");
let coverTop = document.querySelector("#cover-top");
let coverBottom = document.querySelector("#cover-bottom");
let redoButton = document.querySelector("#redo");
let circleWidthButton = document.querySelector("#circle-width");
let inviteSection = document.querySelector("#invite-section");
let colorText = document.querySelector("#color-text");

//Modal logic
let modal = document.querySelector("#show-modal");
let modalStartButton = document.querySelector("#modal-start-button");
let waitingModal = document.querySelector("#waiting");

let userName;
if (ec) {
    modalStartButton.addEventListener("click", () => {
        console.log("name: ", document.querySelector("#name-field").value);
        userName = document.querySelector("#name-field").value;
        console.log("start button");
        socket.emit("emitUserName", userName);
    });
}

let shapeText = document.querySelector("#shape-text");
let lineButton = document.querySelector("#line");
lineButton.addEventListener("click", () => {
    console.log("line button");
    shapeText.innerHTML = "line";
    circle = false;
    line = true;
});

let circleButton = document.querySelector("#circle");
circleButton.addEventListener("click", () => {
    console.log("circle button");
    shapeText.innerHTML = "circle";
    circle = true;
    line = false;
});

let circleOutlineButton = document.querySelector("#circle-outline");
circleOutlineButton.addEventListener("click", () => {
    console.log("circle outline button");
    circle = true;
    line = false;
    if (circleOutline) {
        circleOutlineButton.style.border = "none";
    } else {
        circleOutlineButton.style.border = "1px solid black";
    }
    circleOutline = !circleOutline;
});

let doneButton = document.getElementsByClassName("done-button");

let canvas;
const loadCanvas = () => {
    console.log("load canvas");
    canvas = document.getElementsByTagName("canvas");
    console.log("canvas", canvas);
    console.log("canvas[0]", canvas[0]);
    console.log("canvas offsetLeft: ", canvas[0].offsetLeft);

    //Exquisite Corps logic:

    if (ec) {
        console.log("ec?: ", ec);
        ec = coverTop.style.left = canvas[0].offsetLeft;
        coverTop.style.top = canvas[0].offsetTop;
        coverBottom.style.left = canvas[0].offsetLeft;
        coverBottom.style.bottom = canvas[0].offsetTop;
    }
};
window.onload = loadCanvas;
window.addEventListener("resize", loadCanvas);

let invite = false;
function showInvite() {
    console.log("showInvite is triggered");
    invite = !invite;
    if (invite) {
        inviteField[0].style.visibility = "visible";
    } else {
        inviteField[0].style.visibility = "hidden";
    }
}

if (!ec) {
    inviteButton[0].style.visibility = "visible";
}
inviteButton[0].addEventListener("click", showInvite);

function copy() {
    copyText.select();
    document.execCommand("copy");
}
document.querySelector("#copy").addEventListener("click", copy);

colorButton.forEach((element) => {
    element.addEventListener("click", function (event) {
        console.log("click", event.target.id);
        strokeColor = event.target.id;
        if (event.target.id == "white") {
            colorText.style.color = "black";
            colorText.innerHTML = "white";
        } else {
            colorText.style.color = event.target.id;
            colorText.innerHTML = event.target.id;
        }
    });
});

let newUsers = [];

function userJoined(data) {
    console.log(data.roomsize);

    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;
    newUsers.push(data.id);

    // set canvas covers, the first user has the longest array
    if (ec && data.roomsize > 2 && newUsers.length == 1) {
        console.log("too many users joined");
        window.location.replace("/");
    }
    if (ec) {
        if (newUsers.length === 2) {
            console.log("newUsers before: ", newUsers);
            coverTop.style.visibility = "hidden";
            coverBottom.style.visibility = "visible";
            doneButton[0].style.visibility = "visible";
            doneButton[1].style.visibility = "hidden";
        }
        if (newUsers.length <= 1) {
            console.log("newUsers before: ", newUsers);
            coverTop.style.visibility = "visible";
            coverBottom.style.visibility = "hidden";
            doneButton[1].style.visibility = "visible";
            doneButton[0].style.visibility = "hidden";
            if (data.roomsize === 1) {
                inviteButton[0].style.visibility = "visible";
            }
        }
    }
    console.log("userjoined triggered in client, ", newUsers);
    if (newUsers.length > 1) {
        newUser.insertAdjacentHTML(
            "beforeend",
            '<div id="new-user">New user joined</div>'
        );
        setTimeout(() => {
            newUser.removeChild(newUser.lastChild);
        }, 3000);
    }
}

let waiting = false;
let userNameArray;
function namedUserJoined(data) {
    console.log("named User joined: ", data);
    console.log("waiting modal: ", waitingModal);
    console.log("user name: ", userName);
    let playerOne = document.querySelector("#player1");
    let playerTwo = document.querySelector("#player2");
    //if roomSize = 1 show waiting for other user screeen
    if (data.name.length == 1 && data.name[0].startsWith(userName)) {
        modal.style.visibility = "hidden";
        waitingModal.style.visibility = "visible";
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "hidden";
        buttons[0].style.visibility = "hidden";
        waiting = true;
    }
    //if roomSize =2 start doodle
    if (data.name.length == 2) {
        userNameArray = data.name;
        console.log("modal: ", modal);

        coverTop.style.visibility = "hidden";
        modal.style.visibility = "hidden";
        waitingModal.style.visibility = "hidden";
        playerOne.innerHTML = data.name[0];
        playerTwo.innerHTML = data.name[1];
        inviteButton[0].style.visibility = "hidden";
        buttons[0].style.visibility = "visible";
        inviteField[0].style.visibility = "hidden";
        clearCanvas();
        waiting = false;
    }
}

function userLeft(data) {
    console.log("user left triggered in client");
    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;
    newUser.insertAdjacentHTML(
        "beforeend",
        '<div id="new-user">User left the doodle</div>'
    );
    setTimeout(() => {
        newUser.removeChild(newUser.lastChild);
    }, 3000);
}

let strokeColor = "black";
let sW = 2;
let dotsArray;
let newDotsArray;
let circleWidth = 50;
circleOutline = false;

let linewidthButton = document.querySelector("#line-width-container");
let lineWidth = document.querySelector("#line-width");
linewidthButton.addEventListener("click", function (event) {
    console.log("lineWidthButton");
    if (sW < 11) {
        sW++;
        lineWidth.style.width = `${sW}px`;
        console.log("width: ", event.target.style.width);
    } else {
        sW = 1;
        lineWidth.style.width = `${sW}px`;
    }
});

circleWidthButton.addEventListener("click", function (event) {
    if (circleWidth < 50) {
        circleWidth += 10;
        event.target.style.width = `${circleWidth}px`;
        event.target.style.height = `${circleWidth}px`;
        console.log("width: ", event.target.style.width);
    } else {
        circleWidth = 10;
        event.target.style.width = `${circleWidth}px`;
        event.target.style.height = `${circleWidth}px`;
    }
});

function setup() {
    createCanvas(600, 600);

    noFill();
    dotsArray = [];
    newDotsArray = [];

    socket = io.connect(`${location.protocol}//${location.host}`);
    socket.on("mouse", newDoodle);
    socket.on("mouseoff", otherMouseReleased);
    socket.on("userJoined", userJoined);
    socket.on("userLeft", userLeft);
    socket.on("userDone", userDone);
    socket.on("clearCanvas", clearCanvas);
    socket.on("namedUsers", namedUserJoined);
}

function newDoodle(data) {
    console.log("data type: ", data.type);
    if (data.type == "line") {
        stroke(data.strokeColor);
        strokeWeight(data.strokeWeight);
        noFill();
        beginShape();

        newDotsArray.forEach((element) => {
            curveVertex(element.x, element.y);
        });

        let newDot = {};
        newDot.x = data.x;
        newDot.y = data.y;

        newDotsArray.push(newDot);
        endShape();
    } else if (data.type == "circle") {
        beginShape();
        fill(data.strokeColor);
        if (data.circleOutline) {
            strokeWeight(data.strokeWeight);
            stroke("black");
            ellipse(data.x, data.y, data.circleWidth, data.circleWidth);
            endShape();
        } else {
            console.log("new doodle stroke black: ", data.strokeColor);
            stroke(data.strokeColor);
            ellipse(data.x, data.y, data.circleWidth, data.circleWidth);
            endShape();
        }
    }
}

let lineArray = [];

function draw() {
    if (waiting) {
        inviteButton[0].style.visibility = "hidden";
        strokeWeight(10);
        stroke("black");

        beginShape();
        lineArray.forEach((dot) => {
            curveVertex(dot.x, dot.y);
        });

        let randomDot = {
            x: Math.floor(random(width)),
            y: Math.floor(random(height)),
        };

        lineArray.push(randomDot);
        endShape();

        frameRate(10);
        console.log("line array: ", lineArray);
    }
}

let drawing = true;
let circle = false;
let line = true;

function mouseDragged() {
    if (line) {
        drawLine();
    } else if (circle) {
        drawCircle();
    }
}

function mouseReleased() {
    dotsArray = [];
    data = {
        mouseoff: true,
    };
    socket.emit("mouseoff", data);
}

function otherMouseReleased(data) {
    console.log("otherMouseReleased");
    if (data.mouseoff == true) {
        newDotsArray = [];
    }
}

let doneButtonActive = true;
doneButton.forEach((element) => {
    element.addEventListener("click", clickDoneButton);
});

function clickDoneButton(e) {
    console.log("done button clicked");
    e.target.style["background-color"] = "red";
    if (doneButtonActive) {
        socket.emit("done", "pressed done");
    }
    doneButtonActive = false;
}

let doneArray = [];
let afterDrawButtons = document.querySelector("#after-draw-buttons");
function userDone(data) {
    doneArray.push(data);
    console.log("userDone in client: ", doneArray);
    if (doneArray.length === 2) {
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "hidden";
        afterDrawButtons.style.visibility = "visible";
    }
}
if (ec) {
    redoButton.addEventListener("click", function () {
        console.log("redoButton triggered");
        socket.emit("clear", "clear canvas");
    });
}

function clearCanvas() {
    console.log("clear canvas in client");
    clear();
    afterDrawButtons.style.visibility = "hidden";
    doneArray = [];
    if (newUsers.length === 2) {
        console.log("newUsers before: ", newUsers);
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "visible";
        doneButton[0].style.visibility = "visible";
        doneButton[1].style.visibility = "hidden";
    }
    if (newUsers.length <= 1) {
        console.log("newUsers before: ", newUsers);
        coverTop.style.visibility = "visible";
        coverBottom.style.visibility = "hidden";
        doneButton[1].style.visibility = "visible";
        doneButton[0].style.visibility = "hidden";
    }
    doneButton.forEach((element) => {
        element.style["background-color"] = "burlywood";
    });
    doneButtonActive = true;
    drawing = true;
}

function drawLine() {
    if (ec && newUsers.length == 2) {
        if (mouseY < 310) {
            drawing = true;
        } else {
            drawing = false;
        }
    } else if (ec && newUsers.length == 1) {
        if (mouseY > 290) {
            drawing = true;
        } else {
            drawing = false;
        }
    } else {
        drawing = true;
    }

    console.log("distance: ", 300 + canvas[0].offsetTop);

    if (drawing) {
        let data;

        console.log("we're in the else statement");
        data = {
            x: mouseX,
            y: mouseY,
            strokeColor: strokeColor,
            strokeWeight: sW,
            type: "line",
        };

        socket.emit("mouse", data);
        noFill();
        strokeWeight(sW);
        stroke(strokeColor);
        beginShape();

        dotsArray.forEach((element) => {
            curveVertex(element.x, element.y);
        });

        let dot = {};
        dot.x = mouseX;
        dot.y = mouseY;

        dotsArray.push(dot);
        endShape();
    } else {
        console.log("we're not drawing");
        return;
    }
}

function drawCircle() {
    if (ec && newUsers.length == 2) {
        if (mouseY < 310) {
            drawing = true;
        } else {
            drawing = false;
        }
    } else if (ec && newUsers.length == 1) {
        if (mouseY > 290) {
            drawing = true;
        } else {
            drawing = false;
        }
    } else {
        drawing = true;
    }

    console.log("distance: ", 300 + canvas[0].offsetTop);

    if (drawing) {
        let data;

        console.log("we're in the else statement");
        data = {
            x: mouseX,
            y: mouseY,
            strokeColor: strokeColor,
            circleWidth: circleWidth,
            circleOutline: circleOutline,
            strokeColor: strokeColor,
            strokeWeight: sW,
            type: "circle",
        };

        socket.emit("mouse", data);
        beginShape();

        console.log("circleWidth: ", circleWidth);
        let circle = {};
        circle.x = mouseX;
        circle.y = mouseY;

        fill(strokeColor);
        console.log("stroke: ", stroke);
        if (circleOutline) {
            stroke("black");
            strokeWeight(sW);
        } else {
            stroke(strokeColor);
        }
        ellipse(mouseX, mouseY, circleWidth, circleWidth);

        endShape();
    } else {
        console.log("we're not drawing");
        return;
    }
}
