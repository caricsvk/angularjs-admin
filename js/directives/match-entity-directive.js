APP.directive('miloMatchEntity', function() {
	return {
		scope: {
			entityEndpoint: '=miloMatchEntity',
			entityName: '=?miloEntityName',
			entityId: '=?miloEntityId',
			ngModel: '='
		}, controller: ['$scope', '$element', '$attrs', 'GlobalService', function($scope, $element, $attrs, GlobalService) {
			var matchEntity = function (instances) {
				for (var i = 0; instances && i < instances.length; i ++) {
					if ($scope.ngModel && instances[i][$scope.entityId] === $scope.ngModel[$scope.entityId]) {
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
			if (! $scope.entityId) {
				$scope.entityId = 'id';
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

			$scope.$watch('ngModel', function () {
					matchEntity(scope.miloSelectData[$scope.entityEndpoint]);
			});
    	}]
	};
});
