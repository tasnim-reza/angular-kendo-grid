define(['app'],
    function(app) {
        app.controller('appMenuController', [
            '$scope', '$rootScope',
            function($scope, $rootScope) {
                'use strict';

                var groupDict = null;

                $scope.appMenu = {
                    open: false,
                    activeGroupId: 'allapps',
                    searchKey: '',
                    apps: null,
                    groups: null
                };

                $scope.openAppMenu = function() {
                    var nameProperty = 'Name' + $rootScope.currentCulture;
                    $scope.appMenu.open = true;
                    $scope.appMenu.searchKey = '';

                    contextService.getAppMenuApps($rootScope.loggedInUser.UserId).then(function(data) {
                        groupDict = angular.copy(data);
                        _.each(groupDict, function(group) {
                            if (group.Id == ContextGroupIdEnum.recentlyused) {
                                group.ProductApps = _.groupBy(group.ProductApps, function(app) {
                                    return '';
                                });
                            } else {
                                group.ProductApps = _.sortBy(group.ProductApps, function(app) {
                                    return app.AppDetail[nameProperty];
                                });
                                group.ProductApps = _.groupBy(group.ProductApps, function(app) {
                                    if (app.AppDetail && app.AppDetail[nameProperty])
                                        return app.AppDetail[nameProperty].substr(0, 1).toLowerCase();
                                    else return '';
                                });
                            }
                        });

                        $scope.appMenu.activeGroupId = ContextGroupIdEnum.allapps;
                        $scope.appMenu.groups = _.groupBy(groupDict, function(group) { return group.GroupType; });
                        $scope.showGroupTiles($scope.appMenu.activeGroupId);
                    });
                };

                $scope.showGroupTiles = function(groupId) {
                    var group = _.where(groupDict, { Id: groupId });
                    if (group && group.length > 0) {
                        group = group[0];
                        $scope.appMenu.apps = group.ProductApps;
                        $scope.appMenu.activeGroupId = groupId;
                        $scope.appMenu.searchKey = '';
                    }
                };

                $scope.searchTile = function() {
                    var activeGroup = _.where(groupDict, { Id: $scope.appMenu.activeGroupId })[0];
                    if ($scope.appMenu.searchKey) {
                        var nameProperty = 'Name' + $rootScope.currentCulture, mainStr, compareStr;

                        $scope.appMenu.apps = _.filter(activeGroup.ProductApps, function(groupItem, key) {
                            mainStr = key.toLowerCase();
                            if (!key) {
                                mainStr = compareStr = $scope.appMenu.searchKey.charAt(0).toLocaleLowerCase();
                            } else {
                                mainStr = key.toLowerCase();
                                compareStr = $scope.appMenu.searchKey.charAt(0).toLocaleLowerCase();
                            }
                            return _.startsWith(mainStr, compareStr);
                        });
                        $scope.appMenu.apps[0] = _.filter(_.first($scope.appMenu.apps), function(item) {
                            mainStr = item.AppDetail[nameProperty].toLowerCase(), compareStr = $scope.appMenu.searchKey.toLocaleLowerCase();
                            return _.startsWith(mainStr, compareStr);
                        });
                    } else {
                        $scope.appMenu.apps = activeGroup.ProductApps;
                    }
                };

                $rootScope.$on("appMenuShow", function() {
                    $scope.openAppMenu();
                });
            }
        ]);
    });