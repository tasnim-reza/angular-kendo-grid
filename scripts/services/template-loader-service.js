define(['app'], function (app) {
    app.service('templateLoaderService', ['$http', '$templateCache', function ($http, $templateCache) {
        'use strict';
        var self = this;

        self.getTemplate = function (url) {
            return $http.get(url, { cache: $templateCache }); 
        };
    }]);
});