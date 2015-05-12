var Layer = function (layer, map, name, jQuery) {
	if(jQuery === undefined)
		this.jQuery = $;
	else
		this.jQuery = jQuery;
	this.mouseoverOptions = { fillOpacity: 0.75, strokeOpacity: 1.0, stokeWidth: 5 };
	this.mouseoutOptions =  { fillOpacity: 0.16, strokeOpactiy: 1.0, strokeWidth: 10 };
	this.file = layer.baseUrl;
	this.placemarkMap 	= {}; // name => placemark associated with it
	this.map = map;
	this.mapKey = {}; // value (category name) => key (either colored span or marker image)
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
		this.mapKey[placemark.name] = '<img src="' + placemark.style.href + '"/>';
		return placemarkCollection.add(placemark.marker);
	}
	this.mapKey[placemark.name] = '<span style="background-color: '+ placemark.polyline.strokeColor +'"/>';
	placemarkCollection.add(placemark.polyline);
};

Layer.prototype.addPolygonPlacemark = function(placemark) {
	this.mapKey[this.categoryFor(placemark)] = '<span style="background-color: ' + placemark.polygon.fillColor + '"/>';
	this.getPlacemarkNamed(placemark.polygon.title).add(placemark.polygon);
	placemark.polygon.setOptions(this.mouseoutOptions);
	var self = this;
	google.maps.event.addListener(placemark.polygon, 'mouseover', function(event) {
		this.setOptions(self.mouseoverOptions);
	});
	google.maps.event.addListener(placemark.polygon, 'mouseout', function(event) {
		this.setOptions(self.mouseoutOptions);
	});
	google.maps.event.addListener(placemark.polygon, 'click', function(event) {
		// public api from mediaQuery
		if(typeof closeSidebar != 'undefined')
			closeSidebar(false);
	});
};

Layer.prototype.renderMapKey = function() {
	this.mapKeyHtml = "";
	for( var key in this.mapKey ) {
		var value = this.mapKey[key];
		this.mapKeyHtml += '<div>' + value + ' = ' + key + '</div>';
	}
};

Layer.prototype.categoryFor = function(placemark) {
	var desc = placemark.description;
	var catStr = "Category: ";
	var start = desc.indexOf(catStr);
	var end = desc.indexOf("<br>", start);
	if(end > 0)
		return desc.substring(start+catStr.length, end);
	return desc.substring(start+catStr.length);
};

Layer.prototype.clickPlacemark = function(name) {
	var placemark = this.getPlacemarkNamed(name).first();
	// the extra argument at the end is given to suppress an undefined error
	// by the api
	google.maps.event.trigger( placemark, 'click', {} );
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
	var self = this;
	this.jQuery(this.getButtonId()).parent('.layer-option').toggleClass('selected', false);
	this.doPlacemarks(function(each) {
		self.hide(each);
	});
};

Layer.prototype.showPlacemarks = function() {
	this.showing = true;
	var self = this;
	this.jQuery(this.getButtonId()).parent('.layer-option').toggleClass('selected', true);
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

Layer.prototype.argument = function(type, name, openInfo) {
	if(type != this.name) return;
	this.showPlacemarks();
	if(name === undefined || name == '') return;
	var nameWithSpaces = name.replace(/-+/g, ' ');
	for( var key in this.placemarkMap ) {
		if( key == nameWithSpaces ) {
			this.showPlacemarkNamed(nameWithSpaces);
			if (typeof console === "undefined" || typeof console.log === "undefined") {
				console = {};
				console.log = function() {};
			}
			console.log(openInfo);
			if(typeof toggleInfo != 'undefined' && openInfo)
				setTimeout(function() {
					toggleInfo(name.replace(/-+/g, ''));
				}, 200);
			return;
		}
	}
};

Layer.prototype.showPlacemarkNamed = function(aName) {
	this.clickPlacemark(aName);
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
	return this.array[0];
};
