
function VirtualTour() {
	google.maps.InfoWindow.prototype.opened = false; // to stop the annoying flickering
	var map;
	var defaultCenter = new google.maps.LatLng(46.5595, -87.4037);
	var mouseoverOptions = {fillOpacity: 0.5, strokeOpacity: 1.0, strokeWidth: 5};
	var mouseoutOptions = {fillOpacity: 0.16, strokeOpacity: 1.0, strokeWidth: 10};
	var buildingCenterPointMap = {};
	var buildingWindowPointMap = {};

	/* findEdge will find point directly above the mouse over event that lies just above the polygon */
	function findEdge(point, poly) {
		var isLocationOnEdge = google.maps.geometry.poly.isLocationOnEdge;
		var containsLocation = google.maps.geometry.poly.containsLocation;
		var dist = 1;
		point = new google.maps.LatLng(point.lat()+(dist/=2), point.lng());
		while(dist>=.0000005) {
			if(isLocationOnEdge(point, poly, .000005)) return new google.maps.LatLng(point.lat()+.00005, point.lng());
			if(containsLocation(point, poly))
				point = new google.maps.LatLng(point.lat()+(dist/=2), point.lng());
			else
				point = new google.maps.LatLng(point.lat()-(dist/=2), point.lng());
		}
		return point;
	}

	function moveCenterTo(name) {
		map.setCenter(buildingCenterPointMap[name]);
	}

	function moveCenter(point) {
		if(point === undefined) return;
		map.setCenter(point);
	}

	function initializeMap() {
		var mapOptions = {
			center: defaultCenter,
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		
		var myParser = new geoXML3.parser({ map: map, afterParse: myAfterParse, singleInfoWindow: true, zoom: false });
		myParser.parse('doc.kml');
		function myAfterParse(doc) {
			console.log("Parsing Completed Successfully");
			var myLayer = doc.shift();
			myLayer.placemarks.forEach(function(each) {
				buildingCenterPointMap[each.name] = each.polygon.bounds.getCenter();
				buildingWindowPointMap[each.polygon.title] = findEdge(each.polygon.bounds.getCenter(), each.polygon);
				each.polygon.setOptions(mouseoutOptions);
				google.maps.event.addListener(each.polygon, "mouseover", function(event) {
					//console.log('mouseover');
					this.setOptions(mouseoverOptions);
					this.infoWindow.setOptions(this.infoWindowOptions);
					this.infoWindow.setPosition(buildingWindowPointMap[this.title]);
					if(!this.infoWindow.opened) {
						this.infoWindow.open(map);
						this.infoWindow.opened = true;
					}
				});
				google.maps.event.addListener(each.polygon, "mouseout", function(event) {
					//console.log('mouseout');
					this.setOptions(mouseoutOptions);
					this.infoWindow.close();
					this.infoWindow.opened = false;
				});
				google.maps.event.clearListeners(each.polygon, "click");
				google.maps.event.addListener(each.polygon, "click", function(event) {
					//console.log('click');
					toggleInfo(this.title.replace(/\s+/g, ''));
					moveCenterTo(this.title);
				});
			});
			
			var arg = window.location.search.substring(1);
			if(arg !== undefined && arg != '') {
				toggleInfo(arg.replace(/-+/g, ''));
				moveCenterTo(arg.replace(/-+/g, ' '));
				console.log(arg);
			}
		}
	}

	


	initializeMap();
}

google.maps.event.addDomListener(window, 'load', VirtualTour);