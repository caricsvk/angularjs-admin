'use strict';

function MiloRequire(jsPrefix, base, version) {

	var self = this;

	this.jsPrefix = jsPrefix;
	this.base = base || window.location.pathname;
	this.version = version;
	this.scripts = {};

	this.load = function (src, dependencies, callback) {
		// console.log('MiloRequire.load start', new Date().getTime(), src);
		var self = this;
		var script = self.getScriptObj(src, dependencies, callback);

		if (script.element === null) {
			script.element = document.createElement(script.src.split('?')[0].endsWith('html') ? 'noscript' : 'script');
			script.element.type = 'text/javascript';
			$(script.element).load(script.src, function (response, status) {
				if (status === 'error') {
				// 	setTimeout(function () {
				// 		self.load(src);
				// 	}, 2000);	
				} else {
					script.response = response;
					script.loaded = true;
					self.execute(script);
				}
			});
			
		} else if (script.executed) {
			//already executed = only trigger callback
			if (typeof callback === "function") {
				callback(script.response);
			}
		}
	};

	this.execute = function (script) {
		if ( ! script.executed && script.loaded && this.checkDependencies(script.dependencies)) {
			// console.log('execute', new Date().getTime(), script);
			// document.getElementsByTagName('head')[0].appendChild(script.element);
			if (script.src.split('?')[0].endsWith('json')) {
				script.response = eval('(function () {return ' + script.response + '} ());');
			} else {
				$('body').append(script.element);
			}
			if (typeof script.callback === "function") {
				script.callback(script.response);
			}
			script.executed = true;
			for (var src in this.scripts) {
				this.execute(this.scripts[src]);
			}	
		}
	};

	this.resolveSrc = function (src) {
		if (this.jsPrefix && src.substr(0,1) !== "/" && src.substr(0,4) !== "http") {
			src = base + this.jsPrefix + src;
		}
		if (this.version && src.indexOf("?") == -1) {
			src += "?" + this.version;
		}
		return src;
	}

	this.checkDependencies = function (dependencies) {
		for (var i = 0; dependencies && i < dependencies.length; i ++) {
			var src = this.resolveSrc(dependencies[i]);
			if ( ! this.scripts[src] || ! this.scripts[src].executed) {
				return false;
			}
		}
		return true;
	};

	this.getScriptObj = function (src, dependencies, callback) {
		src = this.resolveSrc(src);
		var script = this.scripts[src];
		if (! script) {
			this.scripts[src] = {
				src: src,
				element: null,
				dependencies: dependencies,
				callback: callback,
				loaded: false,
				executed: false
			};
		} else {
			// add callback
			var oldCallback = typeof script.callback === "function" ? script.callback : function () {};
			var callback = typeof callback === "function" ? callback : function () {};
			(function (oldCallback, callback) {
				script.callback = function () {
						oldCallback.apply(self, arguments);
						callback.apply(self, arguments);;
					};
			}(oldCallback, callback));		
		}
		return this.scripts[src]; 
	};

	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

};