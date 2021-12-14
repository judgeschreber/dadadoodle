let colorButton = document.getElementsByClassName("color-button");
let lineButton = document.getElementsByClassName("line-button");
let inviteButton = document.getElementsByClassName("invite-button");
let inviteField = document.getElementsByClassName("invite-field");
let copyText = document.querySelector("#input");
let newUser = document.querySelector("#users");
let numberOfDoodlers = document.querySelector("#number-of-doodlers");
let coverTop = document.querySelector("#cover-top");
let coverBottom = document.querySelector("#cover-bottom");

let doneButton = document.getElementsByClassName("done-button");

let ec = false;
const parsedUrl = new URL(window.location.href);
console.log(parsedUrl);
if (parsedUrl.pathname.startsWith("/ec")) {
    ec = true;
}

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
    });
});

let newUsers = [];
function userJoined(data) {
    console.log(data.roomsize);

    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;
    newUsers.push(data.id);

    // set canvas covers, the first user has the longest array
    if (newUsers.length === 2) {
        console.log("newUsers before: ", newUsers);
        coverTop.style.visibility = "hidden";
        coverBottom.style.visibility = "visible";
    }
    if (newUsers.length <= 1) {
        console.log("newUsers before: ", newUsers);
        coverTop.style.visibility = "visible";
        coverBottom.style.visibility = "hidden";
    }

    console.log("userjoined triggered in client, ", newUsers);
    if (newUsers.length > 1) {
        newUser.insertAdjacentHTML(
            "beforeend",
            '<div id="new-user">New user joined</div>'
        );
    }
}

function userLeft(data) {
    console.log("user left triggered in client");
    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;
    newUser.insertAdjacentHTML(
        "beforeend",
        '<div id="new-user">User left the doodle</div>'
    );
}

let strokeColor = "black";
let sW = 2;
let dotsArray;
let newDotsArray;

console.log("lineButton: ", lineButton);
lineButton[0].addEventListener("click", function (event) {
    if (sW < 11) {
        sW++;
        event.target.style.width = `${sW}px`;
        console.log("width: ", event.target.style.width);
    } else {
        sW = 1;
    }
});

function setup() {
    createCanvas(600, 600);

    noFill();
    dotsArray = [];
    newDotsArray = [];

    socket = io.connect("http://localhost:3000");
    socket.on("mouse", newDoodle);
    socket.on("mouseoff", otherMouseReleased);
    socket.on("userJoined", userJoined);
    socket.on("userLeft", userLeft);
}

function newDoodle(data) {
    stroke(data.strokeColor);
    strokeWeight(data.strokeWeight);
    beginShape();

    newDotsArray.forEach((element) => {
        curveVertex(element.x, element.y);
    });

    var dot = {};
    dot.x = data.x;
    dot.y = data.y;

    newDotsArray.push(dot);
    endShape();
}

function draw() {}

let drawing = true;

function mouseDragged() {
    if (drawing) {
        console.log("points before: ", dotsArray);

        let data;
        if (ec && newUsers.length == 2) {
            console.log("we're in the first conditional, height: ", height);
            if (mouseY < 300 - canvas[0].offsetTop) {
                data = {
                    x: mouseX,
                    y: mouseY,
                    strokeColor: strokeColor,
                    strokeWeight: sW,
                };
            }
        } else if (ec && newUsers.length == 1) {
            console.log("we're in the second conditional");
            if (mouseY > 300 - canvas[0].offsetTop) {
                data = {
                    x: mouseX,
                    y: mouseY,
                    strokeColor: strokeColor,
                    strokeWeight: sW,
                };
            }
        } else {
            console.log("we're in the else statement");
            data = {
                x: mouseX,
                y: mouseY,
                strokeColor: strokeColor,
                strokeWeight: sW,
            };
        }

        socket.emit("mouse", data);

        strokeWeight(sW);
        stroke(strokeColor);
        beginShape();

        dotsArray.forEach((element) => {
            curveVertex(element.x, element.y);
        });

        var dot = {};
        dot.x = mouseX;
        dot.y = mouseY;

        dotsArray.push(dot);
        endShape();
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

console.log("done button: ", doneButton);
doneButton.forEach((element) => {
    element.addEventListener(
        "click",
        (e) => {
            console.log("done button clicked");
            e.target.style["background-color"] = "red";
            drawing = false;
        },
        { once: true }
    );
});
