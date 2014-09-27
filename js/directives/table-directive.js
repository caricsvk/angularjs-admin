APP.directive('miloTable', function() {
	var tplUrl = 'tpl/directives/table.html';
	return {
		templateUrl: window.SETTINGS && window.SETTINGS.miloLibPrefix ? window.SETTINGS.miloLibPrefix + tplUrl : tplUrl,
		scope: {init: '=miloTable'}, 
		controller: ['$scope', '$rootScope', '$filter', '$location', '$q', 
			function($scope, $rootScope, $filter, $location, $q) {

			// console.log('controller', $scope);
			if ($scope.init) {
				$scope.service = $scope.init.service;
			}
			$scope.filter = function () {

				if (! $scope.state.limit) {
					$scope.state.limit = $scope.limits[0];
				}
				if (! $scope.state.offset) {
					$scope.state.offset = 0;
				}
				if (! $scope.state.page) {
					$scope.state.page = 1;
				}

				// console.log('filtering', $scope.state);
				$scope.loadings.filtering = true;
				$scope.state.offset = ($scope.state.page - 1) * $scope.state.limit;
				$scope.state.param = null;
	    		$scope.data = $scope.service.query($scope.state, function () {	
					$scope.loadings.filtering = false;
				});		
				$scope.changeCount(); 
			}

			$scope.changeCount = function () {
				$scope.state.param = 'count';
				$scope.dataCount = $scope.service.get($scope.state, function (count) {
					if ($scope.state.page > Math.ceil(parseInt(count.count) / $scope.state.limit)) {
						$scope.updateRoute("page", 1);
					}
					$scope.dataCount = count.count;
				});
			};

			$scope.applyAngularFilters = function () {

				for (var i = 0; i < $scope.data.length; i ++) {
					var row = $scope.data[i];
					for (var key in row) {
						row[key + "_filtered"] = applyNgFilter(row[key], key);
					}
				}
				self.addEmptyLines($scope.data);
			};

			$scope.updateOrder = function (columnName) {
				var oppositeOrderType = $scope.state.orderType === 'DESC' ? 'ASC' : 'DESC';
				var orderType = $scope.state.order === columnName ? oppositeOrderType : 'DESC';
				$scope.updateRoute({'order': columnName, 'orderType': orderType});
			};

			$scope.getPagesCount = function () {
				return Math.ceil(parseInt($scope.dataCount) / $scope.state.limit);
			};

			$scope.onDateFilterChange = function (stateKey) {
				$scope.show.date = null;
				$scope.state[stateKey] = new Date($scope.state[stateKey]).getTime();
				$scope.changeCount();
			}

			$scope.setEmptyState = function (stateKey, value) {
				$scope.state[stateKey + '_max'] = $scope.state[stateKey + '_min'] = $scope.state[stateKey + '_wild'] = null;
				$scope.state[stateKey + "_empty"] = $scope.state[stateKey + "_empty"] == value ? null : value;
				$scope.changeCount();	
			}

			//private
			var self = this;
			var applyNgFilter = function (value, key) {
				for (var i = 0; i < $scope.columns.length; i ++) {
					if (key === $scope.columns[i].name) {
						switch ($scope.columns[i].type) {
							case 'long':
							case 'integer':
							case 'int':
								return $filter('number')(value);
								break;
							case 'bigdecimal':
							case 'double':
							case 'float':
								return $filter('currency')(value, '');
								break;
							case 'timestamp':
							case 'date':
							case 'calendar':
								return $filter('date')(value, 'medium');
								break;
							default:
								return value;
						}
					}
				}

				return value;
			};
 
			//public
			self.addEmptyLines = function (newValue) {
				if (! newValue) {
					newValue = [];
				}
				for (var i = 0; i < $scope.state.limit; i ++) {
					if (i >= newValue.length) {
						newValue.push(undefined);
					} else {
						for (var j = 0; j < $scope.columns.length; j ++) {
							if ($scope.columns[j].filter) {
								newValue[i][$scope.columns[j].name + "_filtered"] = $scope.columns[j].filter(newValue[i]);
							}
						}
					}
				}
			};
			self.getFilterType = function (type) {
				switch (type) {
					case 'long':
					case 'integer':
					case 'int':
					case 'bigdecimal':
					case 'double':
					case 'float':
						return 'number';
						break;
					case 'timestamp':
					case 'date':
					case 'calendar':
						return 'date';
						break;
					default:
						return 'string';
				}
			};

			$scope.$on('$routeUpdate', function() {
				$scope.state = jQuery.extend({}, $location.search());
				$scope.filter();
			});

			$scope.state = $location.search();
			
    	}], link: function($scope, $element, attr, ctrl) {
    		
    		if (! $scope.init) {
    			return;
    		}

    		//inherit parent scope methods
    		var parentScope = $element.scope();
			for (var key in parentScope) {
				if (! $scope[key] && typeof parentScope[key] === 'function') {
					$scope[key] = parentScope[key];
				}
			}
    		
    		//set defaults
    		$scope.state = jQuery.extend({}, $scope.state);
			$scope.loadings = {};
			$scope.limits = $scope.init.limits ? $scope.init.limits : [5, 10, 20, 50, 100];
			$scope.actions = $scope.init.actions ? $scope.init.actions : [];
			$scope.show = {};
			$scope.columns = $scope.init.columns ? $scope.init.columns : [];

			var knownState = ['limit', 'offset', 'page', 'order', 'orderType', 'param'];
			$scope.showFilters = false;
			for (var key in $scope.state) {
				if (knownState.indexOf(key) == -1) {
					$scope.showFilters = true;
				}
			}

			$scope.filter();

			//setup column types and filter for columns by them
			$scope.service.get({param: "entity-field-types"}, function (entityFieldTypes) {

				for (var key in entityFieldTypes) {

					if (typeof entityFieldTypes[key] === 'object' 
						|| typeof entityFieldTypes[key] === 'function'
						|| key.substr(0, 1) === "_"
						|| key.substr(0, 1) === "$"
						|| key === "serialVersionUID") {

						continue;
					}

					var type = entityFieldTypes[key].split(".");
					type = type[type.length - 1].toLowerCase();
					var column = {
						name: key, 
						originalType: entityFieldTypes[key].split(' ')[1], 
						type: type,
						filterType: ctrl.getFilterType(type),
						isSortable: true,
						isFilterable: true
					};

					// update column if exists
					for (var i = 0; i < $scope.columns.length; i ++) {
						if (typeof $scope.columns[i] !== 'string' && $scope.columns[i].name == key) {
							for (var mergeKey in column) {
								if (typeof $scope.columns[i][mergeKey] === 'undefined') {
									$scope.columns[i][mergeKey] = column[mergeKey];
								}
							}
							break;
						} else if ($scope.columns[i] === key) {
							$scope.columns[i] = column;
							break;
						}
					}	
					//remove column
					if ($scope.columns.indexOf('-' + key) > -1) {
						$scope.columns.splice($scope.columns.indexOf('-' + key), 1);
					// add column
					} else if (i === $scope.columns.length) {
						$scope.columns.push(column);
					}
				}

				//must be here because of it need to have all column params
				$scope.$watch('data', function (newData) {
					ctrl.addEmptyLines(newData);
					newData.$promise.then($scope.applyAngularFilters);
				});


				for (var i = 0; i < $scope.columns.length; i ++) {
					if ($scope.columns[i].filterType == 'string') {
						(function (column) {
							$scope.service.getColumnIsEnum(column.originalType).then(function (isEnum) {
								column.isEnum = isEnum;
							});
						} ($scope.columns[i]));
					}
				}
			});

			//just because HTML 5 input:number does not show number when they are as strings in angular
			$scope.$watch('state', function (newState) {
				for (var key in newState) {
					if (key.substr(key.length - 4) === '_min'
						|| key.substr(key.length - 4) === '_max') {
						newState[key] = parseFloat(newState[key]);
					}
				}
			});

			// console.log('peTable', $scope);
		}
	};
});