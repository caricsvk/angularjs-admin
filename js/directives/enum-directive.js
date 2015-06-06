APP.directive('miloEnum', function() {
	return {
		scope: {
			enumName: '=miloEnum',
			model: '=ngModel',
			service: '=miloService'
		}, controller: ['$scope', '$element', '$attrs', '$http', function($scope, $element, $attrs, $http) {
			var scope = $element.scope();
			if (! scope.miloEnumData) {
				scope.miloEnumData = {};
			}
			if (! scope.miloEnumData[$scope.enumName]) {
				if (! $scope.service) {
					$scope.service = 'reflection';
				}
				$http.get(scope.getConfig('servicesLocation') + $scope.service + '/enum?fullClassName=' + $scope.enumName)
					.success(function (data) {
						if (data.length) {
							data.unshift('');
						}
						scope.miloEnumData[$scope.enumName] = data;
					});
			}
			$attrs['ngOptions'] = 'value for value in miloEnumData["' + $scope.enumName + '"]';
    	}]
	};
});
