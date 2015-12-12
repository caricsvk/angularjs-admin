'use strict';

APP.service('GlobalService', ['$resource', '$http', '$q', function ($resource, $http, $q) {

	var self = this;
	var scrollPositions = {};
	var entityInstances = {};
	var enums = {};
	var i18n = {app: {}};
	var config = window.SETTINGS;
	var tableServices = {};

	self.getConfig = function (key) {
		var fromCookie = self.getCookie(key);
		if (fromCookie && fromCookie !== 'undefined') {
			return fromCookie;
		}
		return key ? config[key] : config;
	}

	self.setConfig = function (key, value, storeInCookie) {
		config[key] = value;
		if (storeInCookie) {
			self.setCookie(key, value);
		}
	}

	self.setI18N = function (nav, data) {
		i18n[nav] = data;
	}

	self.i18n = function (nav, index) {
		if (typeof i18n[nav] === undefined) {
			i18n[nav] = {};
			//TODO loadJSON
		}
		var message = index;
		if (typeof i18n[nav] != 'undefined' && i18n[nav] != null && i18n[nav][index]) {
			message = i18n[nav][index];
		} else if (i18n['app'][index]) {
			message = i18n['app'][index];
		}
		return message;
	}

	self.scrollPosition = function (key, value) {
		if (value) {
			scrollPositions[key] = value;
		}
		return scrollPositions[key];
	}

	self.getEntityInstances = function (entityEndpoint) {
		if (! entityInstances[entityEndpoint]) {
			entityInstances[entityEndpoint] = $q.defer();
			$resource(self.getConfig().servicesLocation + entityEndpoint)
				.query(function (data) {
					if (data && data.length) { // add empty line at the beginning
						data.unshift({"name":""});
					}
					/* dirty fix when request is cancelled/aborted
					 the error block is implementing the same because
					 I assume after fix it will be handled through that
					 */
//					if (! response || ! response.$resolved) {
//						delete entityInstances[entityEndpoint];
//					}
					entityInstances[entityEndpoint].resolve(data);
				}, function () {
					delete entityInstances[entityEndpoint];
				}
			);
		}
		return entityInstances[entityEndpoint].promise;
	};

	self.removeEntityInstances = function (entityEndpoint) {
		delete entityInstances[entityEndpoint];
	}

	self.getTableService = function (name) {
		if (! tableServices[name]) {
			var resource = $resource(self.getConfig("servicesLocation") + name + "/:param/:param1/:param2", null, {'put': {method: "PUT"}});
			//extends original resource
			var F = function (resourceName) {
				var name = resourceName;
				this.getName = function () {
					return name;
				};
			};
			F.prototype = resource;
			tableServices[name] = new F(name);
		}
		return tableServices[name];
	};

	self.getCookie = function (key) {
		var name = key + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
		}
		return;
	};

	self.setCookie = function (key, value) {
		var d = new Date();
    	d.setTime(d.getTime() + (24*24*60*60*1000));
    	document.cookie = key + "=" + value + "; expires=" + d.toUTCString();
	};

}]);