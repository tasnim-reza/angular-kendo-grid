define(['app', 'busy-screen/busy-screen-directive'], function (app) {
    app.service('busyScreenService', ['$document', '$rootScope', '$compile',
        function ($document, $rootScope, $compile) {
            'use strict';
            var self = this;
            self.showHomeButton = false;
            this.open = function (message, showBacktoDashboardButton) {
                if ($document.find('[busy-screen]').length == 0) {
                    var template = '<div busy-screen></div>',
                        busyScreenScope = $rootScope.$new(true);
                    self.showHomeButton = showBacktoDashboardButton ? showBacktoDashboardButton : false;
                    busyScreenScope.message = message;
                    if (showBacktoDashboardButton) {
                        busyScreenScope.showHomeButton = showBacktoDashboardButton;
                        busyScreenScope.backtoDashboard = function() {
                            self.showHomeButton = false;
                            $document.find('[busy-screen]').remove();
                            //$state.go("dashboard");
                        };
                    }

                    template = $compile(template)(busyScreenScope);
                    $document.find('body').prepend(template);
                }
            };

            this.close = function () {
                if (!self.showHomeButton) {
                    $document.find('[busy-screen]').remove();
                }
            };
        }]);
});