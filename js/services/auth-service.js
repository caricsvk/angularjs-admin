'use strict';

APP.service('AuthService', ['$rootScope', '$resource', '$http', '$q', 'GlobalService',
	function ($rootScope, $resource, $http, $q, GlobalService) {

	var self = this;
	var lastHit = null;
	var principal = null;
	var loginUrl = GlobalService.getConfig("loginUrl");
	var Service = $resource(GlobalService.getConfig("servicesLocation") + "/auth/:param", null, {'put': {method: "PUT"}});

	self.login = function (user) {
		Service.save(user, function (response) {
			principal = response;
			location.href = lastHit && lastHit != loginUrl ? lastHit : "#";
		}, function () {
			$scope.showAjaxMessage('Your login or password is incorrect.','danger');
		});
	};

	self.logout = function () {
		Service.delete(function () {}, function () {
			$scope.showAjaxMessage('Logout unsucessful, please try again.','danger');
		});
	};

	self.getPrincipal = function () {
		return principal;
	}

	$rootScope.$on('authError', function (e, rejection) {
		if (location.hash !== loginUrl) {
			lastHit = location.hash;
			location.href = loginUrl;
		}
	});

}]);