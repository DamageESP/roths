var blobs = [];
var windowX = window.innerWidth;
var windowY = window.innerHeight - 4;
var bgColor;
var maxBlobs = 30;
function setup() {
	frameRate(60);
	createCanvas(windowX, windowY);
	bgColor = color("#f0f0f0");
}

function draw() {
	background(bgColor);
	for(var i=blobs.length-1; i>0; i--) {
		if(blobs[i].spawnTime <= 0) {
			blobs[i].display();
			blobs[i].fade(bgColor.levels[0], bgColor.levels[1], bgColor.levels[2]);
		} else {
			blobs[i].passTime();
		}
		if (blobs[i].faded) {
			blobs.splice(i, 1);
		}
	}
	if(blobs.length < maxBlobs) {
		var blob = new Blob();
		blobs.push(blob);
	}
}

function Blob() {
	var r = random(0, 255);
	var g = random(0, 255);
	var b = random(0, 255);
	this.colorA = color(r, g, b);
	this.size = random(20, 100);
	this.randomX = random(this.size/2, windowX-this.size/2);
	this.randomY = random(this.size/2, windowY-this.size/2);
	this.actualColor = this.colorA;
	this.faded = false;
	this.spawnTime = random(40, 240);
	this.lerpLevel = .01;

	this.fade = function(r, g, b) {
		this.actualColor = lerpColor(this.actualColor, color(r, g, b), this.lerpLevel);
		if(Math.abs(r-this.actualColor.levels[0]) == 0 && Math.abs(g-this.actualColor.levels[1]) == 0 && Math.abs(b-this.actualColor.levels[2]) == 0) {
			this.faded = true;
		}
		this.lerpLevel *= 1.03;
	}

	this.display = function() {
		fill(this.actualColor);
		noStroke();
		ellipse(this.randomX, this.randomY, this.size, this.size);
	}

	this.passTime = function() {
		this.spawnTime -= 1;
	}
}