var pos;
var speed;

function setup() {
	frameRate(60);
	createCanvas(500, 500);
	pos = createVector(50, 50);
	speed = createVector(3, 3);
}

function draw() {
	background(200);
	var move = ellipse(pos.x, pos.y, 80, 80);
	pos.add(speed);
	speed.lerp(0, 0, 0, .02);
}

function deccelerate() {
	speed *= 1.01;
}