define(['app'], function (app) {
    app.service('genericListLeftMenuService', ['$q', '$http',
        function ($q, $http) {
            'use strict';

            this.getGenericListLeftMenu = function (stateName) {
                var deferred = $q.defer();

                deferred.resolve([
                {
                    name: 'Active'
                }]);

                return deferred.promise;
            };


        }]);
});