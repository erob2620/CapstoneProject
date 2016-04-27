(function() {
    angular
        .module('app')
        .controller('designCtrl', designCtrl); 
    
    designCtrl.$inject = ['$location','$scope', 'Fabric', 'FabricConstants', 'Keypress'];
    
    function designCtrl($location, $scope, Fabric, FabricConstants, Keypress) {
        var vm = this;
        vm.shapeType = 'rect';
        vm.drawingMode = true;
        vm.isDown = false;
        vm.startPosition = {};
        $scope.fabric = {};
        $scope.FabricConstants = FabricConstants;
        
        vm.init = function() {
            console.log('initializing fabric');
            $scope.fabric = new Fabric({
                JSONExportProperties: FabricConstants.JSONExportProperties,
                textDefaults: FabricConstants.textDefaults,
                shapeDefaults: FabricConstants.shapeDefaults
//                json: $scope.main.selectedPage.json
            });
            $scope.fabric.setCanvasSize(800,800);
            $scope.fabric.selection = false;
        };
        vm.draw = function(event) {
            console.log('in draw');
            if(!vm.drawingMode) return;
            vm.isDown = true;
            vm.startPosition.x = event.e.offsetX - 5;
            vm.startPosition.y = event.e.offsetY - 5;
            vm.shape;
            console.log(vm.shapeType);
            switch(vm.shapeType) {
                case 'rect':
                    vm.shape = new fabric.Rect({
                        left: $scope.startPosition.x,
                        top: $scope.startPosition.y,
                        width:0,
                        height:0,
                        stroke:'black',
                        strokeWidth:1,
                        fill:'transparent'
                    });
                    break;
                case 'ellipse':
                    vm.shape = new fabric.Ellipse({
                        left: $scope.startPosition.x,
                        top: $scope.startPosition.y,
                        originX: 'left',
                        originY: 'top',
                        rx: 0,
                        ry: 0,
                        fill: 'transparent',
                        stroke: 'black',
                        strokeWidth: 1
                    });
                    break;
                case 'triangle':
                    vm.shape = new fabric.Triangle({
                        left: $scope.startPosition.x,
                        top: $scope.startPosition.y,
                        width:0,
                        height:0,
                        fill: 'transparent',
                        stroke: 'black',
                        strokeWidth: 1,
                    });
                    break;
                case 'polygon':
                    var points = starPolygonPoints(5, 0, 0);
                    shape = new fabric.Polygon(points, {
                        stroke: 'black',
                        left: startPosition.x - 10,
                        top: startPosition.y - 10,
                        originX: 'left',
                        originY: 'top',
                        fill: 'transparent',
                        strokeWidth: 1,
                        strokeLineJoin: 'bevil',
                        centeredScaling: true
                    }, true);
            }
            $scope.fabric.addShape(vm.shape);
        };
        vm.drawShape = function(event) {
            var deltaX, deltaY;
            if(!$scope.isDown || !$scope.drawingMode) return;
            switch($scope.shapeType) {
                case 'rect':
                    if($scope.keepSquare) {
                        deltaX = event.e.offsetX - $scope.startPosition.x;
                        deltaY = deltaX;
                    } else {
                        deltaX = event.e.offsetX - $scope.startPosition.x;
                        deltaY = event.e.offsetY - $scope.startPosition.y;
                    }

                    $scope.shape.setWidth(deltaX);
                    $scope.shape.setHeight(deltaY);
                    $scope.shape.setCoords();
                    break;
                case 'ellipse':
                    var rx = Math.abs($scope.startPosition.x - event.e.offsetX) / 2;
                    var ry = Math.abs($scope.startPosition.y - event.e.offsetY) / 2;
                    if( rx > $scope.shape.strokeWidth) {
                        rx -= $scope.shape.strokeWidth / 2;
                    }                
                    if( ry > $scope.shape.strokeWidth) {
                        ry -= $scope.shape.strokeWidth / 2;
                    }
                    $scope.shape.set({rx: rx, ry: ry});

                    if($scope.startPosition.x > event.e.offsetX) {
                        $scope.shape.set({originX: 'right'});
                    } else {
                        $scope.shape.set({originX: 'left'});
                    }
                    if($scope.startPosition.y > event.e.offsetY) {
                        $scope.shape.set({originY: 'bottom'});
                    } else {
                        $scope.shape.set({originY: 'top'});
                    }
                    $scope.shape.setCoords();
                    break;
                case 'triangle':
                    deltaX = event.e.offsetX - $scope.startPosition.x;
                    deltaY = event.e.offsetY - $scope.startPosition.y;
                    $scope.shape.setWidth(deltaX);
                    $scope.shape.setHeight(deltaY);
                    $scope.shape.setCoords();
                    break;
                case 'polygon':
                    var centerX = $scope.shape.getCenterPoint().x;
                    console.log($scope.shape.getCenterPoint());
                    var radius = (event.e.offsetX - $scope.startPosition.x) / 2;
                    var points = starPolygonPoints($scope.shape.get('points').length / 2, radius, radius / 2);
                    var boundingBox = $scope.shape.getBoundingBox();
                    $scope.shape.set({points: points, width: boundingBox.width, height: boundingBox.height});
                    $scope.shape.setCoords();
    //                shape.set({left: boundingBox.topLeft, top})
                    break;
            }
            $scope.fabric.renderAll();
        };
        vm.addDrawing = function(event) {
            $scope.isDown = false;

            if($scope.drawingMode) {
                if($scope.shapeType === 'rect') {
                    if(event.e.offsetY - $scope.startPosition.y < 0) {
                        console.log('change spinner');
                        $scope.shape.top = event.e.offsetY;
                        $scope.shape.setHeight($scope.shape.getHeight() * -1);
                        $scope.shape.setCoords();
                    }
                } else if($scope.shapeType === 'triangle') {
                    if(event.e.offsetY - $scope.startPosition.y < 0) {
                        $scope.shape.top = event.e.offsetY;
                        $scope.shape.setHeight($scope.shape.getHeight() * -1);
                        $scope.shape.rotate(180);
                        $scope.shape.setCoords();
                    }
                }
    //            MyApp.canvas.add(shape);
                $scope.fabric.setActiveObject($scope.shape);
    //            MyApp.canvas.off('mouse:move');

            } 
        }
//        $scope.$on('mouse:down', vm.draw(event));
//        $scope.$on('mouse:move', vm.drawShape(event));
//        $scope.$on('mouse:up', vm.addDrawing(event));
        $scope.$on('canvas:created', vm.init);
    }
})();