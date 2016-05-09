(function() {
    angular
        .module('app')
        .controller('profileCtrl', profileCtrl);
    profileCtrl.$inject = ['$location', 'meanData', 'authentication', '$scope'];
    function profileCtrl($location, meanData, authentication, $scope) {
        var vm = this;

        vm.user = {};
        vm.designs = {};
        vm.sharedDesigns = {};
        vm.currentEmail = authentication.currentUser().email;
        vm.design = {
            title: '',
            owner: vm.currentEmail,
            design: '',
            size: ''
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
        $scope.openDiv = function(value) {
            console.log(value);
            if(value === 'custom') {
                console.log('yay custom');
                document.getElementById('customSizeDiv').style.display = 'block';
                document.getElementById('width').required = true;
                document.getElementById('height').required = true;
                
            } else {
                console.log('no custom');
                document.getElementById('customSizeDiv').style.display = 'none';
                document.getElementById('height').required = false;
                document.getElementById('width').required = false;

            }
        };
        vm.closeModal = function() {
            $('.designModal').css('display', 'none');
        };
        vm.timeSince = function(date) {
            var oldDate = new Date(date);
            var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
             return monthNames[oldDate.getMonth()] + ' ' + oldDate.getDate() + ', ' + oldDate.getFullYear();
        };
        vm.submitNewDesign = function() {
            if(vm.design.size === 'Large') {
                vm.design.size = {width: 1500, height:1000};
            } else if(vm.design.size === 'Medium') {
                vm.design.size = {width: 800, height: 800};
            } else if(vm.design.size === 'Small') {
                vm.design.size = {width: 400, height: 600};
            } else if(vm.design.size === 'Custom') {
                vm.design.size = {width: document.getElementById('width').value, height: document.getElementById('height').value};
            }
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