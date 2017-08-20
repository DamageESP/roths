var canvas;
var ellipseWidth = 80;
var ellipseHeight = 80;
var x = ellipseWidth/2;
var y = ellipseHeight/2;
var score = 0;
var maxScore = 0;
var deaths = 0;
var r, g, b;
var randomness;
function setup() {
	frameRate(65);
	background(200);
	canvas = createCanvas(500, 500);
}
function draw() {
	randomGame();
}
function randomGame() {
	randomness = Number(document.getElementById("randomness").value);
	ellipseWidth = Number(document.getElementById("ellipseSize").value);
	ellipseHeight = Number(document.getElementById("ellipseSize").value);
	if(score > maxScore)
	{
		maxScore = score;
		document.getElementById("maxScore").innerHTML = maxScore;
	}
	r=random(0,255);
	g=random(0,255);
	b=random(0,255);
	fill(r,g,b, 50);
	stroke(r,g,b, 90);
	x += random(-randomness, randomness);
	y += random(-randomness, randomness);
	//background(200);
	if (x > (canvas.width-ellipseWidth/2) || ellipseWidth/2 > x || y > (canvas.height-ellipseHeight/2) || ellipseHeight/2 > y) {
		fill(r,g,b);
		ellipse(x, y, ellipseWidth, ellipseHeight);
		score = 0;
		deaths += 1;
		document.getElementById("deaths").innerHTML = deaths;
		background('#f0f0f0');
		x = random(40, 460);
		y = random(40, 460);
	}
	ellipse(x, y, ellipseWidth, ellipseHeight);
	background(255, 10);
	score += 1;
	document.getElementById("score").innerHTML = score;
}