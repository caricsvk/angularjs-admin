'use strict';

APP.controller('AppCtrl', ['$scope', '$rootScope', '$route', '$routeParams', '$location', '$http', '$timeout', '$q', 'GlobalService', 'AuthService',
					function ($scope, $rootScope, $route, $routeParams, $location, $http, $timeout, $q, GlobalService, AuthService) {

	//common public methods
	var currentController = null,
		lastUpdateRouteReload = 0,
		viewCallbackMap = {},
		errors = {};
	$scope._ = function (index) {
		return GlobalService.i18n($routeParams.nav, index);
	};

	$scope._e = function (index) {
		var message = "";
		if (errors[index]) {
			var splited = errors[index].split("|");
			var message = $scope._(splited[0] + (splited.length - 1 ? splited.length - 1 : ""));
			for (var i = 1; i < splited.length; i ++) {
				message = message.replace("{{" + i + "}}", splited[i]);
			}
		}
		return message;
	};

	$scope._l = function (link) {
		return history.pushState ? link : '#/' + link;
	};

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

	$scope.updateRoute = function(name, value, replace) {
		//console.log("APP updateRoute", name, value);
		errors = {};
		//transform param to object
		var newParams = {};
		if (typeof name === 'object') {
			newParams = name;
		} else {
			newParams[name] = value;
		}
		var pathChangingParams = ['url', 'nav', 'view', 'id'];
		var urlNotChanged = true;
		//update search params
		for (var key in newParams) {
			if (pathChangingParams.indexOf(key) != -1 && $routeParams[key] != newParams[key]) {
				urlNotChanged = false;
				if (replace) {
					$location.search(key, newParams[key]).replace();
				} else {
					$location.search(key, newParams[key]);
				}
				$routeParams[key] = newParams[key];
			}
		}
		//update path if needed
		var newBuildPath = newParams.url || "/" + getRouteParam('nav', newParams) + "/"
			+ getRouteParam('view', newParams) + "/" + getRouteParam('id', newParams);
		if (newBuildPath !== $location.path()) {
			urlNotChanged = false;
			if (replace) {
				$location.path(newBuildPath).replace();
			} else {
				$location.path(newBuildPath);
			}
		}
		if (urlNotChanged && lastUpdateRouteReload + 1000 < Date.now()) {
			lastUpdateRouteReload = Date.now();
			$route.reload();
		}
	};

	var getRouteParam = function (key, newParams) {
		if (typeof newParams[key] !== 'undefined') {
			return newParams[key];
		} else if ($routeParams[key]) {
			return $routeParams[key];
		} else {
			return '';
		}
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

	$scope.registerView = function (controller, viewName, callback) {
		if (controller != currentController) {
			currentController = controller;
			viewCallbackMap = {};
		}
		viewCallbackMap[viewName ? viewName : '/'] = callback;
		if (viewName == $routeParams.view) {
			processViewChange();
		}
	};

	var processViewChange = function () {
		var view = $routeParams.view ? $routeParams.view : '/';
		if (typeof viewCallbackMap[view] == 'function') { //is registered
			viewCallbackMap[view].call(currentController);
		}
	};

	var getCurrentMenu = function () {
		for (var i = 0; i < $scope.menu.length; i ++) {
			if ($routeParams.nav === $scope.menu[i].name) {
				return $scope.menu[i];
			}
		}
	};

	var setViews = function (views, idViews) {
		if (views && (! $scope.views[$routeParams.nav] || $scope.views[$routeParams.nav].length == 0)) {
			for (var key in $scope.views) { //release views
				setView(key, null);
			}
			$scope.views[$routeParams.nav] = [];
			setView($routeParams.nav, views || []);
			$scope.views['id' + $routeParams.nav] = [];
			setView('id' + $routeParams.nav, idViews || []);
		}
	};

	var setView = function (key, views) {
		var release = ! views;
		if (release) {
			views = $scope.views[key];
		}
		for (var i = 0; i < views.length; i ++) {
			(function (i) {
				$timeout(function () {
					if (release) {
						views.splice(views.length - 1, 1);
					} else {
						$scope.views[key].push(views[i]);
					}
				}, 260 / views.length * i)
			} (i));
		}
	}

	$scope.setCookie = function (key, value) {
		return GlobalService.setCookie(key, value);
	};

	$scope.getCookie = function (key) {
		return GlobalService.getCookie(key);
	};

	$scope.getTitle = function () {
		return  $scope._($routeParams.nav) + " | " + $scope.getConfig('titlePostfix');
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
		var path = $location.path();
		if (path === '/' && path !== '/' + $scope.getConfig('initCtrl')) {
			$location.path($scope.getConfig('initCtrl'));
		} else {
			var menu = getCurrentMenu();
			setViews(menu.sub || [], menu.subId || []);
		}

	};

	$scope.$on('$routeChangeSuccess', function() {
		routeUpdate();
	});

	$scope.$on('$routeUpdate', function() {
		processViewChange();
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
	$scope.views = {};
	$scope.menu = GlobalService.getConfig('menu');
	// var locale = location.pathname.split("/")[1];
	// var locale = locale.length === 2 ? locale : 'en';

	console.log("AppCtrl", $scope);
}]);
