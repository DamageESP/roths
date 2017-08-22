var initialSize = 20;
var socket = io();
var players = [];
var bullets = [];
var thisPlayer;
var canvas;
var bird;
var bg;

// P5.JS

function preload() {
	bird = loadImage("img/bird.png");
	bg = loadImage("img/bg.png");
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	socket.connect('http://localhost:3000');
	socket.emit('fetch data');

	// Login as player
	$("#username").keypress(function(e) {
		if(e.which == 13) {
			var username = $(this).val();
			if(username.length > 0) {
				var r = random(0,255);
				var g = random(0,255);
				var b = random(0,255);
				var x = random(0, windowWidth);
				var y = random(0, windowHeight);
				var pos = {
					x: x,
					y: y
				};
				var colour = {
					r: r,
					g: g,
					b: b
				};
				var health = 100
				var newPlayer = new Player(socket.id, username, colour, pos, health)
				socket.emit('add user', {
					id: newPlayer.id,
					username: newPlayer.username,
					colour: newPlayer.colour,
					pos: {
						x: newPlayer.pos.x,
						y: newPlayer.pos.y
					},
					health: newPlayer.health
				});
				return false;
			}
		}
	});

	// Send a message to chat
	$("#send").keypress(function(e){
		if(e.which == 13) {
			var text = $("#send").val();
			thisPlayer.say(text);
			$("#send").val('');
			return false;
		}
	});

	if(!thisPlayer) {
		$("#events").hide();
		$("#chat").hide();
		$("#login").show();
	}

}

function draw() {
	background(bg);

	// Player movement

	if(thisPlayer) {
		if(!$("#chat input").is(":focus")) {
			if(keyIsDown(UP_ARROW) || keyIsDown(87)) {
				thisPlayer.move("up");
			}
			if(keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
				thisPlayer.move("down");
			}
			if(keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
				thisPlayer.move("left");
			}
			if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
				thisPlayer.move("right");
			}
		}
		if(!keyIsPressed) {
			thisPlayer.move();
		}

		thisPlayer.update();
	}

	// Update positions, send info to server and display.

	// players update
	for (var i = 0; i < players.length; i++) {
		players[i].display();
	}

	// bullets update
	for (var i = 0; i < bullets.length; i++) {
		if(bullets[i].out) {
			bullets.splice(i, 1);
		} else {
			bullets[i].display();
		}
	}
}

function shoot() {
	if(thisPlayer) {
		thisPlayer.shoot();
	}
	else return false;
}

function mouseClicked() {
	if(mouseButton == LEFT) {
		shoot();
	}
	return false;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

// lookup id of user in players array

function lookupId(id) {
	var lookup = {};
	for (var i = 0, len = players.length; i < len; i++) {
		lookup[players[i].id] = players[i];
	}
	if(lookup[id]) {
		return lookup[id];
	}
	else return false;
}

function lookupBullet(id) {
	var lookup = {};
	for (var i = 0, len = bullets.length; i < len; i++) {
		lookup[bullets[i].id] = bullets[i];
	}
	if(lookup[id]) {
		return lookup[id];
	}
	else return false;
}

// scroll down on event

function add() {
	var out = document.getElementById("events");
	// allow 1px inaccuracy by adding 1
	out.scrollTop = out.scrollHeight - 10;
}


// SOCKET.IO

socket.on('fetch data', function(data) {
	players = [];
	bullets = [];
	for(var i = 0; i < data.players.length; i++) {
		var pushPlayer = new Player(data.players[i].id, data.players[i].username, data.players[i].colour, data.players[i].pos, data.players[i].health);
		players.push(pushPlayer);
	}
	if(data.bullets) {
		for(var i = 0; i < data.bullets.length; i++) {
			var pushBullet = new Bullet(data.bullets[i]);
			bullets.push(pushBullet);
		}
	}
	if(lookupId(socket.id)) {
		thisPlayer = lookupId(socket.id);
	} else {
		thisPlayer = "";
		$("#events").hide();
		$("#chat").hide();
		$("#login").show();
	}
});

socket.on('status message', function(msg) {
	$("#events").append($("<li style=\"color:green\">").text(msg));
	add();
});

socket.on('user message', function(msg) {
	$("#events").append($("<li style=\"color:blue\">").text(msg));
	add();
});

socket.on('say', function(msg) {
	$("#events").append($("<li style=\"color:black\">").html('<strong style=\'color: '+msg.colour+'\'>'+msg.user+'</strong>: '+msg.data));
	add();
});

socket.on('player update', function(player) {
	if(lookupId(player.id)) {
		var updateThis = lookupId(player.id);
		updateThis.pos = player.pos;
	}
});

socket.on('bullet update', function(bullet) {
	//console.log('found bullet with id '+bullet.id+' to pos x:'+bullet.pos.x+', y:'+bullet.pos.y)
	if(lookupBullet(bullet.id)) {
		//console.log('found bullet with id '+bullet.id)
		var updateThis = lookupBullet(bullet.id);
		updateThis.pos = bullet.pos;
	}
});

socket.on('add user', function(user) {
	var pushPlayer = new Player(user.id, user.username, user.colour, user.pos, user.health);
	players.push(pushPlayer);
	if(lookupId(socket.id)) {
		thisPlayer = lookupId(socket.id);
		$("#events").show();
		$("#chat").show();
		$("#login").hide();
	}
});

socket.on('add bullet', function(bullet) {
	if (lookupId(bullet.userID)) {
		var pushBullet = new Bullet(bullet);
		bullets.push(pushBullet);
		//console.log('added bullet with id '+bullet.id+' and pos x:'+bullet.pos.x+', y:'+bullet.pos.y)
	} else {
		console.log('user not found when trying to shoot')
	}
});

socket.on('player hit', function(shooting) {
	var playerHit = lookupId(shooting.hit.id)
	if (playerHit) {
		playerHit.health = shooting.hit.health
		var bullet = lookupBullet(shooting.bullet)
		var i = bullets.indexOf(bullet)
		bullets.splice(i, 1)
		console.log('player '+playerHit.username+' now has health '+playerHit.health)
	} else {
		console.log('player hit not found')
	}
})

socket.on('player killed', function(shooting) {
	var playerHit = lookupId(shooting.hit)
	var shooter = lookupId(shooting.shooter)
	if (playerHit) {
		console.log('player '+playerHit.username+' was killed by '+shooter.username)
		var i = players.indexOf(playerHit);
		players.splice(i, 1);
		var bullet = lookupBullet(shooting.bullet)
		var i = bullets.indexOf(bullet)
		bullets.splice(i, 1)
		if (playerHit.id == socket.id) {
			document.body.innerHTML = "u ded"
		}
	} else {
		console.log('player hit not found')
	}
})

socket.on('disconnected', function(id) {
	var deleteThis = lookupId(id);
	if(thisPlayer == deleteThis) {
		thisPlayer = "";
		$("#events").hide();
		$("#chat").hide();
		$("#login").show();
	}
	var i = players.indexOf(deleteThis);
	players.splice(i, 1);
});
