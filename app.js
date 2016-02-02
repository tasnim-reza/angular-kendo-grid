define(['angular'],
    function (angular) {
        'use strict';

        var shell = angular.module('angularKendoGrid', [])
            .run([function () {
                console.log('app running');
            }]);

        return shell;
    });