'use strict';

APP.controller('AuthCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', 'AuthService',
	function ($scope, $rootScope, $resource, $routeParams, AuthService) {

		//public methods
		$scope.login = function () {
			AuthService.login($scope.current).then(function (redirectUrl) {
				if (redirectUrl) {
					location.href = "#";
				} else {
					$scope.showAjaxMessage('Your login or password is incorrect.','danger');
				}
			});
		};

		//routing processing
		$scope.$on('$routeUpdate', function() {
			routeUpdate();
		});

		var routeUpdate = function () {
			$scope.currentView = $routeParams.view;
			switch ($scope.routeParams.view) {

				case "logout":
					AuthService.logout(function () {
						$scope.showAjaxMessage('Logout unsucessful, please try again.','danger');
					});
					break;

				default:
					$scope.current = {};
					break;
			}
		}

		//destroy processing
		$scope.$on('$destroy', function() {
			$scope.setViewAnimation('auth', $routeParams.nav, $scope.currentView, $routeParams.view);
		});

		//private

		//construct
		$scope.routeParams = $routeParams;

		routeUpdate();

		console.log("LoginCtrl", $scope);
	}]);
