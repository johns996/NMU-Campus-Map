
var map;
var layers;
function VirtualTour () {
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
		/*layers = [];
		var path = 'http://euclid.nmu.edu/~jfridstr/VirtualTour/'
		layerUrls = ["Buildings", "Parking", "Phones", "Bus"];
		layerUrls.forEach(function(each) {
			var layer = new google.maps.KmlLayer({
				url: getFullPath(each),
				suppressInfoWindows: false,
				preserveViewport: true,
				map: null
			});
			$(getButtonId(each)).click(function(event) {
				if( layer.getMap() == null )
					layer.setMap(map);
				else
					layer.setMap(null);
			});
			layers.push(layer);
			google.maps.event.addListener(layer, 'click', function(mklEvent) {
				var hello = 'hello';
			});
		});
		function getFullPath(aName) {
			return path + aName + '.kml';
		}
		function getButtonId(aName) {
			return '#' + aName.toLowerCase() + '-button';
		}*/
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
		myParser.parse(["Buildings.kml", "Parking.kml", "Phones.kml", "Bus.kml"]);
		function myAfterParse(doc) {
			console.log("Parsing Completed Successfully");
			var layers = [ ];
			layers.push(new Layer(doc.shift(), map, 'buildings'));
			layers.push(new Layer(doc.shift(), map, 'parking'));
			layers.push(new Layer(doc.shift(), map, 'phones'));
			layers.push(new Layer(doc.shift(), map, 'bus'));
			setupClickHandlers(layers);
			var args = window.location.search.substring(1);
			if( args === undefined ) return;
			args = args.split('?');
			if(args[0] == 'Building') buildingLayer.argument(args[1]);
			else if(args[0] == 'Parking') parkingLayer.argument(args[1]);
		}
	}

	


	initializeMap();
}

google.maps.event.addDomListener(window, 'load', VirtualTour);