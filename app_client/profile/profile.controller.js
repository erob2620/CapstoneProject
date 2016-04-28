(function() {
    angular
        .module('app')
        .controller('profileCtrl', profileCtrl);
    profileCtrl.$inject = ['$location', 'meanData'];
    function profileCtrl($location, meanData) {
        var vm = this;

        vm.user = {};
        vm.designs = {};
        meanData.getProfile()
            .success(function(data) {
                vm.user = data;
                console.log(vm.user.email);
                meanData.getDesigns(vm.user.email)
                    .success(function(data) {
                        console.log(data);
                        vm.designs = data.designs;
                    })
                    .error( function(e) {
                        console.log(e);
                    });
            })
            .error( function(e) {
                console.log(e);
            });
        
    }   
})();