var r, g, b;
var windowX = window.innerWidth;
var windowY = window.innerHeight - 25;
function setup() {
	frameRate(10);
	createCanvas(windowX, windowY);
}
function draw() {
	newEllipse();
	background(255, 80);
}

function newEllipse() {
	var randomX = random(40, windowX-40);
	var randomY = random(40, windowY-40);
	var randomSize = random(20, 80);
	r = random(0, 255);
	g = random(0, 255);
	b = random(0, 255);
	noStroke();
	fill(r, g, b);
	ellipse(randomX, randomY, randomSize, randomSize);
}