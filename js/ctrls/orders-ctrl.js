'use strict';

APP.controller('OrdersCtrl', ['$scope', '$rootScope', '$resource', '$routeParams', '$location', '$http', 'GlobalService',
						function ($scope, $rootScope, $resource, $routeParams, $location, $http, GlobalService) {

	//public methods
	$scope.put = function () {
		Service.put($scope.current, function () {
				$scope.updateRoute('view', 'list');
				GlobalService.removeEntityInstances('articles');
			}, function () {
				$scope.showAjaxMessage('Oops, something went wrong, please try again.');
			});
	};

	// $scope.delete = function (index) {
	// 	var entity = $scope.tableData[index];
	// 	entity.$delete({param: entity.id}, 
	// 		function () {
	// 			$scope.tableData.splice(index, 1);
	// 		}, function () {
	// 			$scope.showAjaxMessage('Oops, something went wrong, please try again.');
	// 		});
	// };

	//routing processing
	$scope.$on('$routeUpdate', function() {
		routeUpdate();
	});

	var routeUpdate = function () {

		$scope.currentView = $routeParams.view;
		switch ($scope.routeParams.view) {

			case "create":
			case "edit":
				showPut();
				break;

			case "list":
			default:
				$scope.table = {
					service: Service,
					columns: ['id', {name: 'totalAmount'}, {
							name: 'client', isFilterable: false,
							filter: function (row) {return ! row.client ? "" : row.client.name + " " + row.client.surname;}
						}, {
							name: 'products', isSortable: false, isFilterable: false,
							filter: function (row) {
								var prodString = "";
								for (var i = 0; row.products && i < row.products.length; i ++) {
									prodString += row.products[i].name + ", ";
								}
								return prodString;
							}
						}
					], actions: [
						{name: "Edit", class: "btn-inverse", trigger: function (row) {$scope.updateRoute({view: 'edit', id: row.id})}}
					], 
				};
				break;
		}
	}

	//destroy processing
	$scope.$on('$destroy', function() {
		$scope.setViewAnimation('orders', $routeParams.nav, $scope.currentView, $routeParams.view);
	});

	//private
	var showPut = function () {
		if ($routeParams.id) {
			$scope.current = Service.get({param: $routeParams.id});
		} else {
			$scope.current = {products: []};
		}
	};

	//construct
	var Service = GlobalService.getTableService('orders');

	$scope.routeParams = $routeParams;

	$scope.setViews(['list', 'create'], ['edit']);
	var oldView = $routeParams.view;
	routeUpdate();

	console.log("OrdersCtrl", $scope);
}]);
