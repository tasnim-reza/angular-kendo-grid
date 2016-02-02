define(['app'], function (app) {
    app.service('savedSearchCategoryService', ['$q', '$http',
        function ($q, $http) {
            'use strict';

            this.get = function () {
                var deferred = $q.defer();

                //savedSearchCategory.get({ '$filter': 'Id ne guid'+"'"  + SavedSearchCategoryEnum.RecentlyUsed+"'" },function(data) {
                //    deferred.resolve(data.value);
                //},
                //    function(error) {
                //        deferred.reject(error);
                //    });

                deferred.resolve([
                {
                    name: 'test'
                }]);

                return deferred.promise;
            };

            this.save = function (categoryName) {
                var deferred = $q.defer();

                //savedSearchCategory.save({ Name: categoryName, Id: _.getGuid() }, function (data) {
                //    deferred.resolve(data.value);
                //},
                //    function (error) {
                //        deferred.reject(error);
                //    });

                deferred.resolve([
                {
                    name: 'test'
                }]);

                return deferred.promise;
            };

        }]);
});