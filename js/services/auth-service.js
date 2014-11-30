'use strict';

APP.service('AuthService', ['$rootScope', '$resource', '$http', '$q', 'GlobalService', '$location',
	function ($rootScope, $resource, $http, $q, GlobalService, $location) {

	var self = this;
	var lastHit = null;
	var principal = null;
	var loginUrl = GlobalService.getConfig("loginUrl");
	var Service = $resource(GlobalService.getConfig("servicesLocation") + "/auth/:param", null, {'put': {method: "PUT"}});

	self.login = function (user) {
		var deferred = $q.defer();
		Service.save(user, function (response) {
			principal = response;
			deferred.resolve(lastHit && lastHit != loginUrl ? lastHit : GlobalService.getConfig("initCtrl"));
		}, function () {
			deferred.resolve(false);
		});
		return deferred.promise;
	};

	self.logout = function () {
		var deferred = $q.defer();
		Service.delete(function () {}, function () {
			deferred.resolve(false);
		});
		return deferred.promise;
	};

	self.getPrincipal = function () {
		return principal;
	}

	$rootScope.$on('authError', function (e, rejection) {
		console.log('authError', $location.path(), loginUrl)
		if ($location.path() !== loginUrl) {
			lastHit = $location.path();
			$location.path(loginUrl);
		}
	});

}]);