APP.directive('miloMatchEntity', function() {
	return {
		scope: {
			entityEndpoint: '=miloMatchEntity',
			entityName: '=?miloEntityName',
			ngModel: '='
		}, controller: ['$scope', '$element', '$attrs', 'GlobalService', function($scope, $element, $attrs, GlobalService) {
			var matchEntity = function (instances) {
				for (var i = 0; i < instances.length; i ++) {
					if ($scope.ngModel && instances[i].id === $scope.ngModel.id) {
						$scope.ngModel = instances[i];
					}
				}
			};
			var scope = $element.scope();
			if (! scope.miloSelectData) {
				scope.miloSelectData = {};
			}
			if (! $scope.entityName) {
				$scope.entityName = 'name';
			}
			if (! scope.miloSelectData[$scope.entityEndpoint]) {
				GlobalService.getEntityInstances($scope.entityEndpoint).$promise.then(function (data) {
					scope.miloSelectData[$scope.entityEndpoint] = data;
					matchEntity(scope.miloSelectData[$scope.entityEndpoint]);
				});
			} else {
				matchEntity(scope.miloSelectData[$scope.entityEndpoint]);
			}
			$attrs['ngOptions'] = 'value.' + $scope.entityName + ' for value in miloSelectData["' + $scope.entityEndpoint + '"]';
    	}]
	};
});
