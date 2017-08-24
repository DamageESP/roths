
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


http.listen(3000, function() {
	console.log('listening on *:3000');
});

//SOCKET.IO
var players = [];
var bullets = [];
var playArea = {
	x: 2000,
	y: 2000
}

function Bullet(data) {
	this.userID = data.userID
	this.id = data.id
	this.pos = data.pos
	this.heading = data.heading
	this.decay = data.decay
	this.strength = data.strength
}

function Player(data) {
	this.id = data.id
	this.username = data.username
	this.colour = data.colour || {r: random(0, 255), g: random(0, 255), b: random(0, 255)}
	this.pos = data.pos || {x: random(0, playArea.x), y: random(0, playArea.y)}
	this.health = data.health || 100
}

function random(min, max) {
  return Math.floor(max - Math.random()*(max-min))
}

function lookup(username) {
	var lookup = {};
	for (var i = 0, len = players.length; i < len; i++) {
		lookup[players[i].username.toLowerCase()] = players[i];
	}
	if(lookup[username]) {
		return lookup[username];
	}
	else return false;
}

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

function flyBullets() {
	if (bullets.length > 0) {
		for (var i = 0; i < bullets.length; i++) {
			if(bullets[i].pos.x > playArea.x || bullets[i].pos.x < 0 || bullets[i].pos.y < 0 || bullets[i].pos.y > playArea.y) {
				//console.log('bullet out')
				bullets[i].out = true
				io.emit('bullet update', bullets[i])
				bullets.splice(i, 1)
			} else {
				bullets[i].strength > 0 ? bullets[i].strength -= .5 : bullets[i].strength = 0
				bullets[i].decay += .003
				bullets[i].heading.y += bullets[i].decay
				bullets[i].pos.x += bullets[i].heading.x
				bullets[i].pos.y += bullets[i].heading.y
				//console.log('bullet y pos is '+bullets[i].pos.y)
				io.emit('bullet update', bullets[i])
				if (checkBulletHit(bullets[i]) || bullets[i].strength <= 0) {
					bullets.splice(i, 1)
				}
				//console.log('bullet has been displaced to x:'+bullets[i].pos.x+', y:'+bullets[i].pos.y)
			}
		}
	}
}

function checkBulletHit(bullet) {
	for (var i = 0; i < players.length; i++) {
			/*
			if (Math.abs(Math.floor(players[i].pos.x) - Math.floor(bullets[j].pos.x)) < 20 && Math.abs(Math.floor(players[i].pos.y) - Math.floor(bullets[j].pos.y)) < 14) {
				console.log('player '+players[i].id+' has been hit by '+bullets[j].userID+' ('+Math.abs(Math.floor(players[i].pos.x) - Math.floor(bullets[j].pos.x))+' < 20 and '+Math.abs(Math.floor(players[i].pos.y) - Math.floor(bullets[j].pos.y))+' < 14)')
			}
			//console.log(Math.abs(Math.floor(players[i].pos.y) - Math.floor(bullets[j].pos.y)))*/
			if (Math.abs(players[i].pos.x - bullet.pos.x) < 20
			&& Math.abs(players[i].pos.y - bullet.pos.y) < 14
			&& players[i].id != bullet.userID) {
				players[i].health -= bullet.strength
				if (players[i].health <= 0) {
					console.log('player '+bullet.userID+' hit AND KILLED player '+players[i].id+'!')
					io.emit('player killed', {
						hit: players[i].id,
						shooter: bullet.userID,
						bullet: bullet.id
					})
					players.splice(i, 1)
					return true
				} else {
					console.log('player '+bullet.userID+' hit player '+players[i].id+' and now has '+players[i].health+' health!')
					io.emit('player hit', {
						hit: {
							id: players[i].id,
							health: Math.ceil(players[i].health)
						},
						shooter: bullet.userID,
						bullet: bullet.id
					})
					return true
				}
			}

	}
}

setInterval(flyBullets, 16)


// user connect

io.on('connection', function(client){

	io.to(client.id).emit('fetch players', players); //only for the requester 
	console.log('user connected (id: '+client.id+')');

	// disconnect
	client.on('disconnect', function(){
		if(lookupId(client.id)) {
			var thisPlayer = lookupId(client.id);
			console.log(thisPlayer.username+' disconnected (id: '+client.id+')');
			var i = players.indexOf(thisPlayer);
			players.splice(i, 1);
			io.emit('disconnected', thisPlayer.id);
			io.emit('status message', thisPlayer.username+" disconnected");
		} else {
			console.log('anon disconnected (id: '+client.id+')');
		}
		// io.emit('status message', 'user '+ user.username +' disconnected');
	});
 
	// fetch players

	client.on('fetch data', function() {
		console.log('sending list of players: '+JSON.stringify(players))
		io.to(client.id).emit('fetch data', {players, bullets}); //only for the requester
	});

	// add user
	client.on('add user', function(user) {
		if (user.username.length > 0) {
			if(lookupId(client.id)) {
				io.to(client.id).emit('user message', ' You are already playing as '+lookupId(client.id).username);
				console.log(' '+user.username+" is already playing as "+lookupId(client.id).username);
			} else if(lookup(user.username.toLowerCase())) {
				io.to(client.id).emit('user message', ' user '+ user.username +' already exists');
					console.log(' '+user.username+" already exists");
			} else {
				user.id = client.id
				var newPlayer = new Player(user);
				players.push(newPlayer);
				console.log(user.username+' joined (id: '+client.id+')');
				client.broadcast.emit('status message', user.username +' has joined!'); // announce user joining
				io.to(client.id).emit('status message', 'welcome, '+user.username+'!');
				io.emit('add user', newPlayer);
			}
		}
		
		//client.broadcast.emit('player move'); // message for all but sender
	});

	// add bullet

	client.on('add bullet', function(bullet) {
		if (lookupId(bullet.userID)) {
			var newBullet = new Bullet(bullet);
			bullets.push(newBullet);
			io.emit('add bullet', newBullet);
		}
	});


  // say in chat
  client.on('say', function(data) {
	if (data.length > 0) {
		var thisPlayer = lookupId(client.id);
		if(thisPlayer) {
			console.log(thisPlayer.username+" says: "+data)
			io.emit('say', {
				user: thisPlayer.username,
				colour: 'rgb('+Math.floor(thisPlayer.colour.r)+', '+Math.floor(thisPlayer.colour.g)+', '+Math.floor(thisPlayer.colour.b)+')',
				data: data
			});
		} else { 
			io.to(client.id).emit('disconnected', client.id);
		}
	}
  });

  // update players coordinates
  client.on('player update', function(data) {
	if(lookupId(data.id)) {
		var updateThis = lookupId(data.id);
		updateThis.pos = data.pos;
		io.emit('player update', updateThis);
	}
  });

});


// ROUTING

app.set('view engine', 'pug');

app.use(express.static('files'));

app.get('/circles', randomCircles);
app.get('/flares', backgroundFlares);
app.get('/game', game);
app.get('/test', test);
app.get('/', index);


function index(request, response) {
	response.render('index');
}

function backgroundFlares(request, response) {
	response.render('flares');
}

function randomCircles(request, response) {
	response.render('circles');
}

function game(request, response) {
	response.render('game');
}

function test(request, response) {
	response.render('test');
}