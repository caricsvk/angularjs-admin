'use strict';

APP.controller('CategoriesCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {

	//public methods
	$scope.showPut = function () {
		if ($routeParams.id) {
			$scope.current = Service.get({param: $routeParams.id});
		} else {
			$scope.current = {};
		}
	};

	$scope.put = function () {
		Service.put($scope.current, function () {
				$scope.updateRoute('view', 'list');
				GlobalService.removeEntityInstances('categories');
			}, function () {
				$scope.showAjaxMessage($scope._('Oops, something went wrong, please try again.'));
			});
	};

	$scope.delete = function (index) {
		var entity = $scope.tableData[index];
		entity.$delete({param: entity.id}, 
			function () {
				// $scope.tableData.splice(index, 1);
			}, function () {
				$scope.showAjaxMessage($scope._('Oops, something went wrong, please try again.'));
			});
	};

	//routing processing
	$scope.$on('$routeUpdate', function() {
		routeUpdate();
	});

	var routeUpdate = function () {

		switch ($scope.routeParams.view) {

			case "create":
			case "edit":
				$scope.showPut();
				break;

			case "list":
			default:
				$scope.table = {
					service: Service,
					columns: ['id', 'name', {name: 'parent', filter: function (row) {return row.parent ? row.parent.name : '';}}],
					actions: [
						{name: "Edit", class: "btn-inverse", trigger: function (row) {$scope.updateRoute({view: 'edit', id: row.id})}}
					]
				};
				break;
		}
	}

	//construct
	var Service = GlobalService.getTableService('categories');
	$scope.routeParams = $routeParams;
	$scope.setViews(['list', 'create'], ['edit']);
	routeUpdate();

	console.log("CategoriesCtrl", $scope);
}]);
