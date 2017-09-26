// Get data from Yahoo Weather
function getData(url){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",url,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

var jsonObj = JSON.parse(getData('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22London%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='));
var data = jsonObj.query.results.channel;
console.log("data", data);


// Positioning of sun and moon
var sunPath = document.getElementById('sun-path'),
	moonPath = document.getElementById('moon-path'),
	earth = document.getElementById('earth');

// Convert Yahoo Weather data fromAM/PM to 24h time and round it
function convertTo24(dataAmPm){
	var arrayStr = dataAmPm.split('');
	var data24;

	if(arrayStr.includes('p')){
		data24 = parseInt(arrayStr[0]) + 12;
	} else if(arrayStr.includes('a')){
		data24 = parseInt(arrayStr[0]);
	}

	if(parseInt(arrayStr[2])>=3){
		data24 = data24 + 1;
	}

	return data24;
};

var sunrise = convertTo24(data.astronomy.sunrise),
	sunset = convertTo24(data.astronomy.sunset),
	moonrise = sunset - 1,
	moonset = sunrise + 1;

console.log('sunrise', sunrise);
console.log('moonset', moonset);
console.log('sunset', sunset);
console.log('moonrise', moonrise);

function clock(){
	var hrs,
		mins,
		secs;

	setInterval(function(){
		var oldHrs = hrs;

		var date = new Date();
		hrs = date.getHours();
		mins = date.getMinutes();
		secs = date.getSeconds();

		if(hrs<10){
			hrs = '0'+hrs;
		}
		if(mins<10){
			mins = '0'+mins;
		}
		if(secs<10){
			secs = '0'+secs;
		}

		document.getElementById('time').innerHTML = hrs + ':' + mins + ':' + secs;

		if(oldHrs != hrs){
			sunPosition(hrs);
			moonPosition(hrs);
			nightSky(hrs);
		}
	}, 1000);
};

// Daytime
function sunPosition(timeNow){
	var dayDuration = sunset - sunrise;
	var ratioHour = 180 / dayDuration;

	var position;

	if(timeNow<sunrise || timeNow>sunset){
		position = 180;
	} else {
		position = -90 + (timeNow - sunrise) * ratioHour;
	}

	sunPath.style.webkitTransform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
	sunPath.style.mozTransform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
	sunPath.style.transform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
};

// Night time
function moonPosition(timeNow){
	var nightDuration = 24 - moonrise + moonset;
	var ratioHour = 180 / nightDuration;

	var position;
	
	if(timeNow<=moonset || timeNow>=moonrise){
		var factor = timeNow - moonrise;
		if(factor<0) {
			position = -90 + (factor+24) * ratioHour;
		} else {
			position = -90 + factor * ratioHour;
		}
	} else {
		position = 180;
	}

	moonPath.style.webkitTransform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
	moonPath.style.mozTransform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
	moonPath.style.transform = 'translate(-50%, -50%) rotate(' + position + 'deg)';
};

function displayStars(){
	var windowW = window.innerWidth,
		windowH = window.innerHeight,
		nbStars = 20,
		spaceW = windowW / nbStars,
		spaceH = windowH / nbStars;

	for(var index=0; index < nbStars; index++){
		var star = document.createElement("div");
		var where = document.getElementById("sky");
		where.appendChild(star);

		var posLeft = Math.round(Math.random() * (spaceW * (index+1))),
			posTop = Math.round(Math.random() * (spaceH * (index+1)));
		star.style.left += posLeft + 'px';
		star.style.top += posTop + 'px';

		if(Math.random()<0.34){
			star.className += 'star star-l';
		} else if(Math.random()<0.67){
			star.className += 'star star-m';
		} else {
			star.className += 'star star-s';
		}
	};
};

function nightSky(timeNow){
	var body = document.getElementsByTagName('body')[0];

	if(timeNow<sunrise || timeNow>sunset){
		if(body.classList.contains('night')){

		} else {
			document.getElementsByTagName('body')[0].classList.remove('twilight');
			body.className += 'night';
		}
		
		displayStars();
	} else if(timeNow<=moonset || timeNow>=moonrise){
		if(body.classList.contains('twilight')){

		} else {
			document.getElementsByTagName('body')[0].classList.remove('night');
			body.className += 'twilight';
		}
	} else {
		if(body.classList.contains('twilight')){
			document.getElementsByTagName('body')[0].classList.remove('twilight');
		}

		if(body.classList.contains('night')){
			document.getElementsByTagName('body')[0].classList.remove('night');
			var stars = document.getElementsByClassName('star');
			var nbStars = stars.length;

			for(var i = 0; i < nbStars; i++){
				stars[i].remove();
			}
		}
	}
};

window.addEventListener('load', function(){
	clock();
});