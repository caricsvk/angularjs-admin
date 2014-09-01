APP.directive('miloEnum', function() {
	return {
		scope: {
			enumName: '=miloEnum',
			model: '=ngModel'
		}, controller: ['$scope', '$element', '$attrs', 'GlobalService', function($scope, $element, $attrs, GlobalService) {
			var scope = $element.scope();
			if (! scope.miloEnumData) {
				scope.miloEnumData = {};
			}
			if (! scope.miloEnumData[$scope.enumName]) {
				GlobalService.getEnumValues($scope.enumName).$promise.then(function (result) {
					scope.miloEnumData[$scope.enumName] = result;
				});
			}
			$attrs['ngOptions'] = 'value for value in miloEnumData["' + $scope.enumName + '"]';
    	}]
	};
});
