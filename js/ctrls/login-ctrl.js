'use strict';

APP.controller('LoginCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {

	//public methods
	$scope.login = function () {
		// GlobalService.setUser(GlobalService.getRandomUser());
		$location.path("/home");
	};

	//routing processing
	$scope.$on('$routeUpdate', function() {
		routeUpdate();
	});

	var routeUpdate = function () {

		$scope.currentView = $routeParams.view;
		switch ($scope.routeParams.view) {
			case "signup":
			case "login":
				break;
			default:
				$scope.updateRoute('view', 'login');
		}
	}

	//destroy processing
	$scope.$on('$destroy', function() {
		$scope.setViewAnimation('login', $routeParams.nav, $scope.currentView, $routeParams.view);
	});

	//private

	//construct
	var Service = $resource($scope.getConfig("servicesLocation") + "/users/:param", null, {'put': {method: "PUT"}});

	$scope.routeParams = $routeParams;

	var oldView = $routeParams.view;
	routeUpdate();

	console.log("LoginCtrl", $scope);
}]);
