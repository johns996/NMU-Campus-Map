var Layer = function (layer, map, name) {
	this.mouseoverOptions = { fillOpacity: 0.75, strokeOpacity: 1.0, stokeWidth: 5 };
	this.mouseoutOptions =  { fillOpacity: 0.16, strokeOpactiy: 1.0, strokeWidth: 10 };
	this.file = layer.baseUrl;
	this.centerPointMap = {}; // name => center of polygon
	this.windowPointMap = {}; // name => info window position point
	this.placemarkMap 	= {}; // name => placemark associated with it
	this.map = map;
	this.mapKey = {}; // category => color
	this.mapKeyHtml;
	this.name = name;
	this.showing = false;
	var self = this;
	layer.placemarks.forEach(function(each) {
		self.addPlacemark(each);
	});
	this.renderMapKey();
};

Layer.prototype.addPlacemark = function(placemark) {
	if( placemark.polygon )
		return this.addPolygonPlacemark(placemark);
	var placemarkCollection = this.getPlacemarkNamed(placemark.name);
	if( placemark.marker ) {
		this.mapKey[placemark.name] = '#' + placemark.style.color.substr(2);
		return placemarkCollection.add(placemark.marker);
	}
	this.mapKey[placemark.name] = placemark.polyline.strokeColor;
	placemarkCollection.add(placemark.polyline);
};

Layer.prototype.addPolygonPlacemark = function(placemark) {
	this.mapKey[this.categoryFor(placemark)] = placemark.polygon.fillColor;
	//this.centerPointMap[placemark.name] = placemark.polygon.bounds.getCenter();
	//this.windowPointMap[placemark.polygon.title] = this.findEdge(placemark.polygon.bounds.getCenter(), placemark.polygon);
	this.getPlacemarkNamed(placemark.polygon.title).add(placemark.polygon);
	placemark.polygon.setOptions(this.mouseoutOptions);
	google.maps.event.addListener(placemark.polygon, 'mouseover', function(event) {
		this.setOptions(this.mouseoverOptions);
	});
	google.maps.event.addListener(placemark.polygon, 'mouseout', function(event) {
		this.setOptions(this.mouseoutOptions);
	});
};

Layer.prototype.renderMapKey = function() {
	this.mapKeyHtml = '';
	for( var key in this.mapKey ) {
		var value = this.mapKey[key];
		this.mapKeyHtml += '<div><span style="background-color: '+ value +'"></span> = '+ key +'</div>';
	}
};

Layer.prototype.categoryFor = function(placemark) {
	var desc = placemark.description;
	var catStr = "Category: ";
	var start = desc.indexOf(catStr);
	var end = desc.indexOf("<br>", start);
	return desc.substring(start+catStr.length, end);
};

Layer.prototype.moveCenterTo = function(name) {
	this.moveCenter( this.centerPointMap[name] );
};

Layer.prototype.moveCenter = function(point) {
	if( point === undefined ) return;
	console.log(point);
	this.map.setCenter( point );
};

Layer.prototype.clickPlacemark = function(name) {
	google.maps.event.trigger( this.getPlacemarkNamed(name).first(), 'click' );
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

Layer.prototype.doPlacemarks = function(block) {
	for( var key in this.placemarkMap ) {
		var obj = this.placemarkMap[key];
		block(obj);
	}
}

Layer.prototype.hidePlacemarks = function () {
	this.showing = false;
	var key = $(this.getButtonId()).next('.key');
	if( key.hasClass('opened') ) {
		key.removeClass('opened');
		//key.slideUp();
	}
	var self = this;
	this.doPlacemarks(function(each) {
		self.hide(each);
	});
};

Layer.prototype.showPlacemarks = function() {
	this.showing = true;
	var key = $(this.getButtonId()).next('.key');
	if( !key.hasClass('opened') ) {
		key.addClass('opened');
		//key.slideDown();
	}
	var self = this;
	this.doPlacemarks(function(each) {
		self.show(each);
	});
};

Layer.prototype.hide = function(placemark) {
	placemark.setMap(null);
}

Layer.prototype.show = function(placemark) {
	placemark.setMap(this.map);
}

Layer.prototype.togglePlacemarks = function() {
	if( this.showing )
		this.hidePlacemarks();
	else
		this.showPlacemarks();
};

Layer.prototype.getPlacemarkNamed = function(name) {
	if( this.placemarkMap[name] === undefined )
		this.placemarkMap[name] = new Placemark();
	return this.placemarkMap[name];
};

Layer.prototype.argument = function(arg) {
	if(arg === undefined || arg == '') return;
	this.showPlacemarks();
	toggleInfo(arg.replace(/-+/g, ''));
	this.moveCenterTo(arg.replace(/-+/g, ' '));
	this.clickPlacemark(arg.replace(/-+/g, ' '));
};

Layer.prototype.getButtonId = function() {
	return '#' + this.name + '-button';
};

var newPlacemark = function() {
	return new Placemark()
};

var Placemark = function () {
	this.array = [];
};

Placemark.prototype.add = function(placemark) {
	this.array.push(placemark);
};

Placemark.prototype.setMap = function(map) {
	this.array.forEach(function(each) {
		each.setMap(map);
	});
};

Placemark.prototype.first = function(map) {
	return this.array[1];
};