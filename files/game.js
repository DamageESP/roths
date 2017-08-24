var Console = {
	setup: function () {
		var console = document.createElement("div")
		console.id = "console"
		console.style.cssText = "width: 500px; height: 100%; background: white; right: 0; top: 0; position: absolute; padding: 25px; display: none;"
		document.getElementsByTagName("body")[0].appendChild(console)
	},
	update: function () {
		if (document.getElementById("console").style.display == "block")
		var content = `
		Your position is: x: ${Math.floor(thisPlayer.pos.x)}, y: ${Math.floor(thisPlayer.pos.y)}
		Your health is: ${thisPlayer.health} hp
		`;
		document.getElementById("console").innerHTML = content
	},
	toggle: function () {
		document.getElementById("console").style.display == "none" ? document.getElementById("console").style.display = "block" : document.getElementById("console").style.display = "none"
	}
}
var socket = io();
var players = [];
var bullets = [];
var thisPlayer;
var playArea = {
	x: 2000,
	y: 2000
}
var view = {
	x: 1280,
	y: 720
}
var canvas;
var bird;
var bg;

// P5.JS

function preload() {
	bird = loadImage("img/bird.png");
	bg = loadImage("img/bg.png");
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight)
	socket.connect('http://localhost:3000')
	socket.emit('fetch data')

	Console.setup()

	// Login as player
	$("#username").keypress(function(e) {
		if(e.which == 13) {
			var username = $(this).val();
			if(username.length > 0) {
				socket.emit('add user', {
					username: username
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
		Console.update()
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
		//console.log(bullets.length)
		if(bullets[i].out) {
			bullets.splice(i, 1);
		} else {
			bullets[i].display();
		}
	}
}

// KEY BINDINGS
$(document).on('keypress', e => {
	if (e.key == "c") {
		//console.log('toggling console')
		Console.toggle()
	}
})


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
		var pushPlayer = new Player(data.players[i]);
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
		$("#username").focus();
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
		bullet.out || bullet.strength <= 0 ? updateThis.out = true : updateThis.pos = bullet.pos
	}
});

socket.on('add user', function(user) {
	var pushPlayer = new Player(user)
	players.push(pushPlayer)
	if(pushPlayer.id == socket.id) {
		thisPlayer = pushPlayer
		$("#events").show()
		$("#chat").show()
		$("#login").hide()
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
