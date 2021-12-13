let colorButton = document.getElementsByClassName("color-button");
let lineButton = document.getElementsByClassName("line-button");
let inviteButton = document.getElementsByClassName("invite-button");
let inviteField = document.getElementsByClassName("invite-field");
let copyText = document.querySelector("#input");
let newUser = document.querySelector("#users");
let numberOfDoodlers = document.querySelector("#number-of-doodlers");

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
    createCanvas(600, 400);

    noFill();
    dotsArray = [];
    newDotsArray = [];

    socket = io.connect("http://localhost:3000");
    socket.on("mouse", newDoodle);
    socket.on("mouseoff", otherMouseReleased);
    socket.on("userJoined", userJoined);
}
let newUsers = [];
function userJoined(data) {
    console.log("userjoined triggered in client, ", data);
    console.log(data.roomsize);

    numberOfDoodlers.innerHTML = `Number of Doodlers: ${data.roomsize}`;
    newUsers.push(data.id);
    console.log("userarray: ", newUsers);
    if (newUsers.length > 1) {
        newUser.insertAdjacentHTML(
            "beforeend",
            '<div id="new-user">New user joined</div>'
        );
    }
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

let circles = false;

function mouseDragged() {
    console.log("points before: ", dotsArray);

    console.log("mouse drag!");
    let data = {
        x: mouseX,
        y: mouseY,
        strokeColor: strokeColor,
        strokeWeight: sW,
    };
    socket.emit("mouse", data);

    if (circles) {
        //draw circles
    }

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

function mouseReleased() {
    dotsArray = [];
    let data = {
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
