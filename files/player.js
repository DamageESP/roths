var initialSize = 80;
var targetSpeed;
var birdSize = {
	x: 40,
	y: 28
}

function Player(id, username, colour, pos, health) {
	this.id = id
	this.username = username
	this.colour = colour // contains r, g, b
	this.pos = createVector(pos.x, pos.y)
	this.speed = createVector(0, 0)
	this.health = health
	this.display = function() {
		var clr = color(this.colour.r, this.colour.g, this.colour.b);
		fill(clr);
		push();
		// ellipse(this.pos.x, this.pos.y, initialSize, initialSize);
		translate(this.pos.x, this.pos.y);
		var mousePos = createVector(mouseX, mouseY);
		var heading = mousePos.sub(this.pos).heading();
		var x = createVector(this.pos.x, this.pos.y);
		rotate(heading, x);
		image(bird, - birdSize.x/2, - birdSize.y/2, birdSize.x, birdSize.y);
		pop();
		textAlign(CENTER);
		text(this.username+' ('+this.health+')', this.pos.x, this.pos.y - birdSize.y/1.5);
		fill(0);
	}
	this.say = function(msg) {
		if(msg.length > 0) {
			socket.emit('say', msg);
		}
	}
	this.move = function(dir) {
		targetSpeed = createVector(0, 0);
		if(dir==='up') {
			targetSpeed.add(createVector(0, -5));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			this.pos = pos;
		}
		if(dir==='down') {
			targetSpeed.add(createVector(0, 5));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			this.pos = pos;
		}
		if(dir==='left') {
			targetSpeed.add(createVector(-5, 0));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			this.pos = pos;
		}
		if(dir==='right') {
			targetSpeed.add(createVector(5, 0));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			this.pos = pos;
		}
		if(!dir) {
			targetSpeed.add(createVector(0, 0));
			this.speed.lerp(targetSpeed, .05);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			this.pos = pos;
		}
	}
	this.shoot = function() {
		var thisPos = createVector(this.pos.x + (birdSize.x / 2), this.pos.y);
		var mousePos = createVector(mouseX, mouseY);
		var heading = mousePos.sub(thisPos).heading();
		var newBullet = new Bullet({userID: this.id, pos: this.pos, heading: p5.Vector.fromAngle(heading)});
		socket.emit('add bullet', {
			userID: newBullet.userID,
			id: newBullet.id,
			pos: {
				x: newBullet.pos.x,
				y: newBullet.pos.y
			},
			decay: 0,
			strength: newBullet.strength,
			heading: {
				x: newBullet.heading.x,
				y: newBullet.heading.y
			}
		});
	}
	this.update = function() {
		socket.emit('player update', {
			id: this.id,
			username: this.username,
			colour: this.colour,
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			health: this.health
		});
	}
}