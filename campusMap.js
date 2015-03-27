var kmlNameMap = 
{
	'Buildings.kml'		: 'buildings',
	'Parking.kml' 		: 'parking',
	'Phones.kml'  		: 'phones',
	'Bus.kml' 			: 'bus',
	'PEIFBus.kml' 		: 'peif-bus',
	'JacobettiBus.kml' 	: 'jacobetti-bus',
	'FridayBus.kml' 	: 'friday-bus'
};

var map;
var CampusMap = function () {
	var defaultCenter = new google.maps.LatLng(46.5595, -87.4037);
	var buildingLayer;
	var parkingLayer;

	function initializeMap() {
		var mapOptions = {
			center: defaultCenter,
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP // HYBRID, TERRAIN, SATELLITE
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		var myParser = new geoXML3.parser({ map: map, afterParse: myAfterParse, singleInfoWindow: true, zoom: false });
		function setupClickHandlers(layers) {
			layers.forEach(function(each) {
				each.hidePlacemarks();
				$(each.getButtonId()).next('.key').html(each.mapKeyHtml);
				$(each.getButtonId()).click(function(event) {
					each.togglePlacemarks();
				});
			});
		}
		myParser.parse(Object.keys(kmlNameMap));
		function myAfterParse(doc) {
			console.log("Parsing Completed Successfully");
			var layers = [];
			for( var key in kmlNameMap ) {
				var value = kmlNameMap[key];
				layers.push(new Layer(doc.shift(), map, value));
			}
			setupClickHandlers(layers);
			setupSearch(layers);
			var args = window.location.search.substring(1);
			if( args === undefined ) return;
			args = args.split('?');
			layers.forEach(function(layer) {
				layer.argument(args[0], args[1]);
			});
		}
	}

	initializeMap();
}

google.maps.event.addDomListener(window, 'load', CampusMap);

$(document).ready(function() {
	$('#shuttles').slideUp();
	$('.shuttle-button').click(function(event) {
		$('#shuttles').toggleClass('opened');
		if($('#shuttles').hasClass('opened')) 
			$('#shuttles').slideDown();
		else
			$('#shuttles').slideUp();
	});
	$('.detail-button').click(function(even) {
		$('.detail').toggleClass('opened');
	});
	$('.menu-button').click(function(event) {
		$('#menu').toggleClass('opened');
	});
	$('.search-button').click(function(event) {
		var addClass = !$('#search').hasClass('opened');
		$('#search').toggleClass('opened');
		var hasClass = $('#search').hasClass('opened');
	});
	function setSearchPlaceholder(aString) {
		var placeholder = 'Search ' + aString.charAt(0).toUpperCase() + aString.slice(1) + '...';
		$('#search-criteria').attr('placeholder', placeholder);
	}
	setSearchPlaceholder($('input[name=search-option]:checked').val())
	$('input[name=search-option]:radio').on('change', function() {
		setSearchPlaceholder($(this).val());
	});
});

function toggleInfo(name) {
	var open = $('#info').attr('opened');
	if(open === undefined || open != name) openInfo(name);
	else closeInfo();
}
function openInfo(name) {
	if(name === undefined || name == '') return;
	//if( !$('.detail').hasClass('opened') ) $('.detail').slideDown();
	$('#info').toggleClass('opened', true);
	$('.detail').toggleClass('opened', true);
	$('#detail').load('Buildings/'+name+'.html', initSlideshow);
}
function closeInfo() {
	$('#info').toggleClass('opened', false);
	$('.detail').toggleClass('opened', false);//.slideUp();
}
function initSlideshow() {
	$('.cycle-slideshow').cycle();
}

function setupSearch(layers) {

	initSearchResults();
	initEventHandlers();

	function initSearchResults() {
		layers.forEach(function(layer) {
			var names = Object.keys(layer.placemarkMap).sort(naturalCompare);
			names.forEach(function(name) {
				var result = '<div type="' + layer.name + '">' + name + "</div>\n";
				$('#search-results').append(result);
			});
		});
	}
	function narrowSearchResults(text) {
		var type = $('input[name=search-option]:checked').val();
		$('#search-results>div').each(function() {
			var searchResult = $(this).text().toLowerCase().replace(/\ /g, '');
			var display = (searchResult.indexOf(text) !== -1) && type == $(this).attr('type');
			$(this).css('display', display ? 'block' : 'none');
		});
	}
	function initEventHandlers() {
		$('#search-criteria').focus(function() {
			var text = $(this).val().toLowerCase().replace(/\ /g, '');
			if(text != '') $('#search-results').css('display', 'block');
			narrowSearchResults(text);
		});
		$('#search-criteria').focusout(function() {
			setTimeout(function() {
				$('#search-results').css('display', 'none');
			}, 200);
		});
		$('#search-criteria').on('keyup', function() {
			var text = $(this).val().toLowerCase().replace(/\ /g, '');
			if(text != '') $('#search-results').css('display', 'block');
			narrowSearchResults(text);
		});
		$('#search-results>div').each(function() {
			$(this).click(function() {
				var name = $(this).text().replace(/\ /g, '-');
				var type = $('input[name=search-option]:checked').val();
				layers.forEach(function(each) {
					each.argument(type, name);
				});
			});
		});
	}
}

function naturalCompare(a, b) {
    var ax = [], bx = [];

    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}