define(['app'], function (app) {
    app.directive('togglePopover', ['$document', '$location', '$timeout', '$rootScope', function ($document, $location, $timeout, $rootScope) {
        'use strict';

        var openElement = null, close, unbindWatch;
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function togglePopoverPathWatch() { return $location.path(); }, function togglePopoverPathWatchAction() {
                    //close && close();
                });

                var modelParts, newModel;

                if (attrs.togglePopover) {
                    modelParts = attrs.togglePopover.split("."), newModel = scope;
                    for (var i = 0; i < modelParts.length - 1; ++i) {
                        newModel = newModel[modelParts[i]];
                        if (!newModel) return;
                    }
                }

                function updateModel(value) {
                    if (modelParts) {
                        newModel[_.last(modelParts)] = value;
                    }
                }


                if (attrs.isDisabled) {
                    scope.$watch(attrs.isDisabled, function (newVal) {
                        if (newVal)
                            $timeout(function () {
                                $document.off('click', close);
                            });
                        else
                            element.triggerHandler('click');
                    });
                }


                element.on('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    var iWasOpen = false;

                    if (openElement) {
                        iWasOpen = openElement === element;
                        close && close();
                    }

                    if (!iWasOpen) {

                        updateModel(true);
                        openElement = element;

                        close = function (event) {
                            event && event.preventDefault();
                            event && event.stopPropagation();
                            $document.off('click', close);
                            unbindWatch();
                            updateModel(false);
                            if (scope.colseApp) scope.colseApp();
                            close = null;
                            openElement = null;
                            if (!$rootScope.$$phase)
                                scope.$apply();
                        };

                        unbindWatch = scope.$watch(attrs.togglePopover, function (newVal) {
                            if (!newVal)
                                $timeout(function () {
                                    close && close();
                                });
                        });

                        $document.on('click', close);
                        if (!$rootScope.$$phase)
                            scope.$apply();
                    }

                });

                if (newModel[_.last(modelParts)]) {
                    element.triggerHandler('click');
                }
                //}

                $rootScope.$on("appMenuShow", function (evt, args) {
                    //this called mulitple times need to check
                    if (args && args.isDashboardEmpty) {
                        var closeAppMenu = function () {
                            window.event && window.event.preventDefault();
                            window.event && window.event.stopPropagation();
                            $rootScope.showAppMenu = false;
                            $document.off('click', closeAppMenu);
                            if (!$rootScope.$$phase)
                                scope.$apply();
                        };
                        $document.on('click', closeAppMenu);
                    }
                });
            }
        };
    }]);
})