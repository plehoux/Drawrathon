
$(document).ready(function(){
	io.setPath('client/Socket.io');
	var socket = new io.Socket(null, {port: 80});
	io.Socket.prototype.sendData = function(type,data) {
		dataObject = {
			type : type,
			data : data
			};
		this.send(JSON.stringify(dataObject));
	};
	
	socket.addEvent('message', function(data){
		
		data = JSON.parse(data);
		switch(data.type) {
			case 'drawingData':
				game.draw.drawPoints(data.data,true);
			break;
			case 'deleteDrawingData':
				game.draw.deletePoints(false);
			break;
			case 'usersList':
				game.addPlayers(data.data);	
			break;
			case 'userConnect':
				game.addPlayer(data.data);
			break;
			case 'userDisconnect':
				game.deletePlayer(data.data);
			break;
			case 'userAlreadyConnected':
				game.userAlreadyConnected();
			break;
			case 'userArtist':
				game.playerBecomeArtist();
			break;
			case 'newArtist':
				game.newArtist(data.data);
			break;
			case 'receiveWord':
				game.receiveWord(data.data);
			break;
			case 'userWin':
				game.userWin(data.data);
			break;
			case 'console':
				game.console(data.data);
			break;
		}
	
	});
	socket.addEvent('disconnect', function(data){});
	socket.addEvent('connect', function(data){});
	socket.connect();
	
	var game = new Game({'socket':socket,'fbApiKey':'41498240faa11983d28cc4504b952284','canevas':$("#board")});
	
	
	$('#login').click(function(){
		FB.login(function(response){game.fbHandleSessionResponse(response)});
	});
					
});
