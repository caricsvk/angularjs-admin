'use strict';

(function (app) {

	//LOADING MODULES METHODS AND PROPS
	app.ccLoading = {loadedJs: [], loadedCss: [], depQueue: {}, callback: {}, inProgress: [] },

	app.checkDependencies = function (dependencies) {
		if (! dependencies)
			return true;
		for (var i = 0; i < dependencies.length; i ++) {
			var src = dependencies[i].substr(0,2) !== "//" && dependencies[i].substr(0,4) !== "http" ? self.location + "js/" + dependencies[i] : dependencies[i];
			if (this.ccLoading.loadedJs.indexOf(src) === -1)
				return false;
		}
		return true;
	};

	app.ccLoad = function (src, dependencies, callback) {
		var self = this;

		if (self.jsPrefix && src.substr(0,1) !== "/" && src.substr(0,4) !== "http") {/*fill full url path if it is not*/
			src = window.location.pathname + self.jsPrefix + src;
		}
		if (self.version && src.indexOf("?") == -1) {
			src += "?" + self.version;
		}
		//store callbacks
		var oldCallback = typeof this.ccLoading.callback[src] === "function" ? this.ccLoading.callback[src] : function () {};
		var callback = typeof callback === "function" ? callback : function () {};
		(function (oldCallback, callback) {
			self.ccLoading.callback[src] = function () {
					oldCallback();
					callback();
				};
		}(oldCallback, callback));

		if (this.ccLoading.inProgress.indexOf(src) >= 0)
			return;

		if (this.ccLoading.loadedJs.indexOf(src) >= 0) { //script is loaded

			if (typeof callback === "function")
				callback();
		} else if (this.checkDependencies(dependencies)) {

			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = src;
			script.onload = function () {
				//alert("onload");
				loadCallback(src);
			};
			script.onreadystatechange = function () {
				//alert("onreadystatechange " + this.readyState + " : " + (this.readyState === "complete" || this.readyState === "loaded"));
				if(this.readyState === "complete" || this.readyState === "loaded")
					loadCallback(src);
			};
			script.onerror = function() {
				delete self.ccLoading.inProgress[ self.ccLoading.inProgress.indexOf(src) ];
				setTimeout(function () {
					// self.ccLoad(src);
				}, 2000);
			};
			this.ccLoading.inProgress.push(src);
			delete this.ccLoading.depQueue[src];
			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			this.ccLoading.depQueue[src] = dependencies;
		}

	};

	app.ccLoadBlock = function (src) {
		if (this.jsPrefix && src.substr(0,2) !== "//" && src.substr(0,4) !== "http") {/*fill full url path if it is not*/
			src = this.jsPrefix + src;
		}
		if (this.version) {
			src += "?" + this.version;
		}
		if (this.ccLoading.loadedJs.indexOf(src) < 0) { //script is not loaded
			document.write('\x3Cscript type="text/javascript" src="' + src + '">\x3C/script>');
			this.ccLoading.loadedJs.push(src);
		}
	};

	app.ccLoadCss = function (href, addAttrs) {
		var self = this;
		if (href.substr(0,2) !== "//")
			href = this.location + "/style/" + href;
		if (this.ccLoading.loadedCss.indexOf(href) === -1) {
			var link = document.createElement("link");
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = href;
			for (var attrName in addAttrs)
				link[attrName] = addAttrs[attrName];
			onload = function () {
				self.ccLoading.loadedCss.push(href);
			};
			document.getElementsByTagName('head')[0].appendChild(link);
		};
	};

	var loadCallback = function (src) {
		//console.log("load callback " + src);
		app.ccLoading.loadedJs.push(src);
		delete app.ccLoading.inProgress[ app.ccLoading.inProgress.indexOf(src) ];
		if (typeof app.ccLoading.callback[src] === "function") {
			app.ccLoading.callback[src]();
			delete app.ccLoading.callback[src];
		}
		for (var scriptSrc in app.ccLoading.depQueue) {
			app.ccLoad(scriptSrc, app.ccLoading.depQueue[scriptSrc]);
		}
	};

} (window.APP));