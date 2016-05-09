(function() {
    angular
        .module('app')
        .controller('loginCtrl', loginCtrl);
    
    loginCtrl.$inject = ['$location', 'authentication', '$scope'];
    function loginCtrl($location, authentication,$scope) {
        var vm = this;

        vm.credentials = {
            email: '',
            password: ''
        };

        vm.onSubmit = function() {
            authentication
                .login(vm.credentials)
                .error(function(err) {
                    console.log(err);
                    $scope.error = err.message;
//                    $scope.$apply();
                })
                .then(function() {
                    $location.path('profile');
                });
        };
    }
})();