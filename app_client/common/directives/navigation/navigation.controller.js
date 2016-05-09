(function() {
    angular
        .module('app')
        .controller('navigationCtrl', navigationCtrl);
    navigationCtrl.$inject = ['$location', 'authentication', '$scope'];
    function navigationCtrl($location, authentication, $scope) {
        var vm = this;

        $scope.isLoggedIn = function() {
            return authentication.isLoggedIn();
        }
        $scope.currentUser = function() {
            if($scope.isLoggedIn()) {
                return authentication.currentUser().name;
            }
        }
        console.log($scope.isLoggedIn());
        $scope.logOut = function() {
            authentication.logout();
            $location.path('/');
        }
    }
})();