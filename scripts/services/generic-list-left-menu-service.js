define(['shell/shell-service-module'], function (shellServiceModule) {
    shellServiceModule.service('genericListLeftMenuService', ['settingService', '$resource', '$q',
        function (settingService, $resource, $q) {
            'use strict';

            var genericListLeftMenuResource = $resource(settingService.baseUrl.shellQuerySeverOdata + 'genericlistleftmenu');
            
            this.getGenericListLeftMenu = function (stateName) {
                var deferred = $q.defer();
                genericListLeftMenuResource.get({ '$filter': 'StateName eq ' + "'" + stateName + "'" }, function (data) {
                    deferred.resolve(data.value[0]);
                });
                return deferred.promise;
            };
        }]);
});