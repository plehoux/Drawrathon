var http = require('http');
var sys = require('sys');

exports.getMovies = function() {

	this.description = 'movie';
	this.data = [];
	
	this.movieIterator=1;
	this.moviesTemp = [];
	this.theMoviesDB = http.createClient(80,'api.themoviedb.org');

	this.foo = new Date;
	
	this.requestMovies = function() {
		request = this.theMoviesDB.request("GET", '/2.1/Movie.browse/en-US/json/f80787836164c7f66c0009097992fe95?order_by=rating&order=desc&genres=28,12,16,35,105,18,27,878,53,10752&genres_selector=or&rating_min=9&min_votes=25&countries=us&page='+this.movieIterator+'&per_page=100&release_min=946688461&release_max='+this.foo.getTime()/1000,{'host':'api.themoviedb.org'});
		request.end();
		request.on('response',_.bind(function(response){
			response.setEncoding('utf8');
			response.on('data', _.bind(function (chunk) {
				if(!this.moviesTemp[this.movieIterator-1])
					this.moviesTemp[this.movieIterator-1] = '';
				this.moviesTemp[this.movieIterator-1] += chunk;
			},this));
			response.on('end',_.bind(function(){
				if(this.movieIterator < 10 && this.moviesTemp[this.movieIterator-1].search('Nothing found.') == -1) {
					this.requestMovies();
				} else {
					_.each(this.moviesTemp,function(i){
						if(i.search('Nothing found.') == -1)
							this.data = this.data.concat(JSON.parse(i));
					},this);
					_.each(this.data, function(movie){
						movie.picture = movie.posters[2].image.url;
						movie.description = movie.overview;
					});
				}
				this.movieIterator++;
			},this));
		},this));
	
	}
	
	this.requestMovies();

}


this.i = 1;
this.temp = [];


exports.getStartUps = function() {

	this.description = 'Y Combinator Start Up';
	
	this.data = [];
	this.i = 1;


	this.crunchBase = http.createClient(80,'api.crunchbase.com');
	
	this.requestStartup = function() {
		this.temp = '';
		request = this.crunchBase.request("GET", '/v/1/search.js?query=y-combinator&page='+this.i,{'host':'api.crunchbase.com'});
		request.end();
		request.on('response',_.bind(function(response){
			response.setEncoding('utf8');
			response.on('data', _.bind(function (chunk) {
			
				this.temp += chunk;

			},this));
			response.on('end',_.bind(function(){
				
				this.temp = JSON.parse(this.temp);
				sys.log(this.i);
				_.each(this.temp.results, function(result){
				
					if (result.image && result.namespace == 'company'){
						if(result.name && result.image.available_sizes && result.overview)
							this.data.push({'name':result.name,'picture':'http://api.crunchbase.com/'+result.image.available_sizes[1][1],'description':result.overview});
					}
					
				},this);
				
				if(this.i < 6)
					this.requestStartup();
				
				this.i++
				
			},this));
		},this));
	
	}
	
	
	this.requestStartup();

}

exports.getAnimals = function(){

	this.data = [
		{'name':'Aardvark'},
		{'name':'Buffalo'},
		{'name':'Bison'},
		{'name':'Ant'},
		{'name':'Anteater'},
		{'name':'Antelope'},
		{'name':'Ape'},
		{'name':'Armadillo'},
		{'name':'Donkey'},
		{'name':'Bat'},
		{'name':'Bear'},
		{'name':'Beaver'},
		{'name':'Bee'},
		{'name':'Boar'},
		{'name':'Butterfly'},
		{'name':'Camel'},
		{'name':'Cat'},
		{'name':'cattle'},
		{'name':'Cheetah'},
		{'name':'Chicken'},
		{'name':'Chimpanzee'},
		{'name':'Cobra'},
		{'name':'Cockroach'},
		{'name':'Cormorant'},
		{'name':'Cougar'},
		{'name':'Coyote'},
		{'name':'Crab'},
		{'name':'Crocodile'},
		{'name':'Crow'},
		{'name':'Deer'},
		{'name':'Dog'},
		{'name':'Dolphin'},
		{'name':'Dogfish'},
		{'name':'Dragonfly'},
		{'name':'Duck'},
		{'name':'Eagle'},
		{'name':'Eel'},
		{'name':'Elephant'},
		{'name':'Seal'},
		{'name':'Falcon'},
		{'name':'Ferret'},
		{'name':'Fly'},
		{'name':'Fox'},
		{'name':'Frog'},
		{'name':'Gaur'},
		{'name':'Gazelle'},
		{'name':'Gerbil'},
		{'name':'Giant Panda'},
		{'name':'Giraffe'},
		{'name':'Gnu'},
		{'name':'Goat'},
		{'name':'Goose'},
		{'name':'Gorilla'},
		{'name':'Guanaco'},
		{'name':'Pig'},
		{'name':'Gull'},
		{'name':'Hamster'},
		{'name':'Hare'},
		{'name':'Hawk'},
		{'name':'HedgeHog'},
		{'name':'Heron'},
		{'name':'Hippopotamus'},
		{'name':'Hornet'},
		{'name':'Horse'},
		{'name':'Human'},
		{'name':'Hyena'},
		{'name':'Iguana'},
		{'name':'Jackal'},
		{'name':'Jaguar'},
		{'name':'Jellyfish'},
		{'name':'Kangaroo'},
		{'name':'Komodo dragon'},
		{'name':'Lemur'},
		{'name':'Leopard'},
		{'name':'Lion'},
		{'name':'Llama'},
		{'name':'Lobster'},
		{'name':'Mink'},
		{'name':'Mole'},
		{'name':'Meerkat'},
		{'name':'Monkey'},
		{'name':'Moose'},
		{'name':'Mosquito'},
		{'name':'Mule'},
		{'name':'Owl'},
		{'name':'Panther'},
		{'name':'Oyster'},
		{'name':'Pigeon'},
		{'name':'Pony'},
		{'name':'Rabbit'},
		{'name':'Raccoon'},
		{'name':'Rat'},
		{'name':'Raven'},
		{'name':'Panda'},
		{'name':'Rhinoceros'},
		{'name':'Salamander'},
		{'name':'Sea lion'},
		{'name':'Seal'},
		{'name':'Shark'},
		{'name':'Snail'},
		{'name':'Spider'},
		{'name':'Squid'},
		{'name':'Squirrel'},
		{'name':'Swan'},
		{'name':'Tiger'},
		{'name':'Toad'},
		{'name':'Turkey'},
		{'name':'Turle'},
		{'name':'Whale'},
		{'name':'Wolf'},
		{'name':'Worm'},
		{'name':'Zebra'}
	];
	this.description = 'animal';
};

exports.getVerbs = function(){

	this.data = [
		{'name':'Add'},
		{'name':'Attract'},
		{'name':'Accelerate'},
		{'name':'Apply'},
		{'name':'Acquire'},
		{'name':'Begin'},
		{'name':'Build'},
		{'name':'Bought'},
		{'name':'Balance'},
		{'name':'Approve'},
		{'name':'Advise'},
		{'name':'Activate'},
		{'name':'Calculate'},
		{'name':'Connect'},
		{'name':'Copy'},
		{'name':'Communicate'},
		{'name':'Coach'},
		{'name':'Create'},
		{'name':'Cooperate'},
		{'name':'Compose'},
		{'name':'Collaborate'},
		{'name':'Debug'},
		{'name':'Discuss'},
		{'name':'Draw'},
		{'name':'Diversity'},
		{'name':'Detect'},
		{'name':'Defend'},
		{'name':'Earn'},
		{'name':'Exercise'},
		{'name':'Expand'},
		{'name':'Guide'},
		{'name':'Govern'},
		{'name':'Highlight'},
		{'name':'Interview'},
		{'name':'Import'},
		{'name':'Invent'},
		{'name':'Increase'},
		{'name':'Join'},
		{'name':'Learn'},
		{'name':'Localize'},
		{'name':'Market'},
		{'name':'Measure'},
		{'name':'Pilot'},
		{'name':'Release'},
		{'name':'Travel'},
		{'name':'Uncover'},
		{'name':'Write'},
		{'name':'Search'},
		{'name':'Study'},
		{'name':'Start'},
		{'name':'Save'}
	];
	this.description = 'action verb';
};
