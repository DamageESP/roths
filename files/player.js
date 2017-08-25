var birdSize = {
	x: 40,
	y: 28
}

function Player(data) {
	this.id = data.id
	this.username = data.username
	this.colour = data.colour // contains r, g, b
	this.pos = createVector(data.pos.x, data.pos.y)
	this.speed = createVector(0, 0)
	this.health = data.health
	this.kills = data.kills
	this.display = function() {
		var clr = color(this.colour.r, this.colour.g, this.colour.b);
		fill(clr);
		push();
		// ellipse(this.pos.x, this.pos.y, initialSize, initialSize);
		translate(this.pos.x, this.pos.y);
		var mousePos = createVector(mouseX, mouseY);
		var heading = mousePos.sub(this.pos).heading();
		rotate(heading, this.pos);
		var scaled = createVector(windowWidth / view.x, windowHeight / view.y)
		scale(scaled)
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
		var targetSpeed = createVector(0, 0);
		if(dir==='up') {
			targetSpeed.add(createVector(0, -15));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			if (playArea.x[0] < pos.x < playArea.x[1] && playArea.y[0] < pos.y < playArea.y[1]) this.pos = pos
		}
		if(dir==='down') {
			targetSpeed.add(createVector(0, 15));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			if (playArea.x[0] < pos.x < playArea.x[1] && playArea.y[0] < pos.y < playArea.y[1]) this.pos = pos
		}
		if(dir==='left') {
			targetSpeed.add(createVector(-15, 0));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			if (playArea.x[0] < pos.x < playArea.x[1] && playArea.y[0] < pos.y < playArea.y[1]) this.pos = pos
		}
		if(dir==='right') {
			targetSpeed.add(createVector(15, 0));
			this.speed.lerp(targetSpeed, .02);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			if (playArea.x[0] < pos.x < playArea.x[1] && playArea.y[0] < pos.y < playArea.y[1]) this.pos = pos
		}
		if(!dir) {
			targetSpeed.add(createVector(0, 0));
			this.speed.lerp(targetSpeed, .05);
			var pos = createVector(this.pos.x, this.pos.y);
			pos.add(this.speed);
			if (playArea.x[0] < pos.x < playArea.x[1] && playArea.y[0] < pos.y < playArea.y[1]) this.pos = pos
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