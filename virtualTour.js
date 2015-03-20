
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
		myParser.parse(["Buildings.kml", "Parking.kml", "Phones.kml", "Bus.kml", "PEIFBus.kml", "JacobettiBus.kml", "FridayBus.kml"]);
		function myAfterParse(doc) {
			console.log("Parsing Completed Successfully");
			var layers = [ ];
			layers.push(new Layer(doc.shift(), map, 'buildings'));
			layers.push(new Layer(doc.shift(), map, 'parking'));
			layers.push(new Layer(doc.shift(), map, 'phones'));
			layers.push(new Layer(doc.shift(), map, 'bus'));
			layers.push(new Layer(doc.shift(), map, 'peif-bus'));
			layers.push(new Layer(doc.shift(), map, 'jacobetti-bus'));
			layers.push(new Layer(doc.shift(), map, 'friday-bus'));
			setupClickHandlers(layers);
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

google.maps.event.addDomListener(window, 'load', VirtualTour);