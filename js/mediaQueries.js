	function isMenuOpened() {
		return $('#menu').hasClass('opened');
	}
	function isSearchOpened() {
		return $('#search').hasClass('opened');
	}
	function adjustMenuHeight() {
		if( !isMenuOpened() ) {
			$('#menu').height(0);
		} else {
			var height = $(document).height()
			height -= $('.menu-bar').height();
			height -= $('#search').height();
			$('#menu').height(height);
		}
	}

// Create namespace for Campus Map Sidebar related events
//var CMSidebar = function() {

/* Global functions */
// Closes the sidebar regardless of how it is rendered
function closeSidebar() {
	toggleMenu(false);
	toggleSearch(false);
}
var toggleSidebar = function(aBool) {
	var sidebar = $('#sidebar');
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
};
var toggleMenu = function (aBool) {
	$('#menu').toggleClass('opened', aBool);
	toggleSidebar();
	adjustMenuHeight();
};
var toggleSearch = function(aBool) {
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
};

$(document).ready(function() {
	// Global funtions are initialized with the defaults
	var defaultSidebarToggle = toggleSidebar;
	var defaultMenuToggle = toggleMenu;
	var defaultSearchToggle = toggleSearch;
	toggleSidebar = defaultSidebarToggle;
	toggleMenu = defaultMenuToggle;
	toggleSearch = defaultSearchToggle;
	enquire.register("(max-width:767px)", {
		match : function() {
			$('#search').toggleClass('opened', false);
			$('#menu').toggleClass('opened', false);
			$('#sidebar').toggleClass('opened', false);
			adjustMenuHeight();
			toggleSidebar = defaultSidebarToggle;
			toggleMenu = defaultMenuToggle;
			toggleSearch = defaultSearchToggle;
		}
	});
	enquire.register("(min-width:768px) and (max-width:1199px)", {
		match : function() {
			$('#search').toggleClass('opened', true);
			$('#menu').toggleClass('opened', true);
			$('#sidebar').toggleClass('opened', false);
			adjustMenuHeight();
			toggleSidebar = function(aBool) {
				var open = (aBool === undefined) ? 
					(!$('#sidebar').hasClass('opened')) : (aBool);
				$('#sidebar').toggleClass('opened', open);
			};
			toggleMenu = function(aBool) {
				toggleSidebar(aBool);
			};
			toggleSearch = function(aBool) { };
		}
	});
	enquire.register("(min-width:1200px)", {
		match : function() {
			$('#search').toggleClass('opened', true);
			$('#menu').toggleClass('opened', true);
			$('#sidebar').toggleClass('opened', true);
			adjustMenuHeight();
			toggleSidebar = function(aBool) { };
			toggleMenu = function(aBool) { };
			toggleSearch = function(aBool) { };
		}
	});

	$('.detail-button').click(function(event) {
		closeInfo();
		event.stopPropagation();
	});
	$('#menu-button').click(function(event) {
		toggleMenu();
		event.stopPropagation();
	});
	$('#search-button').click(function(event) {
		toggleSearch();
		event.stopPropagation();
	});
	$('#menu, #sidebar').click(function(event) {
		toggleSearch(false);
		toggleMenu(false);
		toggleSidebar(false);
		adjustMenuHeight();
	});
	$('#search, #menu>*, .detail').click(function(event) {
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
	openInfo(name);
}
function openInfo(name) {
	if(name === undefined || name == '') return;
	$('.detail').toggleClass('opened', true);
	//$('#detail').load('Buildings/'+name+'.html', initSlideshow);
	$.ajax({
		method: 'POST',
		url: 'requests.php',
		data: { name: name },
		context: detail
	}).done(function(data) {
		$(this).html(data);
	});
	toggleMenu(true);
}
function closeInfo() {
	toggleMenu(false);
	$('.detail').toggleClass('opened', false);
}
function initSlideshow() {
	$('.cycle-slideshow').cycle();
}
