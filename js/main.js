'use strict';

(function () {
	var RouteCtrl = function($scope, $routeParams, $q, $log, $templateCache, GlobalService) {
		$scope.setViews(null);
		//lazy load needed sources (js/css/i18n) by URL
		//TODO preload HTML too
		var nav = $routeParams.nav;
		window.REQUIRE.load("../i18n/app_" + GlobalService.getConfig('language') + ".json", null, function (response) {
			GlobalService.setI18N('app', response);
		});
		window.REQUIRE.load("../i18n/" + nav + "_" + GlobalService.getConfig('language') + ".json", null, function (response) {
			GlobalService.setI18N(nav, response);
		});
		window.REQUIRE.load('ctrls/' + nav + "-ctrl.js");
		window.REQUIRE.load('../tpl/' + nav + '.html', ['ctrls/' + nav + "-ctrl.js"], function (template) {
				$templateCache.put('tpl/' + nav + '.html', template);
				$scope.templateUrl = 'tpl/' + nav + '.html';
				if( ! $scope.$$phase) {
					setTimeout(function () {$scope.$apply();}, 0);
				}
			}
		);
	};
	window.APP = angular.module("Web", window.SETTINGS.ngModules)
		.config(function($routeProvider) {
			$routeProvider.when('/:nav?/:view?/:id?', {
				templateUrl: "url-router.html",
				controller: RouteCtrl,
				reloadOnSearch: false
			});
		}).config(function ($controllerProvider) {
			APP.controller = $controllerProvider.register;
		}).config(function ($compileProvider) {
			APP.directive = $compileProvider.directive;
		}).config(function ($locationProvider) {
			$locationProvider.html5Mode(true);
		}).config(function($resourceProvider) {
			$resourceProvider.defaults.stripTrailingSlashes = false;
		}).config(function ($httpProvider) {
			$httpProvider.interceptors.push(function($q, $injector, $rootScope, $timeout) {
				return {
			    	'request': function(config) {
						if ($rootScope.httpRequestTimeout) {
							config.timeout = $rootScope.httpRequestTimeout.promise;
						}
			    		$rootScope.loadings.global ++;
						return config;
					}, 'response': function(response) {
						$rootScope.loadings.global --;
						return response;
					},'responseError': function(rejection) {
						$rootScope.loadings.global --;
						if (rejection.status >= 500 || rejection.status === 404) {
							$rootScope.$broadcast('responseError', rejection);
						} else if (rejection.status <= 403 && rejection.status >= 401) {
							$rootScope.$broadcast('authError', rejection);
						} else if (rejection.status !== 0) {
							// when is not one of [unexpected,not found,unauthorized,canceled,aborted] then propagate rejection
							return $q.reject(rejection);
						}
					}
				};
			});
		}).value('$anchorScroll', angular.noop);

	// preload first controller - performance improvement
	var hashParsed = location.hash.split("/");
	if (hashParsed && hashParsed[1]) {
		window.REQUIRE.load('ctrls/' + hashParsed[1].split("?")[0] + "-ctrl.js");
	}
} ());