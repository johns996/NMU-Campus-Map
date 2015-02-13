var Layer = function (layer, map) {
	this.mouseoverOptions = { fillOpacity: 0.75, strokeOpacity: 1.0, stokeWidth: 5 };
	this.mouseoutOptions =  { fillOpacity: 0.16, strokeOpactiy: 1.0, strokeWidth: 10 };
	this.file = layer.baseUrl;
	this.centerPointMap = {}; // name => center of polygon
	this.windowPointMap = {}; // name => info window position point
	this.polygonMap 	= {}; // name => polygon associated with it
	this.map = map;
	var self = this;
	layer.placemarks.forEach(function(each) {
		//each.polygon.setMap(null);
		self.centerPointMap[each.name] = each.polygon.bounds.getCenter();
		self.windowPointMap[each.polygon.title] = self.findEdge(each.polygon.bounds.getCenter(), each.polygon);
		self.getPolygonNamed(each.polygon.title).add(each.polygon);
		each.polygon.setOptions(self.mouseoutOptions);
		google.maps.event.addListener(each.polygon, 'mouseover', function(event) {
			this.setOptions(self.mouseoverOptions);
			this.infoWindow.setOptions(this.infoWindowOptions);
			this.infoWindow.setPosition(self.windowPointMap[this.title]);
			this.infoWindow.open(self.map);
		});
		google.maps.event.addListener(each.polygon, 'mouseout', function(event) {
			this.setOptions(self.mouseoutOptions);
		});
		google.maps.event.clearListeners(each.polygon, 'click');
		google.maps.event.addListener(each.polygon, 'click', function(event) {
			toggleInfo( this.title.replace(/\s+/g, '') );
			self.moveCenterTo( this.title );
		});
	});
};

Layer.prototype.moveCenterTo = function(name) {
	this.moveCenter( this.centerPointMap[name] );
};

Layer.prototype.moveCenter = function(point) {
	if( point === undefined ) return;
	console.log(point);
	this.map.setCenter( point );
};

Layer.prototype.mouseoverPolygon = function(name) {
	google.maps.event.trigger( this.getPolygonNamed(name).first(), 'mouseover' );
};

Layer.prototype.findEdge = function(point, poly) {
	var isLocationOnEdge = google.maps.geometry.poly.isLocationOnEdge;
	var containsLocation = google.maps.geometry.poly.containsLocation;
	var LatLng = google.maps.LatLng;
	var dist = 1;
	point = new LatLng( point.lat() + (dist/=2), point.lng() );
	while( dist >= .0000005 ) {
		if( isLocationOnEdge( point, poly, .000005 ) ) return new LatLng( point.lat() + .000005, point.lng() );
		if( containsLocation( point, poly ) )
			point = new LatLng( point.lat() + (dist/=2), point.lng() );
		else
			point = new LatLng( point.lat() - (dist/=2), point.lng() );
	}
	return point;
};

Layer.prototype.doPolygons = function(block) {
	for( var key in this.polygonMap ) {
		var obj = this.polygonMap[key];
		block(obj);
	}
}

Layer.prototype.hidePolygons = function () {
	this.doPolygons(function(each) {
		each.setMap(null);
	});
};

Layer.prototype.showPolygons = function() {
	this.doPolygons(function(each) {
		each.setMap(this.map);
	});
};

Layer.prototype.getPolygonNamed = function(name) {
	if( this.polygonMap[name] === undefined )
		this.polygonMap[name] = new PolygonCollection();
	return this.polygonMap[name];
};

var PolygonCollection = function () {
	this.array = [];
};

PolygonCollection.prototype.add = function(polygon) {
	this.array.push(polygon);
};

PolygonCollection.prototype.setMap = function(map) {
	this.array.forEach(function(each) {
		each.setMap(map);
	});
};

PolygonCollection.prototype.first = function(map) {
	return this.array[1];
};