'use strict';

APP.controller('HomeCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {

	//public methods

	//routing processing
	$scope.$on('$routeUpdate', function() {
		routeUpdate();
	});

	var routeUpdate = function () {

		switch ($scope.routeParams.view) {
			case 'Backend Scenario':
				break;
			case 'Frontend Scenario':
				window.REQUIRE.load('ctrls/clients-ctrl.js', null, function (response) {
					$scope.clientsCtrl = response;
					if( ! $scope.$$phase) {
						$scope.$apply();
					}
				});
				window.REQUIRE.load('../tpl/clients.html', null, function (response) {
					$scope.clientsHtml = response;
					if( ! $scope.$$phase) {
						$scope.$apply();
					}
				});
				break;
			case 'Intro':
			default:

				break;
		}
	}

	//destroy processing
	$scope.$on('$destroy', function() {
		//?
	});

	//private
	

	//construct
	$scope.routeParams = $routeParams;
	$scope.setViews(['Intro', 'Table Directive', 'Frontend Scenario', 'Backend Scenario' ]);

	routeUpdate();

	console.log("HomeCtrl", $scope);
}]);
