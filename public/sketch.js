let colorButton = document.getElementsByClassName("color-button");

console.log("button: ", colorButton);

let color = "white";

colorButton.forEach((element) => {
    element.addEventListener("click", function (event) {
        console.log("click", event.target.id);
        color = event.target.id;
    });
});

function setup() {
    createCanvas(600, 400);
    background(51);

    socket = io.connect("http://localhost:3000");
    socket.on("mouse", newDoodle);
}

function newDoodle(data) {
    noStroke();
    fill(color);
    ellipse(data.x, data.y, 36, 36);
}

function draw() {
    let data = {
        x: mouseX,
        y: mouseY,
    };
    socket.emit("mouse", data);
    noStroke();
    fill(color);
    ellipse(mouseX, mouseY, 36, 36);
}
