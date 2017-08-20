
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

function Bullet(user, pos, heading) {
	this.user = user;
	this.pos = pos;
	this.heading = heading;
}

function Player(id, username, colour, pos) {
	this.id = id;
	this.username = username;
	this.colour = colour;
	this.pos = pos;
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

/*function lookupBullet(id, x, y) {
	var lookup = {};
	for (var i = 0, len = bullets.length; i < len; i++) {
		lookup[bullets[i].id] = bullets[i];
	}
	if(lookup[id]) {
		for (var i = 0, len = bullets.length; i < len; i++) {
			lookup[bullets[i].pos.x] = bullets[i];
		}
		if(lookup[x]) {
			for (var i = 0, len = bullets.length; i < len; i++) {
				lookup[bullets[i].pos.y] = bullets[i];
			}
			return lookup
		}
	}
	else return false;
}*/

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
				var newPlayer = new Player(user.id, user.username, user.colour, user.pos);
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
		var newBullet = new Bullet(bullet.user, bullet.pos, bullet.heading);
		bullets.push(newBullet);
		io.emit('add bullet', newBullet);
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

 /* // update bullets coordinates
  client.on('bullet update', function(data) {
	if(lookupBullet(data.id, data.pos.x, data.pos.y)) {
		var updateThis = lookupBullet(data.id, data.pos.x, data.pos.y);
		updateThis.pos = data.pos;
		io.emit('bullet update', updateThis);
	}
  });*/
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