define(['shell/shell-service-module', 'shellService/setting-service' , 'shell/enums/shell-enum'], function (shellServiceModule) {
    shellServiceModule.service('savedSearchCategoryService', ['$q','$resource', 'settingService',
        function ($q,$resource, settingService) {
            'use strict';

            var savedSearchCategory = $resource(settingService.baseUrl.shellQuerySeverOdata + 'savedsearchcategory');            
                
            this.get = function() {
                var deferred = $q.defer();
                savedSearchCategory.get({ '$filter': 'Id ne guid'+"'"  + SavedSearchCategoryEnum.RecentlyUsed+"'" },function(data) {
                    deferred.resolve(data.value);
                },
                    function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };

            this.save = function (categoryName) {
                var deferred = $q.defer();
                savedSearchCategory.save({ Name: categoryName, Id: _.getGuid() }, function(data) {
                        deferred.resolve(data.value);
                    },
                    function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };

        }]);
});