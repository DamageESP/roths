var canvas;
var lastDrawn;
var ellipses = [];
var ellipseSize = 80;
var totalEllipses = 0;
var x = 0;
var r, g, b;
	function setup() {
		canvas = createCanvas(500, 500);
		background(200);
	}

	function draw() {
		if (mouseX < (canvas.width) && 0 < mouseX && mouseY < (canvas.height) && (0) < mouseY && mouseIsPressed && mouseButton == LEFT) {
			r=random(255);
			g=random(255);
			b=random(255);
			fill(r, g, b, 90);
			stroke(0, 90);
			lastDrawn = ellipse(mouseX, mouseY, ellipseSize, ellipseSize);
			ellipses.push(lastDrawn);
			totalEllipses += 1;
			document.getElementById("totalEllipses").innerHTML = "Total ellipses numeric: " + totalEllipses + "<br>Total ellipses objects: " + ellipses.length;
			//console.log(lastDrawn);
		}	
	}

	function mouseClicked() {
		if(mouseX < (canvas.width) && (0) < mouseX && mouseY < (canvas.height) && (0) < mouseY && mouseButton == LEFT) {
			fill(0, 98);
			lastDrawn = ellipse(mouseX, mouseY, ellipseSize, ellipseSize);
			ellipses.push(lastDrawn);
			totalEllipses += 1;
			document.getElementById("totalEllipses").innerHTML = "Total ellipses numeric: " + totalEllipses + "<br>Total ellipses objects: " + ellipses.length;
		}

		//console.log(lastDrawn);
	}

var reset = document.getElementById("reset");
reset.addEventListener("click", function() {
		background(200);
		totalEllipses = 0;
		ellipses = [];
		document.getElementById("totalEllipses").innerHTML = "Total ellipses numeric: " + totalEllipses + "<br>Total ellipses objects: " + ellipses.length;
	});