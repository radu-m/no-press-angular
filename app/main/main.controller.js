class MainController {

    constructor($rootScope, $location, $state, $scope, $timeout, $mdToast, mdDialog) {        
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.$state = $state;
        this.$scope = $scope;        
        this.$timeout = $timeout;

        this.spinTimer = null;

        this.$scope.$root.cookiesAreAllowed = true;
        this.$scope.pageWideSpinner = {
            spin: false,
            hasBg: true
        };

        this.$rootScope.$on('$stateChangeStart', () => {
            if(toState.name == 'home') {
                this.spinTimer = $timeout(function () {
                    this.$scope.pageWideSpinner.spin = true;
                }, 300);
            }
        });
    
        this.$rootScope.$on('$stateChangeSuccess', () => {
            if (this.spinTimer) {
                this.$timeout.cancel(this.spinTimer);
            }

            this.$scope.pageWideSpinner.spin = false;
        });
        console.log(this)
    }


}

MainController.$inject = ['$rootScope', '$location', '$state', '$scope', '$timeout', '$mdToast', '$mdDialog'];
export default MainController;