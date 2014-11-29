'use strict';

APP.controller('ClientsCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {
	//public methods
	$scope.put = function () {
		if ($scope.current.birth) {
			$scope.current.birth = $scope.current.birth.getTime();
		}
		Service.put($scope.current, function () {
				$scope.updateRoute('view', 'list');
				GlobalService.removeEntityInstances('users');
			}, function () {
				if ($scope.current.birth) {
					$scope.current.birth = new Date($scope.current.birth);
				}
				$scope.showAjaxMessage('Oops, something went wrong, please try again.');
			});
	};

	$scope.delete = function (index) {
		var entity = $scope.tableData[index];
		entity.$delete({param: entity.id},
			function () {
				$scope.tableData.splice(index, 1);
			}, function () {
				$scope.showAjaxMessage('Oops, something went wrong, please try again.');
			});
	};

	//routing processing
	$scope.$on('$routeUpdate', function() {
		routeUpdate();
	});

	var routeUpdate = function () {

		$scope.currentView = $routeParams.view;
		switch ($scope.routeParams.view) {

			case "put":
				showPut();
				break;

			default:
			case "list":
				$scope.table = {
					service: Service,
					columns: ['id', 'name', 'surname', 'birth', '-orders'],
					actions: [
						{name: "Edit", class: "btn-inverse", trigger: function (row) {$scope.updateRoute({view: 'put', id: row.id})}}
					],
				};
				break;
		}
	}

	//destroy processing
	$scope.$on('$destroy', function() {
		$scope.setViewAnimation('clients', $routeParams.nav, $scope.currentView, $routeParams.view);
	});

	//private
	var showPut = function () {
		if ($routeParams.id) {
			$scope.current = Service.get({param: $routeParams.id}, function () {
				if ($scope.current.birth) {
					$scope.current.birth = new Date();
				}
			});
		} else {
			$scope.current = {};
		}
	};

	//construct
	var Service = GlobalService.getTableService('clients');

	// $scope.loadings = {};
	// $scope.showed = {};
	$scope.routeParams = $routeParams;

	$scope.setViews(['list', 'put']);
	routeUpdate();

	console.log("ClientsCtrl", $scope);

}]);
