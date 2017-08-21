function Bullet(userID, pos, heading) {
	this.userID = userID
	this.pos = createVector(pos.x, pos.y)
	this.heading = createVector(heading.x, heading.y)
	this.heading.mult(4)
	this.decay = 0
	this.strength = 40
	this.out = false
	this.display = function() {
		push()
		strokeWeight(5)
		point(this.pos.x, this.pos.y)
		pop()
	}
	this.fly = function() {
		if(this.pos.x > width || this.pos.x < 0 || this.pos.y < 0 || this.pos.y > height) {
			this.out = true
		} else {
			this.decay += .003
			this.heading.y += this.decay
			this.pos.add(this.heading)
		}
	}
	this.update = function() {
		socket.emit('bullet update', {
			userID: this.userID,
			heading: {
				x: this.heading.x,
				y: this.heading.y
			},
			decay: this.decay,
			pos: {
				x: this.pos.x,
				y: this.pos.y
			}
		});
	}
}