function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function Bullet(data) {
	this.userID = data.userID
	this.id = data.id || guid()
	this.pos = createVector(data.pos.x, data.pos.y)
	this.heading = createVector(data.heading.x, data.heading.y)
	this.heading.mult(data.range || 16)
	this.decay = 0
	this.strength = 40
	this.out = false
	this.display = function() {
		if(this.pos.x > playArea.x[1] || this.pos.x < playArea.x[0] || this.pos.y < playArea.y[0] || this.pos.y > playArea.y[1]) {
			this.out = true
		} else {
			push()
			strokeWeight(5)
			point(this.pos.x, this.pos.y)
			pop()
		}
	}
	this.update = function() {
		socket.emit('bullet update', {
			userID: this.userID,
			id: this.id,
			heading: {
				x: this.heading.x,
				y: this.heading.y
			},
			decay: this.decay,
			strength: this.strength,
			pos: {
				x: this.pos.x,
				y: this.pos.y
			}
		});
	}
}