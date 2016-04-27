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
                meanData.getDesigns()
                    .success(function(data) {
                        vm.designs = data;
                })
            })
            .error( function(e) {
                console.log(e);
            });
        
    }   
})();