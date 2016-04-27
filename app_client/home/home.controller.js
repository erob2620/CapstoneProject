(function() {
    angular
        .module('app')
        .controller('homeCtrl', homeCtrl);
    
    function homeCtrl() {
        console.log('home controller is running');
    }
})();