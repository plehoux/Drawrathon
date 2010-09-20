var PUBLIC_DIRECTORY_PATH = 'public/';
var DEFAULT_FILE = 'index.html';

var http = require('http'),
	io = require('./lib/socket.io-node'),
	url = require('url'),
	path = require('path'),
	sys = require('sys'),
	fs = require('fs');

require('./lib/underscore');
	


server = http.createServer(function(req, res){
	var uri = url.parse(req.url).pathname;
	uri = uri + (uri.substr(-1) === '/' ? DEFAULT_FILE:'');
	var filename = path.join(process.cwd(),PUBLIC_DIRECTORY_PATH, uri);
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

server.listen(8080);

var io = io.listen(server);

var users = [];

io.on('connection', function(client){


	client.on('message', function(message){
		data = JSON.parse(message);
		sys.log(data.type + ' : ' + data.data);
		switch (data.type) {
			case('drawingData'):
				client.broadcast(message);
			break;
			case('userConnect'):
				if(_.any(users, function(num){ return num.fbId == data.data; }))
					break;
				users.push({id:client.sessionId,fbId:data.data});
				client.broadcast(message);
			break;
		}

	});


	client.on('disconnect', function(){
		//We clean users array
		if(_.any(users, function(i){ return i.id == client.sessionId; })){
			users = _.reject(users, function(i){ return i.id == client.sessionId; });
		}
	});

});