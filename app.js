var PUBLIC_DIRECTORY_PATH = 'public/';
var DEFAULT_FILE = 'index.html';

var http = require('http'),
	io = require('./lib/socket.io'),
	url = require('url'),
	path = require('path'),
	sys = require('sys'),
	fs = require('fs');

require('./lib/underscore');
var getWordsList = require('./words');


server = http.createServer(function(req, res){
	var uri = url.parse(req.url).pathname;
	uri = uri + (uri.substr(-1) === '/' ? DEFAULT_FILE:'');
	var filename = path.join(__dirname,PUBLIC_DIRECTORY_PATH, uri);
	path.exists(filename, function(exists){
	
		if(!exists) {
				
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('File not found \n');
			sys.log('404: ' + filename);
			res.end();
			return;

		}
		
		fs.readFile(filename, function(err, file) {
			
				if(err){
					
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.write(err + '\n');
					sys.log('500: ' + filename + err);
					res.end();
						
				} else {
				
					res.writeHead(200, {'Content-Type': 'text/' + (uri.substr(-3) === '.js' ? 'javascript' : 'html')});
					res.write(file);
					sys.log('200: ' + filename);
					res.end();
				
				}
			
		});
	
	});

});

server.listen(80);

var io = io.listen(server);

var users = [];
var gameStatus = 'off'; //on,off,ready

var points = [];
var words = {};

words.startups = new getWordsList.getStartUps();
words.movies = new getWordsList.getMovies();
words.animals = new getWordsList.getAnimals();
words.verbs = new getWordsList.getVerbs();


categories = Object.keys(words);
word = words[categories[Math.floor(Math.random()*categories.length)]];

var update = setInterval(function(){
	if(gameStatus == 'ready'){
	
		_.each(users, function(user){
			if(user.artist) {
				sys.log('Send new theme');
				categories = Object.keys(words);
				categorie = words[categories[Math.floor(Math.random()*categories.length)]];
				word = categorie.data[Math.floor(Math.random()*categorie.data.length)];

				word = {'type':'receiveWord','data':{
					'name':word.name,
					'picture':(word.picture)?word.picture:'',
					'description':(word.description)?word.description:'',
					'theme':categorie.description,
					'time':120
				}};
				io.clients[user.id].send(JSON.stringify(word));
				io.clients[user.id].broadcast(JSON.stringify({'type':'receiveWord','data':{
					'theme':categorie.description,
					'time':120
				}}));
			}
		});
		gameStatus = 'on';
		
	} else if(gameStatus == 'on') {

		word.data.time--;
		if(word.data.time <= 0) {
			points = [];
			setNewArtist();
		}
			
	}
},1000); 

var checkIfUserIsArtist = function(userId){

	return _.any(users,function(user){
		if(user.id == userId && user.artist){
			return true;
		} else {
			return false;
		}
	},this);	
}

var setNewArtist = function(fbId){

	_.each(users, function(user){
			user.artist = false;
	});

	if(users.length == 0) {
		gameStatus = 'off';

	} else if(users.length == 1) {
	
		users[0].artist = true;
		io.broadcast(JSON.stringify({'type':'newArtist','data':users[0].fbId}));
		gameStatus = 'off';
	
	} else {
	
		if(!fbId){
			var user = users[Math.floor(Math.random()*users.length)];
		} else {
			var user = _.detect(users, function(user){return user.fbId == fbId},this);
		}
		
		user.artist = true;
		io.broadcast(JSON.stringify({'type':'newArtist','data':user.fbId}));
		gameStatus = 'ready';
	
	}

}

io.on('connection', function(client){

	client.send(JSON.stringify({'type':'usersList','data':users}));
	client.send(JSON.stringify({'type':'drawingData','data':points}));
	if(gameStatus == 'on') {
		client.send(JSON.stringify(word));
	}

	client.on('message', function(message){
		data = JSON.parse(message);
		switch (data.type) {
			case('drawingData'):
				_.each(data.data,function(point){
					points.push(point);
				});
				client.broadcast(message);
			break;
			case('deleteDrawingData'):
				if(checkIfUserIsArtist(client.sessionId)){
					points = [];
					client.broadcast(JSON.stringify({'type':'deleteDrawingData','data':true}));
				}
			break;
			case('userConnect'):
				if(_.any(users, function(user){ return user.fbId == data.data; })) {
					client.send(JSON.stringify({'type':'userAlreadyConnected','data':''}));
				} else {
					if(!_.any(users, function(user){ return user.artist; })){
						users.push({id:client.sessionId,fbId:data.data,artist:true});
						client.broadcast(JSON.stringify({'type':'userConnect','data':{'fbId':data.data,artist:true}}));
						client.send(JSON.stringify({'type':'userArtist','data':true}))
					} else {
						if(gameStatus == 'off')
							gameStatus = 'ready';
						users.push({id:client.sessionId,fbId:data.data,artist:false});
						client.broadcast(JSON.stringify({'type':'userConnect','data':{'fbId':data.data,artist:false}}));
					}
				}
			break;
			case('answerData'):
				if(_.any(users, function(user){ return user.fbId == data.data.fbId; })) {
					if(data.data.answer.toLowerCase() == word.data.name.toLowerCase()){
						var user = _.detect(users, function(user){return user.artist});
						io.broadcast(JSON.stringify({'type':'userWin','data':{'artist':user.fbId,'guesser':data.data.fbId}}));
						setNewArtist(data.data.fbId);
					} else {
						if(data.data.answer != '')
							io.broadcast(JSON.stringify({'type':'console','data':data.data.answer.toLowerCase().substr(0,40)}));
					};
				}
			break;
			case('skip'):
				if(_.any(users, function(user){ return user.fbId == data.data; })) {
					setNewArtist();
				}
			break;
		}

	});

	client.on('disconnect', function(){
		//We delete user from users array on disconnect
			this.setNewArtist = false;
			users = _.reject(users, _.bind(function(user){ 
				if(user.id == client.sessionId) {
					client.broadcast(JSON.stringify({'type':'userDisconnect','data':user.fbId}));
					if(user.artist) {
						this.setNewArtist = true;
					}
					return true;
				} else {
					return false;
				}
			},this));
			if(this.setNewArtist) {
				setNewArtist();
			}
			

	});

});
