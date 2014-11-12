//set up weatherApp object
var weatherApp = {};

weatherApp.init = function() {
	weatherApp.$submit = $('#get-weather');
	weatherApp.$cityField = $('#city');
	weatherApp.$forecast = $('#forecast');
	weatherApp.$changeCity = $('#change');

	weatherApp.$submit.on('submit', function(e){
		e.preventDefault();
		weatherApp.getWeather();
	});

	weatherApp.$changeCity.on('click', function(e){
		e.preventDefault();
		weatherApp.clearForecast();
	})

}

//incomplete field function

//Submit function
weatherApp.getWeather = function(){
	weatherApp.city = weatherApp.$cityField.val();
	if (weatherApp.city !== ''){
		weatherApp.getData(weatherApp.city);
	}
	else {
		//Error message to say there's nothing selected
		swal({
			title: 'Whoops!',
			text: 'Enter a city name',
			type: 'error'
		});
	}
};

//AJAX API call
weatherApp.getData = function(city){

	$.ajax({
		url: 'http://api.openweathermap.org/data/2.5/forecast/daily',
		type: 'GET',
		dataType: 'jsonp',
		// timeout: 3000,
		data: {
			APPID: '7699bac00fc6df4c0ff4b215ca742fd0',
			q: city,
			cnt: 7,
			units: 'metric'
		},
		//TO DO error message for wrong city name
		success: function(result){
			weatherApp.city = result.city.name;
			weatherApp.success = true
			weatherApp.parseData(result.list);
		},
		error: function(){
			weatherApp.cityNotFound(city);
		}
	});
}

//Parse data loop
weatherApp.parseData = function(data){
	weatherApp.forecast = [];
	weatherApp.pressure = 0
	$.each(data, function(i,piece){
		weatherApp.forecast.push({
			date: weatherApp.getDate(i),
			dailyHigh: Math.round(piece.temp.max),
			dailyLow: Math.round(piece.temp.min),
			iconsrc: 'http://openweathermap.org/img/w/' + piece.weather['0'].icon + '.png'
		})
		weatherApp.pressure += piece.pressure;
	});
	weatherApp.avgPressure = Math.round(weatherApp.pressure/weatherApp.forecast.length);
	weatherApp.updateDOM(weatherApp.forecast, weatherApp.avgPressure);
}

//get dates for next 7 days
weatherApp.getDate = function(i){
	    var today = new Date();
		today.setDate(today.getDate() + i);
		var dd = today.getDate();
		var monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];
		var month = monthNames[today.getMonth()];
		var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var day = dayNames[today.getDay()];
		return(day + ' ' + month + ' ' + dd);
}

//Populate fields with data
weatherApp.updateDOM = function(forecast, pressure){
	//create day divs
	$.each(forecast, function(i,day){
		var dayofweek = $('<div>').addClass('day'+i+' day').append('<p class="date">' + day.date + '</p><img class="logo" src='+day.iconsrc+'><span class="temp high">' + day.dailyHigh + '</span><span class="temp low">' + day.dailyLow + '</span>');
		weatherApp.$forecast.append(dayofweek);
	});
	//header stuff
	weatherApp.clearForm();
	//chart stuff
	weatherApp.createChart(forecast);
	weatherApp.pressureIndicator(pressure);
}

weatherApp.createChart = function(forecast){
	weatherApp.$forecast.append('<canvas id="weatherChart" class="chart" width="685" height="300"></canvas>')
	weatherApp.ctx = $('#weatherChart').get(0).getContext('2d');
	weatherApp.options = {
		scaleShowGridLines : false,
		datasetFill: false
	}
	weatherApp.data = {
		labels: [],
		datasets: [{
			label: 'Weekly highs',
			fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
			data: []
		},
		{
			label: 'Weekly lows',
            fillColor: 'rgba(151,187,205,0.2)',
            strokeColor: 'rgba(151,187,205,1)',
            pointColor: 'rgba(151,187,205,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(151,187,205,1)',
			data: []
		}]
	}
	$.each(forecast, function(i,piece){
		weatherApp.data.labels.push(forecast[i].date);
		weatherApp.data.datasets[0].data.push(forecast[i].dailyHigh);
		weatherApp.data.datasets[1].data.push(forecast[i].dailyLow);
	});
	var myLineChart = new Chart(weatherApp.ctx).Line(weatherApp.data, weatherApp.options)
}

weatherApp.pressureIndicator = function(pressure){
	var pressureSystem = $('<p>').addClass('pressure');
	if (pressure <= 1000) {
		pressureSystem.html('The average pressure will be '+ pressure +'mb. There\'s a low pressure system. It might rain!');
	} else if (pressure >= 1020) {
		pressureSystem.html('The average pressure will be '+ pressure +'mb this week. There\'s a low pressure system. It\'ll probably be a dry week!');
	} else {
		pressureSystem.html('The average pressure will be '+ pressure +'mb this week. Check the forecast!');
	};
	weatherApp.$forecast.append(pressureSystem);
}

weatherApp.clearForm = function(){
	weatherApp.$submit.fadeOut(function(){
		var headline = $('<h2>').addClass('city').html('<span class="city">' + weatherApp.city + '\'s</span> 7-day forecast');
		$('#input').append(headline);
		$('h2.city').fadeIn();
		weatherApp.$cityField.val('');
		weatherApp.$changeCity.fadeIn();
	});
}

weatherApp.clearForecast = function(){
	weatherApp.$forecast.html('');
	$('h2.city').fadeOut(function(){
		weatherApp.$changeCity.fadeOut();
		weatherApp.$submit.fadeIn();
		$('h2.city').html('');
	});
}


//Error function
weatherApp.cityNotFound = function(city){
	swal({
		title: 'Whoops!',
		text: city + ' wasn\'t found! Check your spelling and try again!',
		type: 'error'
	});
}

$(function() {
	weatherApp.init();
});