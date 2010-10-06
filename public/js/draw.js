function Draw(config){
	
	this.config = {
		'canevas':'',
		'socket':''
	}
	
	_.extend(this.config,config);
	
	//If user can draw;
	this.drawingEnable = false;
	
	if(!this.config.canevas[0].getContext) { 
		alert('Your browser is not compatible with the game, go download google Chrome it\'s the best!');
		return false;
	}
	
	this.ctx = this.config.canevas[0].getContext("2d");
	//State of drawing action
	this.drawing = false;
	this.points = [];
	this.pointsTemp = [];
	
	//Mouse Event on canvas
	this.config.canevas.bind('mousedown',this,function(e){
		e.data.mouseDown(e.pageX,e.pageY);
	});
	this.config.canevas.bind('mousemove',this,function(e){
		e.data.mouseMove(e.pageX,e.pageY);
	});
	this.config.canevas.bind('mouseup',this,function(e){
		e.data.mouseUp();
	});
	//Keyboard events on Document
	$(document).bind('keyup',this,function(e){
		switch(e.which) {
			case 32:
				if(e.data.drawingEnable){
					e.data.deletePoints(true);
				}
			break; 
		}
	}); 
		
}

Draw.prototype.mouseDown = function(x,y){
	if(!this.drawing && this.drawingEnable){
		this.drawing = true;
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		this.ctx.moveTo(x-this.config.canevas.offset().left,y-this.config.canevas.offset().top);
		this.pointsTemp = [];
		this.pointsTemp.push({x:x-this.config.canevas.offset().left,y:y-this.config.canevas.offset().top,s:true});
	}
}

Draw.prototype.mouseMove = function(x,y){
	if(this.drawing && this.drawingEnable){
		this.ctx.shadowOffsetX = 1;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowColor   = 'rgba(211, 211, 211, 1)';
		this.ctx.lineTo(x-this.config.canevas.offset().left,y-this.config.canevas.offset().top);
		this.ctx.stroke();
		this.pointsTemp.push({x:x-this.config.canevas.offset().left,y:y-this.config.canevas.offset().top,s:false});
		if(this.pointsTemp.length > 2) {
			this.config.socket.sendData('drawingData',this.pointsTemp);
			$.merge(this.points,this.pointsTemp);
			this.pointsTemp = [];
		}
	}
}

Draw.prototype.mouseUp = function(){
	if(this.drawingEnable){
		this.drawing = false;
		$.merge(this.points,this.pointsTemp);
		this.config.socket.sendData('drawingData',this.pointsTemp);	
	}
}

Draw.prototype.drawPoints = function(points,merge){	
	if(!points)
		points = this.points;
	_.each(points, function(point){
		if(point.s){
			this.ctx.beginPath();
			this.ctx.moveTo(point.x-this.config.canevas.offset().left,point.y-this.config.canevas.offset().top);
		} else {
			this.ctx.shadowOffsetX = 1;
			this.ctx.shadowOffsetY = 1;
			this.ctx.shadowColor   = 'rgba(211, 211, 211, 1)';
			this.ctx.lineTo(point.x-this.config.canevas.offset().left,point.y-this.config.canevas.offset().top);
			this.ctx.stroke();	
		}
	},this);
	if(merge)
		$.merge(this.points,points);
}

Draw.prototype.deletePoints = function(deleteDaemonPoints){
	if(deleteDaemonPoints){
		this.config.socket.sendData('deleteDrawingData',true);	
	}
	this.points = [];
	this.pointsTemp = [];
	this.drawing = false;
	this.ctx.clearRect(0,0,this.config.canevas.width(),this.config.canevas.height());
}