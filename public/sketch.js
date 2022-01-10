let ec = false;
const parsedUrl = new URL(window.location.href);
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

let hPatternButton = document.querySelector("#horizonal-pattern-button");
hPatternButton.addEventListener("click", () => {
    lineVar = false;
    circle = false;
    verticalLines = false;
    horizontalLines = true;
});

let vPatternButton = document.querySelector("#vertical-pattern-button");
vPatternButton.addEventListener("click", () => {
    lineVar = false;
    circle = false;
    horizontalLines = false;
    verticalLines = true;
});

//Modal logic
let modal = document.querySelector("#show-modal");
let modalStartButton = document.querySelector("#modal-start-button");
let waitingModal = document.querySelector("#waiting");

let userName;
if (ec) {
    modalStartButton.addEventListener("click", () => {
        userName = document.querySelector("#name-field").value;
        socket.emit("emitUserName", userName);
    });
}

let shapeText = document.querySelector("#shape-text");
let lineButton = document.querySelector("#line");
lineButton.addEventListener("click", () => {
    shapeText.innerHTML = "line";
    circle = false;
    lineVar = true;
});

let crazyCircle = false;
let circleButton = document.querySelector("#circle");
circleButton.addEventListener("click", () => {
    if (!crazyCircle) {
        shapeText.innerHTML = "circle";
    }
    circle = true;
    lineVar = false;
});

let circleOutlineButton = document.querySelector("#circle-outline");
circleOutlineButton.addEventListener("click", () => {
    circle = true;
    lineVar = false;
    if (circleOutline) {
        circleOutlineButton.style.border = "none";
        shapeText.innerHTML = "circle";
        crazyCircle = false;
    } else {
        circleOutlineButton.style.border = "1px solid black";
        shapeText.innerHTML = "crazy circle";
        crazyCircle = true;
    }
    circleOutline = !circleOutline;
});

let doneButton = document.getElementsByClassName("done-button");

let canvas;
const loadCanvas = () => {
    canvas = document.getElementsByTagName("canvas");
    //Exquisite Corps logic:
    if (ec) {
        console.log("ec?: ", ec);
        coverTop.style.left = canvas[0].offsetLeft;
        coverTop.style.top = canvas[0].offsetTop;
        coverTop.style.width = width;
        coverBottom.style.left = canvas[0].offsetLeft;
        coverBottom.style.bottom = canvas[0].offsetTop;
        coverBottom.style.width = width;
    }
};
window.onload = loadCanvas;
window.addEventListener("resize", loadCanvas);

let invite = false;
function showInvite() {
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

if (!ec) {
    redoButton.style.visibility = "hidden";
}

function userJoined(data) {
    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;

    newUsers.push(data.id);
    if (data.roomsize == newUsers.length) {
        redoButton.style.visibility = "visible";
    }

    // set canvas covers, the first user has the longest array

    if (ec && data.roomsize === 1) {
        inviteButton[0].style.visibility = "visible";
    }
    if (ec && data.roomsize > 2 && newUsers.length == 1) {
        window.location.replace("/");
    }
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

function roomFull(data) {
    if (newUsers.length < 1) {
        window.location.replace("/");
    }
}

let waiting = false;
let userNameArray;
function namedUserJoined(data) {
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
        coverTop.style.visibility = "hidden";
        coverTop.style.visibility = "visible";
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
    if (sW < 11) {
        sW++;
        lineWidth.style.width = `${sW}px`;
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
    } else {
        circleWidth = 10;
        event.target.style.width = `${circleWidth}px`;
        event.target.style.height = `${circleWidth}px`;
    }
});

function setup() {
    if (window.innerWidth < 500) {
        createCanvas(380, 480);
    }
    createCanvas(windowWidth * 0.5, windowHeight * 0.8);

    background("white");
    noFill();
    dotsArray = [];
    newDotsArray = [];

    socket = io.connect(`${location.protocol}//${location.host}`);
    socket.on("setRoom", newDoodle);
    socket.on("mouse", newDoodle);
    socket.on("mouseoff", otherMouseReleased);
    socket.on("userJoined", userJoined);
    socket.on("userLeft", userLeft);
    socket.on("userDone", userDone);
    socket.on("clearCanvas", clearCanvas);
    socket.on("clearFree", clearFree);
    socket.on("namedUsers", namedUserJoined);
    socket.on("roomFull", roomFull);
}

//Doodle emitted by socket
function newDoodle(data) {
    if (data.type == "line") {
        stroke(data.strokeColor);
        strokeWeight(data.strokeWeight);
        noFill();
        beginShape();

        newDotsArray.forEach((element) => {
            curveVertex(element.x, element.y);
        });

        let newDot = {};
        //Attempting to adjust ratio of different canvases
        newDot.x = width / (data.otherWidth / data.x);
        newDot.y = height / (data.otherHeight / data.y);
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

//Waiting animation
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
    }
}

let drawing = true;
let circle = false;
let lineVar = true;
let horizontalLines = false;

function touchMoved() {
    if (lineVar) {
        drawLine();
    } else if (circle) {
        drawCircle();
    } else if (horizontalLines) {
        drawHorizontalLines();
    } else if (verticalLines) {
        drawVerticalLines();
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
    if (data.mouseoff == true) {
        newDotsArray = [];
    }
}

let doneButtonActive = true;
//done button event listener
doneButton.forEach((element) => {
    element.addEventListener("click", clickDoneButton);
});

function clickDoneButton(e) {
    e.target.style["background-color"] = "red";
    if (doneButtonActive) {
        socket.emit("done", "pressed done");
    }
    doneButtonActive = false;
}

let doneArray = [];
let afterDrawButtons = document.querySelector("#after-draw-buttons");
//useDone emitted from socket
function userDone(data) {
    //both users have to click done for something to happen
    doneArray.push(data);
    if (doneArray.length === 2) {
        //show canvas
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "hidden";
        afterDrawButtons.style.visibility = "visible";
    }
}

redoButton.addEventListener("click", function () {
    if (ec) {
        socket.emit("clear", "clear canvas");
    } else {
        socket.emit("clearFree", "clear canvas");
    }
});

function clearFree() {
    clear();
}

function clearCanvas() {
    clear();
    afterDrawButtons.style.visibility = "hidden";
    doneArray = [];
    if (newUsers.length === 2) {
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "visible";
        doneButton[0].style.visibility = "visible";
        doneButton[1].style.visibility = "hidden";
    }
    if (newUsers.length <= 1) {
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
    setDrawing();

    if (drawing) {
        let data;

        data = {
            x: mouseX,
            y: mouseY,
            strokeColor: strokeColor,
            strokeWeight: sW,
            type: "line",
            otherWidth: width,
            otherHeight: height,
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
        return;
    }
}

function drawCircle() {
    setDrawing();

    if (drawing) {
        let data;

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

        let circle = {};
        circle.x = mouseX;
        circle.y = mouseY;

        fill(strokeColor);
        if (circleOutline) {
            stroke("black");
            strokeWeight(sW);
        } else {
            stroke(strokeColor);
        }
        ellipse(mouseX, mouseY, circleWidth, circleWidth);

        endShape();
    } else {
        return;
    }
}

function drawHorizontalLines() {
    setDrawing();
    console.log("draw horizontal");
    setTimeout(() => {
        beginShape();

        line(mouseX - 10, mouseY, mouseX + 10, mouseY);

        stroke(strokeColor);
        endShape();
    }, 100);
}

function drawVerticalLines() {
    setDrawing();
    console.log("draw Vertical");
    setTimeout(() => {
        beginShape();

        line(mouseX, mouseY - 10, mouseX, mouseY + 10);

        stroke(strokeColor);
        endShape();
    }, 100);
}

function setDrawing() {
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
}
