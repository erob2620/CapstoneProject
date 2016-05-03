(function() {
    angular
        .module('app')
        .controller('profileCtrl', profileCtrl);
    profileCtrl.$inject = ['$location', 'meanData', 'authentication'];
    function profileCtrl($location, meanData, authentication) {
        var vm = this;

        vm.user = {};
        vm.designs = {};
        vm.sharedDesigns = {};
        vm.currentEmail = authentication.currentUser().email;
        vm.design = {
            title: '',
            owner: vm.currentEmail,
            design: ''
        };
        meanData.getProfile()
            .success(function(data) {
                vm.user = data;
                console.log(vm.user.email);
                meanData.getDesigns(vm.user.email)
                    .success(function(data) {
                        console.log(data);
                        vm.designs = data.designs;
                        meanData.getSharedDesigns(vm.user.email)
                            .success(function(data) {
                            vm.sharedDesigns = data.sharedDesigns;
                        })
                        .error( function(e) {
                            console.log(e);
                        });
                    })
                    .error( function(e) {
                        console.log(e);
                    });
            })
            .error( function(e) {
                console.log(e);
            });
        vm.openModal = function() {
            console.log('modal opened');
            $('.designModal').css('display','block');
        };
        vm.closeModal = function() {
            $('.designModal').css('display', 'none');
        };
        vm.logOut = function() {
            authentication.logout();
            $location.path('/');
        }
        vm.submitNewDesign = function() {

            meanData.createDesign(vm.design)
                .error(function(e) {
                    console.log(e);
                })
                .success(function(data){
                    console.log('in controller');
                    console.log(data);
                    $location.path('/design/' + data.id);
                });
        };
    }
})();