function Users(config){
	
	if( typeof( name ) == "undefined" ){
		return;
	}
	
	//List of object parameters pass as an object
	this.config = {
		'fbApiKey':'',
		'socket':'',
		'userConnectCallback':'function(){\'You should set a user connect function callback\'}'
	}
	
	_.extend(this.config,config);
	
	//Array of all logged in facebook users using the app
	this.users=[];
	//Object containing the logged in user infos			
	this.user={};
	
	if(this.config.fbApiKey){
		FB.init({ apiKey: this.config.fbApiKey });
		FB.getLoginStatus(_.bind(this.fbHandleSessionResponse, this));
	} else {
		return false;	
	}
	
}

Users.prototype.fbQueryProfile = function(id,fields,callback){
	FB.api({
		method:'fql.query',
		query: 'SELECT '+ fields.toString() +' FROM profile WHERE id=' + id
		},
		callback
	);
}

Users.prototype.fbHandleSessionResponse = function(response){
	if(!response.session)
		return false;
	
	var callback = function(response){ 
		this.userConnect(response[0]);
		this.config.socket.sendData('userConnect',response[0].id);
	};
	callback = _.bind(callback, this);
	this.fbQueryProfile(FB.getSession().uid,['name','id','pic_square'],callback);

}

Users.prototype.userConnect = function(user){
	this.user = {'id':user.id,'name':user.name,'artist':false};
	if(this.config.userConnectCallback)
		this.config.userConnectCallback(user);
}

Users.prototype.addUser = function(fbId,delegate){
	
	var _this = {'_this':this,'delegate':delegate}; 
	
	var callback = function(response){ 
	
		var user = _.detect(this._this.users, function(user){ return user.fbId == response[0].id;});
		
		if(user){
			user.name = response[0].name;			
			user.pic_square = response[0].pic_square;
		}
		
		if(this.delegate)
			this.delegate(response[0]);
	};
	
	callback = _.bind(callback, _this);
	this.fbQueryProfile(fbId,['name','id','pic_square'],callback);
}

Users.prototype.addUsers = function(users){
	_.each(users,function(user){
			
			this.addUser(user.fbId);
	},this);
}

Users.prototype.deleteUser = function(fbId){
	this.users = _.reject(this.users, function(user){return user.id == fbId});
}

Users.prototype.userAlreadyConnected = function(){
	this.config.loginDivObject.html('Already logged in, in another window');
}
