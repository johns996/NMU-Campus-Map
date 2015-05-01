# NMU-Campus-Map

Campus Map for Northern Michigan University.

There are two html documents. The first is campusMap.html, which is the complete map with searching and layer
toggling available. The second is map.html, which is for embedding into other webpages. The second document depends 
on Google maps javascript api, geoxml.js and ProjectedOverlay.js, Layer.sj, and campusMap.js. Here is a sample 
jQuery command for embedding map.html into a page with the dependencies and an empty div with id map: 

$('#map').load('<path/to/repository>/map.html', function() {
	CampusMap($);
}

To compile SCSS, run `make` from root directory

To update KML, run `./writeKml.py ../../kml/Buildings.kml ../../kml/Buildings2.kml` from the tools/Parser directory
