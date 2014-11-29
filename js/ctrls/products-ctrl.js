'use strict';

APP.controller('ProductsCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {

	//public methods
	$scope.put = function () {

		Service.put($scope.current, function () {
				$scope.updateRoute('view', 'list');
				GlobalService.removeEntityInstances('users');
			}, function () {
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
					columns: ['id', 'name', 'price', 'stock', '-longDescription', {
							name: 'categories', isSortable: false, 
							filter: function (row) {
								var catsString = "";
								for (var i = 0; row.categories && i < row.categories.length; i ++) {
									catsString += row.categories[i].name + ", ";
								}
								return catsString;
							}
						}],
					actions: [
						{name: "Edit", class: "btn-inverse", trigger: function (row) {$scope.updateRoute({view: 'put', id: row.id})}}
					]
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
			Service.get({param: $routeParams.id}, function (response) {
				response.sellFrom = new Date(response.sellFrom);
				response.sellUntil = new Date(response.sellUntil);
				$scope.current = response;
			});
		} else {
			$scope.current = {categories: []};
		}
	};


	//construct
	var Service = GlobalService.getTableService('products');

	$scope.routeParams = $routeParams;

	$scope.setViews(['list', 'put']);
	routeUpdate();

	console.log("ProductsCtrl", $scope);

}]);
