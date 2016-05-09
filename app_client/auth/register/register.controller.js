(function() {
    
    angular
        .module('app')
        .controller('registerCtrl', registerCtrl);
    registerCtrl.$inject = ['$location', 'authentication', '$scope'];
    function registerCtrl($location, authentication, $scope) {
        var vm = this;

        vm.credentials = {
            name: "",
            email: "",
            password: ""
        };

        vm.onSubmit = function() {
            console.log('submitting registration');
            authentication
                .register(vm.credentials)
                .error(function(err) {
                    $scope.error = err.message;
                })
                .then(function() {
                    $location.path('profile');
                });
        };
    }
})();