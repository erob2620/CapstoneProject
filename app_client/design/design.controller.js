(function() {
    angular
        .module('app')
        .controller('designCtrl', designCtrl); 
    
    designCtrl.$inject = ['$location','$scope', 'DrawingService', 'meanData', 'authentication', '$routeParams'];
    
    function designCtrl($location, $scope, DrawingService, meanData, authentication, $routeParams) {
        var vm = this;
        vm.designId = $routeParams.designId;
        vm.currentEmail = authentication.currentUser().email;
        vm.shareInfo = {
            id: $routeParams.designId,
            email: '',
            permission: ''
        };
        
        vm.shapeType = 'rect';
        vm.drawingMode = true;
        vm.isDown = false;
        vm.startPosition = {};
        vm.viewOnly = false;
        vm.canvas;
        vm.init = function() {
            vm.connectToSocket();
            console.log('initializing fabric');
            vm.canvas = new fabric.Canvas('c');
            vm.canvas.selection = false;
            vm.setUpCanvas();
            meanData.getDesign(vm.designId)
                .success(function(data) {
                    vm.setCanvasSize(data.design.size);
                    vm.canvasDesign = data.design.design;
                    if(data.permission === 'edit') {
                        vm.canvas.loadFromJSON(vm.canvasDesign, vm.canvas.renderAll.bind(vm.canvas));
                    } else {
                        vm.canvas.loadFromJSON(vm.canvasDesign, vm.canvas.renderAll.bind(vm.canvas), function(o, object) {
                            object.set('selectable', false);
                        });
                        vm.viewOnly = true;
                    }
                    vm.designName = data.design.title;
                })
                .error(function(e) {
                    console.log(e);
                });  
        };
        vm.connectToSocket = function(){
            console.log(location.pathname.toString());
            var pathArray = location.pathname.split('/');
            socket = io('/' + pathArray[1], {query: 'room=' + pathArray[2]});
            
            socket.on('updateGroup', function(msg) {
                console.log(msg); 
            });
            socket.on('designUpdate', function(design) {
                console.log(design);
                if(!vm.viewOnly) {
                    vm.canvas.loadFromJSON(design.design, vm.canvas.renderAll.bind(vm.canvas));
                    
                } else {
                    vm.canvas.loadFromJSON(design.design, vm.canvas.renderAll.bind(vm.canvas), function(o, object) {
                            object.set('selectable', false);
                    });
                }
            }); 
        }
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
                        vm.saveCanvas();
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
                    vm.keepSquare = false;
                    break;
            }
        });
        vm.saveCanvas = function() {
            var canvasJson = vm.canvas.toJSON();
            console.log(canvasJson);
            var canvasString = JSON.stringify(canvasJson);
            vm.currentEmail = authentication.currentUser().email;
            console.log(vm.currentEmail);
            vm.design = {
                id: vm.designId,
                owner: vm.currentEmail,
                design: canvasString
            }
            meanData.saveDesign(vm.design)
                .success(function(data) {
                    console.log(data);
                    console.log('about to call socket');
                    socket.emit('updateDesign', vm.design);
                })
                .error(function(e) {
                    console.log(e);
                });
        }
        vm.setCanvasSize = function(size) {
            console.log(size);
            vm.canvas.setWidth(size.width);
            vm.canvas.setHeight(size.height);

        };
        vm.changeToRect = function() {
            vm.shapeType = 'rect';
        };
        vm.changeToEllipse = function() {
            vm.shapeType = 'ellipse';
        };
        vm.changeToTriangle = function() {
            vm.shapeType = 'triangle';
        };
        vm.changeToText = function() {
            vm.shapeType = 'i-text';
        };
        vm.changeToImgShape = function() {
            vm.shapeType = 'imgShape';
        };
        vm.setUpCanvas = function() {
            document.getElementById('exportLink').addEventListener('click', function(e) {
                console.log('called');
                if(!fabric.Canvas.supports('toDataURL')) {
                    alert('This browlser doesn\'t support exporting')
                } else {
                    console.log('trying to export');
                    this.href = vm.canvas.toDataURL({
                        format: 'png',
                        quality: 0.8
                    });
                    this.download = vm.designName + '.png';
                }
            });
            vm.canvas.on('mouse:down', function(event) {
                if(!vm.drawingMode || vm.viewOnly) return;
                vm.isDown = true;
                vm.startPosition.x = event.e.offsetX - 5;
                vm.startPosition.y = event.e.offsetY - 5;
                vm.drawingMode = false;
                DrawingService.createShape({
                    shapeType: vm.shapeType,
                    startPosition: vm.startPosition
                }, function(shape) {
                    vm.shape = shape;
                    vm.canvas.add(vm.shape);
                    vm.canvas.renderAll();
                    vm.drawingMode = true;
                });

            });
            vm.canvas.on('mouse:move', function(event) {
                var deltaX, deltaY;
                if(!vm.isDown || !vm.drawingMode || vm.viewOnly) return;
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
                    case 'i-text':
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        vm.shape.setWidth(deltaX);
                        vm.shape.setCoords();
                        break;
                    case 'imgShape':
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        vm.shape._objects.forEach(function(item) {
                            item.setWidth(deltaX);
                            item.setHeight(deltaY);
                            item.setCoords();
                        });
                        var boundingRect = vm.shape.getBoundingRect();
                        console.log(vm.shape.oCoords);
                        vm.shape.set('left', vm.startPosition.x);
                        vm.shape.set('top', vm.startPosition.y);
                        vm.shape.setObjectsCoords();
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
                    } else if(vm.shapeType === 'imgShape') {
                        vm.shape.setWidth(vm.shape._objects[0].width);
                        vm.shape.setHeight(vm.shape._objects[0].height);
                        vm.shape.setTransformMatrix([1,0,0,1,-30,-20]);
                        vm.shape.setCoords();
                        console.log(vm.shape);
                        vm.canvas.renderAll();
                    }
                    vm.canvas.setActiveObject(vm.shape);
                    vm.saveCanvas();
                } 
            });
            vm.canvas.on('object:selected', function() {
                if(!vm.viewOnly) {
                    vm.drawingMode = false;
                    var shape = vm.canvas.getActiveObject();
                    vm.shapeType = shape.type;
                    console.log(vm.shapeType);
                }
            });
            vm.canvas.on('selection:cleared', function() {
                vm.drawingMode = true;
            });
    
            vm.canvas.observe('object:modified', function(e) {
                e.target.resizeToScale();
                vm.saveCanvas();
            });
            vm.openModal = function() {
                console.log('modal opened');
                $('.shareModal').css('display','block');
            };
            vm.closeModal = function() {
                $('.shareModal').css('display', 'none');
            };
            vm.shareDesign = function() {
                if(!vm.viewOnly) {
                meanData.shareDesign(vm.shareInfo)
                    .success(function(data){
                        console.log(data);
                        vm.closeModal();
                        alert('Project shared');
                    })
                    .error(function(e) {
                        console.log(e);
                    });
                }
            };

            fabric.Object.prototype.resizeToScale = function() {
                console.log(this);
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
                    case 'imgShape':
                        this.width *= this.scaleX;
                        this.height *= this.scaleY;
                        this.scaleX = 1;
                        this.scaleY = 1;
                        break;
                }

            }
        }

        vm.init();
    }
})();