(function() {
    angular
        .module('app')
        .controller('designCtrl', designCtrl); 
    
    designCtrl.$inject = ['$location','$scope', 'DrawingService', 'meanData', 'authentication'];
    
    function designCtrl($location, $scope, DrawingService, meanData, authentication) {
        var vm = this;
        vm.designId;
        vm.shapeType = 'rect';
        vm.drawingMode = true;
        vm.isDown = false;
        vm.startPosition = {};
//        $scope.FabricConstants = FabricConstants;
        vm.canvas;
        vm.init = function() {
            console.log('initializing fabric');
            vm.canvas = new fabric.Canvas('c');
            console.log(vm.canvas);
            vm.canvas.selection = false;
            vm.setUpCanvas();
        };
        document.addEventListener('keydown', function(event) {
            console.log('in key down');
            switch (event.keyCode) {
                case 46:
                    if(vm.canvas.getActiveObject()) {
                        console.log('trying to delete');
                        var shapeToRemove = vm.canvas.getActiveObject();
                        vm.canvas.remove(shapeToRemove);
                        vm.canvas.remove(shapeToRemove);
                        vm.canvas.renderAll();
                        return;
                    }
                    break;
                case 16:
                    vm.keepSquare = true;
                    break;
            }
        });
        document.addEventListener('keyup', function(event) {
            switch( event.keyCode) {
                case 16: 
                    console.log('shift released');
                    MyApp.keepSquare = false;
                    break;
            }
        });
        vm.saveCanvas = function() {
            var canvasJson = vm.canvas.toJSON();
            console.log(canvasJson);
            var canvasString = JSON.stringify(canvasJson);
//            meanData.getProfile().success(function(data) {
//                console.log(data.email);
//                vm.currentUser = data.email;
//                console.log(vm.currentUser);
//
//            });
            vm.currentEmail = authentication.currentUser().email;
            console.log(vm.currentEmail);
            vm.design = {
                id: vm.designId,
                owner: vm.currentEmail,
                design: canvasString
            }
            meanData.saveDesign(vm.design);
        }
        vm.changeToRectangle = function() {
            vm.shapeType = 'rect';
        };
        vm.changeToEllipse = function() {
            vm.shapeType = 'ellipse';
        };
        vm.changeToTriangle = function() {
            vm.shapeType = 'triangle';
        };
        vm.setUpCanvas = function() {
            vm.canvas.on('mouse:down', function(event) {
                console.log(event);
                if(!vm.drawingMode) return;
                vm.isDown = true;
                vm.startPosition.x = event.e.offsetX - 5;
                vm.startPosition.y = event.e.offsetY - 5;
                vm.shape = DrawingService.createShape({
                    shapeType: vm.shapeType,
                    startPosition: vm.startPosition
                });
                console.log(vm.shape);
                vm.canvas.add(vm.shape);
            });
            vm.canvas.on('mouse:move', function(event) {
                var deltaX, deltaY;
                if(!vm.isDown || !vm.drawingMode) return;
                switch(vm.shapeType) {
                    case 'rect':
                        if(vm.keepSquare) {
                            deltaX = event.e.offsetX - vm.startPosition.x;
                            deltaY = deltaX;
                        } else {
                            deltaX = event.e.offsetX - vm.startPosition.x;
                            deltaY = event.e.offsetY - vm.startPosition.y;
                        }

                        vm.shape.setWidth(deltaX);
                        vm.shape.setHeight(deltaY);
                        vm.shape.setCoords();
                        break;
                    case 'ellipse':
                        var rx = Math.abs(vm.startPosition.x - event.e.offsetX) / 2;
                        var ry = Math.abs(vm.startPosition.y - event.e.offsetY) / 2;
                        if( rx > vm.shape.strokeWidth) {
                            rx -= vm.shape.strokeWidth / 2;
                        }                
                        if( ry > vm.shape.strokeWidth) {
                            ry -= vm.shape.strokeWidth / 2;
                        }
                        vm.shape.set({rx: rx, ry: ry});

                        if(vm.startPosition.x > event.e.offsetX) {
                            vm.shape.set({originX: 'right'});
                        } else {
                            vm.shape.set({originX: 'left'});
                        }
                        if(vm.startPosition.y > event.e.offsetY) {
                            vm.shape.set({originY: 'bottom'});
                        } else {
                            vm.shape.set({originY: 'top'});
                        }
                        vm.shape.setCoords();
                        break;
                    case 'triangle':
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        vm.shape.setWidth(deltaX);
                        vm.shape.setHeight(deltaY);
                        vm.shape.setCoords();
                        break;
                    case 'polygon':
                        var centerX = vm.shape.getCenterPoint().x;
                        console.log(vm.shape.getCenterPoint());
                        var radius = (event.e.offsetX - vm.startPosition.x) / 2;
                        var points = starPolygonPoints(vm.shape.get('points').length / 2, radius, radius / 2);
                        var boundingBox = vm.shape.getBoundingBox();
                        vm.shape.set({points: points, width: boundingBox.width, height: boundingBox.height});
                        vm.shape.setCoords();
                        break;
                }
                vm.canvas.renderAll();
            });
            vm.canvas.on('mouse:up', function(event) {
                vm.isDown = false;

                if(vm.drawingMode) {
                    if(vm.shapeType === 'rect') {
                        if(event.e.offsetY - vm.startPosition.y < 0) {
                            console.log('change spinner');
                            vm.shape.top = event.e.offsetY;
                            vm.shape.setHeight(vm.shape.getHeight() * -1);
                            vm.shape.setCoords();
                        }
                    } else if(vm.shapeType === 'triangle') {
                        if(vm.offsetY - vm.startPosition.y < 0) {
                            vm.shape.top = event.e.offsetY;
                            vm.shape.setHeight(vm.shape.getHeight() * -1);
                            vm.shape.rotate(180);
                            vm.shape.setCoords();
                        }
                    }
                    vm.canvas.setActiveObject(vm.shape);
                } 
            });
            vm.canvas.on('object:selected', function() {
                vm.drawingMode = false;
                var shape = vm.canvas.getActiveObject();
                vm.shapeType = shape.type;
                console.log(vm.shapeType);
            });
            vm.canvas.on('selection:cleared', function() {
                vm.drawingMode = true;
            });
    
            vm.canvas.observe('object:modified', function(e) {
                e.target.resizeToScale();
            });
            
            fabric.Object.prototype.resizeToScale = function() {
                switch(this.type) {
                    case 'rect':
                        this.width *= this.scaleX;
                        this.height *= this.scaleY;
                        this.scaleX = 1;
                        this.scaleY = 1; 
                        break;
                    case 'ellipse':
                        this.rx *= this.scaleX;
                        this.ry *= this.scaleY;
                        this.width = this.rx * 2;
                        this.height = this.ry * 2;
                        this.scaleX = 1;
                        this.scaleY = 1;
                        break;
                    case 'triangle':
                        this.width *= this.scaleX;
                        this.height *= this.scaleY;
                        this.scaleX = 1;
                        this.scaleY = 1;
                        break;
                    case 'polyline':
                    case 'polygon':
                        var points = this.get('points');
                        for (var i = 0; i < points.length; i++) {
                            var p = points[i];
                            p.x *= this.scaleX;
                            p.y *= this.scaleY;
                        }
                        this.scaleX = 1;
                        this.scaleY = 1;
                        this.width = this.getBoundingBox().width;
                        this.height = this.getBoundingBox().height;
                        break;
                }

            }
        }

        vm.init();
    }
})();