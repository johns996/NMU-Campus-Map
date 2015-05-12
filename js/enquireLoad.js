$(document).ready(function() {

		//first check if modernizr is there (this helps the file browser since it does not load the js properly)
		if(typeof(Modernizr) == "object"){
			//load enquire.js and a polyfill if needed
			Modernizr.load([

				//test need for polyfill
				{
						test: window.matchMedia,
						nope: ["https://www.nmu.edu/sites/all/themes/zen_nmu/js/vendor/matchMedia.js", "https://www.nmu.edu/sites/all/themes/zen_nmu/js/vendor/matchMedia.addListener.js"]
				},

				//next, load enquire
				"https://www.nmu.edu/sites/all/themes/zen_nmu/js/vendor/enquire.min.js",

				//finally, load the scripts that depend on enquire
				"js/mediaQueries.js"
			]);
		}

});