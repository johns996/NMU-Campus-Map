<?php

$blockIdMap = [
	'Devos' 										=> 76,
	'ArtandDesign' 									=> 77,
	'Library' 										=> 78,
	'WestScienceFacility'							=> 79,
	'NewScienceFacility'							=> 79,
	'JohnX.JamrichHall'								=> 80,
	'ThomasFineArts' 								=> 81,
	'Reynolds' 										=> 82,
	'JacobettiCenter'								=> 83,
	'SuperiorDome' 									=> 97,
	'PhysicalEducationInstructionalFacility(PEIF)'	=> 98,
	'VandamentArena' 								=> 100,
	'BerryEventsCenter' 							=> 102,
	'UniversityCenter'								=> 104,
	'Hedgcock' 										=> 107,
	'Whitman' 										=> 108,
	'McClintock' 									=> 109,
	'Cohodas' 										=> 110,
	'ForestRobertsTheater'							=> 111,
	'GriesHall'										=> 112,
	'LearningResourceCenter'						=> 113,
	'PublicSafety'									=> 153
];

$nodeIdMap = [
	'LincolnApartments' 				=> 62,
	'NorwoodApartments' 				=> 65,
	'CenterStreetApartments(Norwood)' 	=> 65,
	'SummitApartments' 					=> 74,
	'CenterStreetApartments(Summit)' 	=> 74,
	'LincolnTownhouses' 				=> 80,
	'WoodlandApartments'				=> 89,
	'GantHall' 							=> 109,
	'Spooner' 							=> 113,
	'PayneHall' 						=> 125,
	'VanAntwerpHall'					=> 137,
	'WestHall' 							=> 139,
	'SpaldingHall' 						=> 151,
	'HalversonHall' 					=> 156,
	'MeylandHall' 						=> 164,
	'MagersHall'						=> 177,
	'HuntHall' 							=> 181
];

$name = trim($_POST['name']);
$iBlockID = $blockIdMap[$name];
$iNodeID = $nodeIdMap[$name];
if( $iBlockID != NULL ) {
	require_once "/htdocs/cmsphp/Admin/MiscInterfaces/Drupal-BlockInclude.php";
} else if( $iNodeID != NULL ) {
	$strDrupalSite = 'Housing';
	require_once "/htdocs/cmsphp/Admin/MiscInterfaces/Drupal-NodeInclude.php";
} else {
	print "<h2>$name</h2><br>\n<p>Not found</p>";
}

?>