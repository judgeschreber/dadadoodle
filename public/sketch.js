let colorButton = document.getElementsByClassName("color-button");
let lineButton = document.getElementsByClassName("line-button");

console.log("button: ", colorButton);

let strokeColor = "black";
let sW = 2;
let dotsArray;
let newDotsArray;

colorButton.forEach((element) => {
    element.addEventListener("click", function (event) {
        console.log("click", event.target.id);
        strokeColor = event.target.id;
    });
});

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
}

function newDoodle(data) {
    stroke(data.strokeColor);
    strokeWeight(data.strokeWeight);
    beginShape();

    // declare the points as an array

    newDotsArray.forEach((element) => {
        curveVertex(element.x, element.y);
    });

    // create an object as empty point
    var dot = {};
    dot.x = data.x;
    dot.y = data.y;

    // add the point to the array
    newDotsArray.push(dot);
    endShape();
}

function draw() {}

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
    strokeWeight(sW);
    stroke(strokeColor);
    beginShape();

    // declare the points as an array

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
