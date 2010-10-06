
function GetMoviesList() {

	this.description = 'Popular movies form last decade.';
	this.data = [];
	
	this.movieIterator=1;
	this.moviesTemp = [];
	this.theMoviesDB = http.createClient(80,'api.themoviedb.org');

	this.foo = new Date;
	
	this.requestMovies

}

GetMoviesList.prototype.requestMovies = function() {

	request = this.theMoviesDB.request("GET", '/2.1/Movie.browse/en-US/json/f80787836164c7f66c0009097992fe95?order_by=rating&order=desc&genres=28,12,16,35,105,18,27,878,53,10752&genres_selector=or&rating_min=9&min_votes=25&countries=us&page='+this.movieIterator+'&per_page=100&release_min=946688461&release_max='+this.foo.getTime()/1000,{'host':'api.themoviedb.org'});
	request.end();
	request.on('response',function(response){
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			if(!this.moviesTemp[this.movieIterator-1])
				this.moviesTemp[this.movieIterator-1] = '';
			this.moviesTemp[this.movieIterator-1] += chunk;
		});
		response.on('end',function(){
			if(this.movieIterator < 10 && this.moviesTemp[this.movieIterator-1].search('Nothing found.') == -1) {
				this.requestMovies();
			} else {
				_.each(this.moviesTemp,function(i){
					if(i.search('Nothing found.') == -1)
						this.data = this.data.concat(JSON.parse(i));
				});
				_.each(this.data, function(movie){
					movie.picture = movie.posters[2].image.url;
					sys.log(movie.picture);
					movie.description = movie.overview;
				});
			}
			this.movieIterator++;
		});
	});

}