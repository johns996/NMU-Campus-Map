
var map;

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
		document.getElementById("buildings-button").onclick= function () {
			parkingLayer.hidePolygons();
			buildingLayer.showPolygons();
		}
		document.getElementById("parking-button").onclick= function () {
			buildingLayer.hidePolygons();
			parkingLayer.showPolygons();
		}
		myParser.parse(["Buildings.kml", "Parking.kml"]);
		function myAfterParse(doc) {
			console.log("Parsing Completed Successfully");
			buildingLayer = new Layer(doc.shift(), map);
			parkingLayer = new Layer(doc.shift(), map);
			var args = window.location.search.substring(1);
			if( args === undefined ) return;
			args = args.split('?');
			buildingLayer.hidePolygons();
			parkingLayer.hidePolygons();
			if(args[0] == 'Building') buildingLayer.argument(args[1]);
			else if(args[0] == 'Parking') parkingLayer.argument(args[1]);
		}
	}

	


	initializeMap();
}

google.maps.event.addDomListener(window, 'load', VirtualTour);