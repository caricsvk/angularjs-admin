/*
 * The MIT License
 *
 * Copyright 2014 Richard Casar <caricsvk@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
APP.directive('miloTable', function() {
	var tplUrl = 'tpl/directives/table.html';
	return {
		transclude: true,
		templateUrl: window.SETTINGS && window.SETTINGS.libPrefix ? window.SETTINGS.libPrefix + tplUrl : tplUrl,
		scope: {init: '=miloTable'},
		controller: ['$scope', '$rootScope', '$filter', '$location', '$q', '$sce', '$timeout',
			function($scope, $rootScope, $filter, $location, $q, $sce, $timeout) {

				// console.log('controller', $scope);
				if ($scope.init) {
					$scope.service = $scope.init.service;
					for (var i = 0; $scope.init.actions && i < $scope.init.actions.length; i ++) {
						$scope.init.actions[i].name = $sce.trustAsHtml($scope.init.actions[i].name);
					}
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
					if ($scope.data.length) {
						$scope.data = new Array(parseInt($scope.state.limit));
					}
					$scope.service.query($scope.state, function (data) {
						$scope.loadings.filtering = false;
						$scope.showData(data, $scope.data.length ? 0 : 5);
					});
					$scope.changeCount(true);
				};

				$scope.changeCount = function (isFilterCall) {
					$scope.state.param = 'count';
					$scope.service.get($scope.state, function (count) {
						if (isFilterCall && $scope.state.page > Math.ceil(parseInt(count.count) / $scope.state.limit)) {
							$scope.updateRoute("page", 1);
						}
						$scope.dataCount = count.count;
					});
				};

				$scope.showData = function (data, initPause) {
					for (var i = 0; i < data.length; i ++) {
						(function (i) {
							$timeout(function () {
								var row = data[i];
								for (var key in row) {
									row[key + "_filtered"] = applyNgFilter(row[key], key);
									for (var j = 0; j < $scope.columns.length; j ++) {
										if ($scope.columns[j].filter) {
											try {
												row[$scope.columns[j].name + "_filtered"] = $sce.trustAsHtml(
													'' + $scope.columns[j].filter(row)
												);
											} catch (e) {
												row[$scope.columns[j].name + "_filtered"] = $sce.trustAsHtml('');
											}
										}
									}
								}
								if ($scope.data.length != $scope.state.limit) {
									$scope.data.push(data[i]);
								} else {
									$scope.data[i] = data[i];
								}
								if (i + 1 == data.length) {
									$scope.rendered = true;
								}
							}, (i + initPause) * 90);
						} (i));
					}
				};

				$scope.updateOrder = function (columnName) {
					var oppositeOrderType = $scope.state.orderType === 'DESC' ? 'ASC' : 'DESC';
					var orderType = $scope.state.order === columnName ? oppositeOrderType : 'ASC';
					$scope.updateRoute({'order': columnName, 'orderType': orderType});
				};

				$scope.getPagesCount = function () {
					return Math.ceil(parseInt($scope.dataCount) / $scope.state.limit);
				};

				$scope.onDateFilterChange = function (stateKey) {
					$scope.show.date = null;
					$scope.state[stateKey] = $scope.stateDate[stateKey] ? new Date(parseInt($scope.stateDate[stateKey])).getTime() : null;
					$scope.changeCount();
				};

				$scope.initDate = function (stateKey) {
					return $scope.state[stateKey] ? new Date($scope.state[stateKey]) : null;
				}

				$scope.clearDateFilter = function (stateKey) {
					$scope.stateDate[stateKey + '_min']=null;
					$scope.stateDate[stateKey + '_max']=null;
					$scope.onDateFilterChange(stateKey + '_max');
					$scope.onDateFilterChange(stateKey + '_min');
				};

				$scope.setEmptyState = function (stateKey, value) {
					$scope.state[stateKey + '_max'] = $scope.state[stateKey + '_min'] = $scope.state[stateKey + '_wild'] = null;
					$scope.state[stateKey + "_empty"] = $scope.state[stateKey + "_empty"] == value ? null : value;
					$scope.changeCount();
				};

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
								case 'localdatetime':
									if (value) {
										while(value.length < 6) {
											value.push(0);
										}
										value = new Date(value[0], value[1] - 1, value[2], value[3], value[4], value[5]).getTime();
									}
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

			}
		], link: function($scope, $element, attr, ctrl, transclude) {

			if (! $scope.init) {
				return;
			}

			//inherit parent scope methods
			var parentScope = $element.scope();
			for (var key in parentScope) {
				if (! $scope[key] && typeof parentScope[key] === 'function' && key.substr(0, 1) != '$') {
					$scope[key] = parentScope[key];
				}
			}

			//set defaults
			$scope.state = jQuery.extend({}, $scope.state);
			$scope.stateDate = {};
			$scope.loadings = {};
			$scope.limits = $scope.init.limits ? $scope.init.limits : [5, 10, 20, 50, 100];
			$scope.actions = $scope.init.actions ? $scope.init.actions : [];
			$scope.show = {};
			$scope.columns = [];
			$scope.data = [];
			var columns = $scope.init.columns ? $scope.init.columns : []; //dont want to pre-render them - cause DOM lag
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
				var allEntityColumns = {};
				for (var key in entityFieldTypes) {
					if (typeof entityFieldTypes[key] !== 'object' && typeof entityFieldTypes[key] !== 'function'
						&& key.indexOf("_") === -1 && key.substr(0, 1) !== "$" && key !== "serialVersionUID")
					{
						var type = entityFieldTypes[key].split(".");
						allEntityColumns[key] = {
							name: key,
							originalType: entityFieldTypes[key].split(' ')[1],
							type: type[type.length - 1].toLowerCase(),
							filterType: ctrl.getFilterType(type),
							isSortable: true,
							isFilterable: key
						};
					}
				}
				// update table defined columns to fully set objects
				for (var i = 0; i < columns.length; i ++) {
					var defaultColumn = allEntityColumns[columns[i]];
					if (defaultColumn) {
						columns[i] = defaultColumn;
						// put defaults to column-object from table definition
					} else if (columns[i] !== 'string' && allEntityColumns[columns[i].name]) {
						defaultColumn = allEntityColumns[columns[i].name];
						for (var key in defaultColumn) {
							if (typeof columns[i][key] === 'undefined') {
								columns[i][key] = defaultColumn[key];
							}
						}
					}
					if (columns[i].filterType == 'string') {
						(function (column) {
							$scope.service.get({param: 'is-enum', fullClassName: column.originalType}, function (isEnum) {
								column.isEnum = isEnum && isEnum.value;
							});
						} (columns[i]));
					}
				}
				$scope.columns = columns;
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

			transclude($scope, function(clone) {
				$element.prepend(clone);
			});
			// console.log('peTable', $scope);
		}
	};
});