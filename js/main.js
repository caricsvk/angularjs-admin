'use strict';

(function () {
	var RouteCtrl = function($scope, $routeParams, $q, $log, $templateCache, GlobalService) {
		$scope.setViews(null);
		//lazy load needed sources (js/css/i18n) by URL
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
	window.APP = angular.module("Web", ["ngResource", "ngAnimate", "ngRoute", "ui.tinymce"])
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
		}).config(function ($httpProvider) {
			$httpProvider.interceptors.push(function($q, $injector, $rootScope, $timeout) {
				return {
			    	'request': function(config) {
			    		$rootScope.loadings.global ++;
						return config;
					}, 'response': function(response) {
						// $timeout(function () {
							$rootScope.loadings.global --;	
						// }, 3000);
						
						return response;
					},'responseError': function(rejection) {
						$rootScope.loadings.global --;
						return $q.reject(rejection);
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