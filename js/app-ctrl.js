'use strict';

APP.controller('AppCtrl', ['$scope', '$rootScope', '$route', '$routeParams', '$location', '$http', '$timeout', '$q', 'GlobalService',
					function ($scope, $rootScope, $route, $routeParams, $location, $http, $timeout, $q, GlobalService) {

	//common public methods
	var errors = {};
	$scope._ = function (index) {
		return GlobalService.i18n($routeParams.nav, index);
	};

	$scope._e = function (index) {
		var message = "";
		if (errors[index]) {
			var splited = errors[index].split("|");
			var message = $scope.t(splited[0] + (splited.length - 1 ? splited.length - 1 : ""));
			for (var i = 1; i < splited.length; i ++) {
				message = message.replace("{{" + i + "}}", splited[i]);
			}
		}
		return message;
	}

	$scope.setErrors = function (newErrors) {
		errors = {};
		for (var i = 0; i < newErrors.length; i ++) {
			var error = newErrors[i];
			errors[error.path.split("arg0.")[1]] = error.message;
		}
		//scroll to errors
		setTimeout(function () {
			var position = jQuery('label.error:visible').first().offset();
			if (position && position.top)
				jQuery("html, body").animate( {scrollTop: position.top - 50}, 800);
		}, 100);
	};

	$scope.getConfig = function (key) {
		return GlobalService.getConfig(key);
	}

	$scope.setConfig = function (key, value, storeInCookie) {
		return GlobalService.setConfig(key, value, storeInCookie);
	}

	$scope.updateRoute = function(name, value) {
		// console.log("APP updateRoute");
		errors = {};

		function processParam(name, value) {
			if (name == 'url') {
				$location.path(value);
			} else if (typeof name !== 'undefined' && name != "nav" && name !== "view" && name !== "id") {
				$location.search(name, value);
			} else {
				var currentPath = $location.path();
				var newBuildPath = "/" + $routeParams.nav + "/" + ($routeParams.view ? $routeParams.view + "/" : "") + ($routeParams.id ? $routeParams.id : "");
				if (currentPath !== newBuildPath) {
					$location.path(newBuildPath);
				} else {
					$route.reload();
				}
			}
		}

		if (typeof name === 'object') {
			for (var key in name) {
				$routeParams[key] = name[key];	
				processParam(key, name[key]);
			}
		} else {
			$routeParams[name] = value;
			processParam(name, value);
		}
	};

	$scope.fixDateOffset = function (timestamp, b, segment) {
		// return COMMON.angularFixDate(timestamp);
	};

	$scope.showAjaxMessage = function(message, type) {
        $scope.ajax.message = null;
        $timeout(function () {
            $scope.ajax.message = $scope._(message);
            $scope.ajax.type = type || "info";
        }, 200);
	};

	$scope.setViewAnimation = function(ctrlFrom, ctrlTo, viewFrom, viewTo) {
		if (ctrlFrom === ctrlTo && (! viewFrom || viewFrom == viewTo)) {
			return;
		}
		if (ctrlFrom === ctrlTo && typeof animationClassMap[ctrlFrom] == 'object') {
			$scope.animationClass = typeof animationClassMap[ctrlFrom][viewFrom + '->' + viewTo] !== 'undefined' 
				? animationClassMap[ctrlFrom][viewFrom + '->' + viewTo] : animationClassMap.default;
		} else {
			$scope.animationClass = typeof animationClassMap[ctrlFrom + '->' + ctrlTo] !== 'undefined' 
				? animationClassMap[ctrlFrom + '->' + ctrlTo] : animationClassMap.default;
		}
	};

	$scope.overlayShow = function (overlayName) {
		$scope.isOverlayShowed = {};
		$scope.isOverlayShowed[overlayName] = jQuery(window).scrollTop() + 1;
		return true;
	};

	$scope.overlayHide = function () {
		$scope.isOverlayShowed = null;
	};

	$scope.setViews = function (views) {
		$scope.views = views;
	};

	$scope.setCookie = function (key, value) {
		return GlobalService.setCookie(key, value);
	};

	$scope.getCookie = function (key) {
		return GlobalService.getCookie(key);
	};

	var routeUpdate = function () {

		// console.log("APP routeUpdate");
		// abort/cancel all connections when route is updated
		if ($rootScope.httpRequestTimeout) {
			$rootScope.httpRequestTimeout.resolve();
		}
		$rootScope.httpRequestTimeout = $q.defer();
		$scope.show.settings = false;
		$scope.ajax.message = "";
		//check if is route empty
		if (! location.hash && location.hash !== '#/' + $scope.getConfig('initCtrl')) {
			location.href = '#/' + $scope.getConfig('initCtrl');
		}
	};

	$scope.$on('$routeChangeSuccess', function() {
		routeUpdate();
	});

	//listners
	$scope.$on('responseError', function (e, rejection) {
		responseErrors.push(rejection);
		responseErrorLastTime = new Date().getTime();
		$timeout(function () {
			var messageStart = responseErrors.length + " resources has failed to load ("+ responseErrors[0].status
				+ " " + responseErrors[0].statusText + "). ";
			if (responseErrors.length > 2) {
				$scope.showAjaxMessage(messageStart + "There is probably an issue with server.", 'danger');
			} else {
				$scope.showAjaxMessage(messageStart + "Reload your page and try again, or continue when everything is OK.", 'warning');
			}
		}, 500);
		$timeout(function () {
			if (new Date().getTime() - responseErrorLastTime > 1990) {
				responseErrors = [];
			}
		}, 2000);
	});

	//construct
	$scope.isOverlayShowed = null;
	$scope.ajax = {
		message: "",
		type: "success|info|warning|danger"
	};
	$scope.show = {};
	// var routeUpdateHit

	var animationClassMap = GlobalService.getConfig('animations');;
	var responseErrors = [];
	var responseErrorLastTime = 0;
	$scope.animationClass = animationClassMap.default;
	$scope.layout = GlobalService.getConfig('layout');
	$scope.color = GlobalService.getConfig('color');
	$scope.routeParams = $routeParams;
	$rootScope.loadings = {
		global: 0
	};
	// var locale = location.pathname.split("/")[1];
	// var locale = locale.length === 2 ? locale : 'en';

	console.log("AppCtrl", $scope);
}]);