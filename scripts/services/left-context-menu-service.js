define(['app'], function (app) {
    app.service('leftContextMenuService', ['$http', '$q',
        function ($http, $q) {
            'use strict';

            this.saveUserSettings = function (data, userId) {
                var key = buildLeftContextMenuKey(userId);
                var autoSaveData = buildAutoSaveData(key, null, null, data, null, userId);
                //autoSaveService.sendUserSettingCliendCommand(autoSaveData);
                console.warn('need to implement user setting saving');
            };

            this.getLeftContextMenuUserSettings = function (userId) {
                var key = buildLeftContextMenuKey(userId), deferred = $q.defer(),
                    url = '/UserSettingServer/odata/' + 'usersettingdata?' + '$select=UserSettingKey,Content&' + '$filter=UserSettingKey eq \'' + key + '\'';
                //$resource(url).get(
                //    function (data) {
                //        deferred.resolve(_.first(data.value));
                //    },
                //    function (error) {
                //        deferred.reject(error);
                //    }
                //);
                deferred.resolve([]);
                return deferred.promise;
            };

            this.getDesktopAppDownloadUrl = function () {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            };

            this.buildContent = function (isMenuExpanded) {
                return {
                    isContextMenuExpanded: isMenuExpanded
                };
            };

            function buildLeftContextMenuKey(userId) {
                var stateName = 'kendo';
                return 'leftcontextmenu_' + userId + '_' + stateName[0];
            }

            function buildAutoSaveData(key, parentKey, trackKey, data, resource, userId) {
                return {
                    AutoSaveKey: key,
                    ParentAutoSaveKey: parentKey,
                    TrackKey: trackKey,
                    Content: data,
                    //ModelName: ModelName[resource],
                    ModelName: null,
                    CreatedDate: new Date(),
                    ModifiedDate: new Date(),
                    $type: 'PubliWeb.AutoSave.Dtos.AutoSaveData, PubliWeb.AutoSave.Dtos',
                    UserId: userId
                };
            }
        }]);
});