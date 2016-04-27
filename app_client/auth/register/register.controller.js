(function() {
    
    angular
        .module('app')
        .controller('registerCtrl', registerCtrl);
    registerCtrl.$inject = ['$location', 'authentication'];
    function registerCtrl($location, authentication) {
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
                    console.log(err);
                })
                .then(function() {
                    $location.path('profile');
                });
        };
    }
})();