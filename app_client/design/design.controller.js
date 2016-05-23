(function() {
    angular
        .module('app')
        .controller('designCtrl', designCtrl); 
    
    designCtrl.$inject = ['$location','$scope', 'DrawingService', 'meanData', 'authentication', '$routeParams'];
    
    function designCtrl($location, $scope, DrawingService, meanData, authentication, $routeParams) {
        var vm = this;
        vm.designId = $routeParams.designId;
        vm.currentUser = authentication.currentUser();
        vm.currentEmail = vm.currentUser.email;
        vm.currentName = vm.currentUser.name;
        vm.shareInfo = {
            id: $routeParams.designId,
            email: '',
            permission: ''
        };
        vm.textOptions = {
            text: '',
            fontFamily: '',
            fontSize: '',
            textAlign: ''
        };
        vm.copiedObject;
        vm.copiedObjects = new Array();
        vm.state = new Array();
        vm.mods = 0;
        vm.shapeType = 'line';
        vm.drawingMode = true;
        vm.isDown = false;
        vm.startPosition = {};
        vm.viewOnly = false;
        vm.canvas;
        vm.init = function() {
            vm.connectToSocket();
            console.log('initializing fabric');
            vm.canvas = new fabric.Canvas('c',{renderOnAddRemove: false});
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
                    vm.updateState();
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
                if(!vm.viewOnly) {
                    vm.canvas.loadFromJSON(design.design, vm.canvas.renderAll.bind(vm.canvas));
                    
                } else {
                    vm.canvas.loadFromJSON(design.design, vm.canvas.renderAll.bind(vm.canvas), function(o, object) {
                            object.set('selectable', false);
                    });
                }
                vm.updateState();
            }); 
            socket.on('messageRecieved', function(msg) {
                var messages = $('#messages');
                var date = new Date();
                var postfix = (date.getHours() >= 12) ? 'pm' : 'am';
                var hours = date.getHours() - (date.getHours() >= 12 ? 12 : 0);
                var minutes = (date.getMinutes() >= 10) ? date.getMinutes() : '0' + date.getMinutes();
                var time = hours + ':' + minutes + postfix;
                messages.append($('<li class="message">').html("<p class='messageName'>" + msg.name + "</p>" + "<p class='msgTime'>" + time + "</p>"  + "<p class='msgText'>" + msg.message + "</p>"));
                messages.scrollTop(messages[0].scrollHeight);
            });
        }
        vm.copy = function() {
            if(vm.canvas.getActiveGroup()){
                for(var i in vm.canvas.getActiveGroup().objects){
                    var object = fabric.util.object.clone(vm.canvas.getActiveGroup().objects[i]);
                    object.set("top", object.top+5);
                    object.set("left", object.left+5);
                    vm.copiedObjects[i] = object;
                }                    
            }
            else if(vm.canvas.getActiveObject()){
                var object = fabric.util.object.clone(vm.canvas.getActiveObject());
                object.set("top", object.top+5);
                object.set("left", object.left+5);
                vm.copiedObject = object;
                vm.copiedObjects = new Array();
            }
        }
        vm.paste = function() {
            if(vm.copiedObjects.length > 0){
                for(var i in vm.copiedObjects){
                    vm.canvas.add(vm.copiedObjects[i]);
                }                    
            }
            else if(vm.copiedObject){
                vm.canvas.add(vm.copiedObject);
            }
            vm.canvas.renderAll(); 
            vm.updateState();
            vm.saveCanvas();
        }
        vm.undo = function() {
            if(vm.mods < vm.state.length) {
                var index = vm.state.length - 1 - vm.mods - 1;
                console.log('index = ' + index);
                if(index > -1) {
                    vm.canvas.clear().renderAll();
                    vm.canvas.loadFromJSON(vm.state[index]);
                    vm.canvas.renderAll();
                    vm.mods += 1;
                    vm.saveCanvas();
                }
            }
        }
        vm.redo = function() {
            console.log(vm.mods);
            if(vm.mods > 0) {
                vm.canvas.clear().renderAll();
                vm.canvas.loadFromJSON(vm.state[vm.state.length - 1 - vm.mods + 1]);
                vm.canvas.renderAll();
                vm.mods -= 1;
                vm.saveCanvas();
            }
        }
        vm.sendMessage = function() {
            vm.message = {name: vm.currentName, message: $('#m').val()};
            $('#m').val('');
            socket.emit('sendMessage', vm.message);
        }
        function regularPolygonPoints(sideCount, radius) {
            var sweep = Math.PI*2/sideCount;
            var cx = radius + vm.shape.get('left');
            var cy = radius + vm.shape.get('top');
            var points = [];
            for(var i = 0; i < sideCount; i++) {
                var x = cx+radius*Math.cos(i*sweep);
                var y = cy+radius*Math.sin(i*sweep);
                points.push({x:x, y:y});
            }
            return points;
        }
        document.addEventListener('keydown', function(event) {
            switch (event.keyCode) {
                case 46:
                    if(vm.canvas.getActiveObject()) {
                        console.log('trying to delete');
                        var shapeToRemove = vm.canvas.getActiveObject();
                        vm.canvas.remove(shapeToRemove);
                        vm.canvas.remove(shapeToRemove);
                        vm.canvas.renderAll();
                        vm.updateState();
                        vm.saveCanvas();
                        return;
                    }
                    break;
                case 16:
                    vm.keepSquare = true;
                    break;
                case 67:
                    if(event.ctrlKey) {
                        event.preventDefault();
                        vm.copy();
                    }
                    break;
                case 86:
                    if(event.ctrlKey) {
                        event.preventDefault();
                        vm.paste();
                    }
                    break;
                case 90:
                    if(event.ctrlKey) {
                        event.preventDefault();
                        vm.undo();
                    }
                    break;
                case 89:
                    if(event.ctrlKey) {
                        event.preventDefault();
                        vm.redo();
                    }
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
        vm.updateState = function() {
            var canvasJson = vm.canvas.toJSON();
            var canvasString = JSON.stringify(canvasJson);
            vm.state.push(canvasString);

        }
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
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'rect';
            $('#rect').addClass('selectedButton'); 
            vm.canvas.defaultCursor = 'crosshair';
        };
        vm.changeToEllipse = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'ellipse';
            $('#ellipse').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';


        };
        vm.changeToTriangle = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'triangle';
            $('#triangle').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';

        };
        
        vm.changeToText = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'i-text';
            $('#i-text').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';


        };
        vm.changeToImgShape = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'imgShape';
            $('#imgShape').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';


        };
        vm.changeToPolygon = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'polygon';
            $('#polygon').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';


        };
        vm.changeToPointer = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'pointer';
            $('#pointer').addClass('selectedButton');
            vm.canvas.defaultCursor = 'default';


        };
        vm.changeToLine = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'line';
            $('#line').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';


        };
        $scope.toggleChat = function() {
            console.log('toggle chat called');
            if($('.chatBodyContainer').css('display') == 'inline-block') {
                $('.chatBodyContainer').css('display','none');  
            } else {
                $('.chatBodyContainer').css('display' ,'inline-block');
            }
        }
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
                if(!vm.drawingMode || vm.viewOnly || vm.shapeType == 'pointer') return;
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
                if(!vm.isDown || !vm.drawingMode || vm.viewOnly || vm.shapeType == 'pointer') return;
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
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        var radius = deltaX / 2;
                        vm.shape.set({points: regularPolygonPoints(6, radius)});
                        vm.shape.setWidth(deltaX);
                        vm.shape.setHeight(deltaY);
                        console.log(vm.shape);
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
                    case 'line':
                        console.log(vm.shape);
                        vm.shape.set({x2: event.e.offsetX, y2: event.e.offsetY});
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
                    } else if(vm.shapeType === 'line') {
//                        vm.shape.hasBorders = false;
//                        vm.shape.setControlsVisibility({bl:false, mb:false, ml:false, mr:false, mt:false, tr:false, mtr:false});
//                        vm.shape.lockUniScaling = false;
                    }
                    vm.canvas.setActiveObject(vm.shape);
                    console.log('calling save');
                    vm.updateState();
                    vm.saveCanvas();
                } 
            });
            vm.canvas.on('before:selection:cleared', function() {
                $('#textOptions').css('display', 'none');
            });
            vm.canvas.on('object:selected', function() {
                if(!vm.viewOnly) {
                    vm.drawingMode = false;
                    var shape = vm.canvas.getActiveObject();
                    $('#' + vm.shapeType).removeClass('selectedButton');
                    vm.shapeType = shape.type;
                    $('#' + vm.shapeType).addClass('selectedButton');
                    console.log(shape);
                    if(vm.shapeType === 'i-text') {
                        vm.textOptions.text = shape.text;
                        vm.textOptions.fontFamily = shape.fontFamily;
                        vm.textOptions.fontSize = shape.fontSize;
                        vm.textOptions.textAlign = shape.textAlign;
                        $scope.$apply();
                        $('#font-family select').val(shape.fontFamily);
                        $('#font-size').val(shape.fontSize);

                        $('#textOptions').css('display', 'inline-block');
                        $('#textValue').bind('change keyup', function() {
                            console.log(this.value);
                            shape.text = this.value;
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                        $('#font-family').change(function() {
                            console.log(this.value);
                            shape.fontFamily = this.value;
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                        $('#font-size').change(function() {
                            shape.fontSize = this.value;
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                        $('#font-align').change(function() {
                            shape.fontAlign = this.value;
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                        $('#toggleBold').on('click', function() {
                             shape.fontWeight = (shape.fontWeight === 'bold') ? 'normal' : 'bold';
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                        $('#toggleItalic').on('click', function() {
                            shape.fontStyle = (shape.fontStyle === 'italic') ? 'normal' : 'italic';
                            vm.canvas.renderAll();
                            vm.saveCanvas();

                        });
                        $('#toggleUnderline').on('click', function() {
                            shape.textDecoration = (shape.textDecoration === 'underline') ? '' : 'underline';
                            vm.canvas.renderAll();
                        });
                        $('#toggleLinethrough').on('click', function() {
                            shape.textDecoration = (shape.textDecoration === 'line-through') ? '' : 'line-through';
                            vm.canvas.renderAll();
                            vm.saveCanvas();
                        });
                    } else {
                        $('#textOptions').css('display', 'none');
                    }
                }
            });
            vm.canvas.on('object:moving', function() {
                vm.saveCanvas(); 
            });
            vm.canvas.on('object:scaling', function() {
                vm.saveCanvas(); 
            });
            vm.canvas.on('object:rotating', function() {
                vm.saveCanvas(); 
            });
            vm.canvas.on('selection:cleared', function() {
                vm.drawingMode = true;
            });
    
            vm.canvas.observe('object:modified', function(e) {
                e.target.resizeToScale();
                vm.updateState();
                console.log(vm.state);
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
//                        var points = this.get('points');
//                        for (var i = 0; i < points.length; i++) {
//                            var p = points[i];
//                            p.x *= this.scaleX;
//                            p.y *= this.scaleY;
//                        }
//                        this.scaleX = 1;
//                        this.scaleY = 1;
//                        this.width = this.getBoundingBox().width;
//                        this.height = this.getBoundingBox().height;
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