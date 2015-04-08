var kmlNameMap = 
{
	'kml/Buildings.kml'		: 'buildings',
	'kml/Parking.kml' 		: 'parking',
	'kml/Phones.kml'  		: 'phones',
	'kml/Bus.kml' 			: 'bus',
	'kml/PEIFBus.kml' 		: 'peif-bus',
	'kml/JacobettiBus.kml' 	: 'jacobetti-bus',
	'kml/FridayBus.kml' 	: 'friday-bus'
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
					event.stopPropagation();
				});
				$(each.getButtonId() + ' .key-button').click(function(event) {
					event.stopPropagation();
					var key = $(each.getButtonId()).next('.key');
					key.toggleClass('opened');
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
	function isMenuOpened() {
		return $('#menu').hasClass('opened');
	}
	function isSearchOpened() {
		return $('#search').hasClass('opened');
	}
	function toggleSidebar(aBool) {
		var sidebar = $('#side-bar');
		var open = (aBool === undefined) ?
			(isMenuOpened() || isSearchOpened()) : (aBool)
		if(open) {
			sidebar.toggleClass('opened', open);
		} else {
			sidebar.css('background-color', 'transparent');
			setTimeout( function() {
				sidebar.toggleClass('opened', open);
				sidebar.css('background-color', '');
			}, 300);
		}
	}
	function toggleMenu(aBool) {
		$('#menu').toggleClass('opened', aBool);
		adjustMenuHeight();
	}
	function toggleSearch(aBool) {
		var search = $('#search');
		var open = (aBool === undefined) ?
			(!search.hasClass('opened')) : (aBool);
		if(open) {
			toggleSidebar(true);
			search.height(100);
			setTimeout( function() {
				search.toggleClass('opened', open);
				search.height('');
				adjustMenuHeight();
			}, 300);
		} else {
			search.height(100);
			search.toggleClass('opened', open);
			search.height(0);
			toggleSidebar();
			adjustMenuHeight();
		}
	}
	function adjustMenuHeight() {
		if( !isMenuOpened() ) {
			$('#menu').height(0);
			toggleSidebar();
		} else {
			toggleSidebar(true);
			var height = $(document).height() - 60;
			if( isSearchOpened() ) height -= 100;
			$('#menu').height(height);
		}
	}
	$('.detail-button').click(function(even) {
		$('.detail').toggleClass('opened');
	});
	$('#menu-button').click(function(event) {
		toggleMenu();
		event.stopPropagation();
	});
	$('#search-button').click(function(event) {
		toggleSearch();
		event.stopPropagation();
	});
	$('#menu, #side-bar').click(function(event) {
		toggleSearch(false);
		toggleMenu(false);
		adjustMenuHeight();
	});
	$('#search, #menu>*').click(function(event) {
		event.stopPropagation();
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