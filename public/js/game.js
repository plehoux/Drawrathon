//Inheritance from Users
Game.prototype = new Users();
Game.prototype.constructor = Game;
Game.prototype.parent = Users.prototype;
function Game(config){

	userConnectCallback = function (user){
		this.user.points = 0;
		$('#header').html('<div id="'+user.id+'"><img src="'+user.pic_square+'" class="pic"/>' + this.user.name+'<p class="points"></p></div>');
	}
	
	config.userConnectCallback = _.bind(userConnectCallback, this);

	//Init Users class
	Users.call(this,config);
	//Init Draw class
	this.draw = new Draw(config);

	this.draw.drawingEnable = false;
	
	this.consoleLength = 0;
	
	this.checkUISize();
	$(window).bind('resize',this,function(e){
		e.data.checkUISize();
		e.data.config.canevas[0].height = ($(window).height()-6);
		e.data.config.canevas[0].width = $(window).width();
		e.data.draw.drawPoints();
	});
	config.canevas[0].height = ($(document).height()-7);
	config.canevas[0].width = $(document).width();
	
	$('#answer').bind('keyup',this,function(e){
		switch(e.which) {
			case 13:
				if(!e.data.drawingEnable && e.data.user !== undefined){
					e.data.config.socket.sendData('answerData',{'answer':$('#answer').val(),'fbId':e.data.user.id});
					$('#answer').val('');
				} else {
					$('#answer').val('You need to be logged in to play');
				}
			break; 
		}
	}); 
	
	$('#picture').bind('mouseover',this,function(e){
		$("#description").show();
	});
	
	$('#picture').bind('mouseout',this,function(e){
		$("#description").hide();
	});
	
	$('#skip').bind('click',this,function(e){
		e.data.config.socket.sendData('skip',e.data.user.id);
	});
	
}

Game.prototype.addPlayer = function(player){
	this.users.push({
			'id':player.fbId,
			'artist':player.artist,
			'points':0
		});
	delegate = function(user){
		$('#players').append('<li id="'+user.id+'"><img src="'+user.pic_square+'" class="pic"/>'+user.name+'<p class="points"></p></li>');
		$('.alone').hide();
	};
	delegate = _.bind(delegate, this);
	this.parent.addUser.call(this,player.fbId,delegate);
}

Game.prototype.addPlayers = function(players){
	_.each(players, function(player){
		this.addPlayer.call(this,player);
	},this);	
}

Game.prototype.deletePlayer = function(fbId){
	this.parent.deleteUser.call(this,fbId);
	$('#'+fbId).remove();
	if(this.users.length == 0)
		$('.alone').show();
}

Game.prototype.playerBecomeArtist = function(){
	this.user.artist = true;
	this.draw.drawingEnable = true;
	$('input').hide();
}

Game.prototype.playerBecomeNonArtist = function(){
	this.user.artist = false;
	this.draw.drawingEnable = false;
	if(this.user) {
		$('#skip').hide();
		$('input').fadeIn();
	}
}

Game.prototype.newArtist = function(fbId){
	if(fbId == this.user.id) {
		this.playerBecomeArtist();
	} else {
		this.playerBecomeNonArtist();
	}
	var user = _.detect(this.users, function(user){user.id == fbId});
	if (user)
		user.artist = true;
}

Game.prototype.receiveWord = function (word){
	this.word = word;
	this.showWord();
}	

Game.prototype.showWord = function(){
	this.gameCount = this.word.time;
	this.resetGame();
	if(this.user.artist) {
		$('#title').html('You have <span id="smallCounter">'+this.gameCount+'</span> seconds');
		if(this.word.picture){
			$('#theme').html('to draw this '+this.word.theme+':');
			$('#picture').html('<img src="' + this.word.picture + '" />'+'<div id="description">'+((this.word.description)?this.word.description.replace(/\((.*?)\)/g,'').replace(/]/g,'').replace(/\[/g,''):'')+'</div>');
		} else {
			$('#theme').html('to draw this '+this.word.theme+': '+this.word.name);
		}
		$('#skip').fadeIn();
	} else {
		$('#title').html('You have <span id="smallCounter">'+this.gameCount+'</span> seconds');
		$('#theme').html('to find this '+this.word.theme+'.');
	}
	
	clearInterval(this.gameCountDown);
	this.gameCountDown = setInterval(_.bind(function(){
		if (this.gameCount > 0){
			$('#smallCounter').html(this.gameCount);
			this.gameCount --;
		} else {
			this.resetGame();
		}
	},this),1000);
}

Game.prototype.resetGame = function(){
	
	clearInterval(this.gameCountDown);
	$('#title').html('Drawrathon');
	$('#theme').html('');
	$('#picture').html('');
	$('#console').html('');
	this.consoleLength=0;
	this.draw.deletePoints();

}

Game.prototype.userWin = function(data){
	if(this.user.id == data.artist){
		this.user.points += 10;
		points = this.user.points;
	} else {
		user = _.detect(this.users,function(user){return user.id == data.artist},this);
		user.points += 10;
		points = user.points;
	}
	$('#'+data.artist).find('p.points').html(points + ' points');

}

Game.prototype.console = function(data){
	
	this.consoleLength ++;
	var i = 1;
	_.each($('#console').find('li'), function(li){
		$(li).css('opacity',0.8-(this.consoleLength - i)/10);
		i++;
	},this);

	$('#console').append('<li>'+data+'</li>');	

}

Game.prototype.checkUISize = function(){
	if($(document).height() <= 480) {
		$('input').css('font-size',12);
		$('#input').css('bottom',14);
	}
	if($(document).height() > 480) {
		$('input').css('font-size',34);
		$('#input').css('bottom',40);	
	}
}
