(function() {
    angular
        .module('app')
        .controller('designCtrl', designCtrl); 
    
    designCtrl.$inject = ['$location','$scope', 'DrawingService', 'meanData', 'authentication', '$routeParams'];
    
    function designCtrl($location, $scope, DrawingService, meanData, authentication, $routeParams) {
        var vm = this;
        vm.lastTime = new Date().getTime();
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
        vm.shapeType = 'pointer';
        vm.drawingMode = true;
        vm.isDown = false;
        vm.startPosition = {};
        vm.viewOnly = false;
        vm.canvas;
        vm.init = function() {
            vm.connectToSocket();
            vm.canvas = new fabric.Canvas('c',{renderOnAddRemove: false});
            vm.canvas.selection = false;
            vm.setUpCanvas();
            vm.canvas.observe('mouse:down', vm.objectSelectedHandler);
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
        vm.objectSelectedHandler = function(event) {
            console.log('in selected handler')
            var date = new Date();
            var now  = date.getTime();
            if(now - vm.lastTime < 400) {
                console.log('double clicked');
                vm.doubleClickedHandler(event);
            } else {
                console.log(document.getElementById('shapeInfoDiv'));
                document.getElementById('shapeInfoDiv').style.display = 'none';

            }
            vm.lastTime = now;
        };
        vm.doubleClickedHandler = function(event) {
            var shape = vm.canvas.getActiveObject();
            console.log(shape);
            $('#label').val(shape.label);
            $('#comment').val(shape.comment);
            $('.shapeInfoModal').css('display','inline-block');
        };
        vm.saveShapeInfo = function() {
            var shape = vm.canvas.getActiveObject();
            console.log(shape);
            shape.label = $('#label').val();
            shape.comment = $('#comment').val();
            vm.updateDesign();
            vm.saveCanvas();
        };
        vm.connectToSocket = function(){
            var pathArray = location.pathname.split('/');
            socket = io('/' + pathArray[1], {query: 'room=' + pathArray[2] + '&name=' + vm.currentName});
            
            socket.on('updateGroup', function(msg) {
                console.log(msg); 
                var messages = $('#messages');
                var date = new Date();
                var postfix = (date.getHours() >= 12) ? 'pm' : 'am';
                var hours = date.getHours() - (date.getHours() > 12 ? 12 : 0);
                var minutes = (date.getMinutes() >= 10) ? date.getMinutes() : '0' + date.getMinutes();
                var time = hours + ':' + minutes + postfix;
                messages.append($('<li class="message">').html("<p class='msgTime'>" + time + "</p>" + "<p class='userJoinedMessage'>" + msg + "</p>"));
                messages.scrollTop(messages[0].scrollHeight);
                if($('.chatBodyContainer').css('display') == 'none') {
                    $('.chatHeader').addClass('notification');
                }
            });
            socket.on('designUpdate', function(design) {
                if(!vm.viewOnly) {
                    console.log(design);
                    fabric.util.enlivenObjects([JSON.parse(design.shape)], function(object) {
                        vm.canvas.insertAt(object[0],design.index, true);
                        vm.canvas.renderAll();

                    });
                    
                    
                } else {
                    fabric.util.enlivenObjects([JSON.parse(design.shape)], function(object) {
                        object.set('selectable', false);
                        vm.canvas.insertAt(object[0],design.index, true);
                    });
                    vm.canvas.renderAll();
                }
                vm.updateState();
            }); 
            socket.on('shapeToAdd', function(shape) {
                if(!vm.viewOnly) {
                    
                    fabric.util.enlivenObjects([JSON.parse(shape.shape)], function(object) {
                        vm.canvas.add(object[0]);
                        vm.canvas.renderAll();
                    });
                    
                } else {
                    fabric.util.enlivenObjects([JSON.parse(shape.shape)], function(object) {
                        object.set('selectable', false);
                        vm.canvas.insertAt(object[0],shape.index, true);
                    });
                    vm.canvas.renderAll();
                }
                vm.updateState();
            });
            socket.on('shapeToRemove', function(toRemove) {
                if(!vm.viewOnly) {
                    
                    fabric.util.enlivenObjects([JSON.parse(toRemove.shape)], function(object) {
                        vm.canvas.insertAt(object[0],toRemove.index, true);
                        vm.canvas.remove(object[0]);
                        vm.canvas.renderAll();

                    });
                    
                } else {
                    fabric.util.enlivenObjects([JSON.parse(toRemove.shape)], function(object) {
                        vm.canvas.insertAt(object[0],toRemove.index, true);
                        vm.canvas.remove(object[0]);
                    });
                    vm.canvas.renderAll();
                }
                vm.updateState();
            });
            socket.on('messageRecieved', function(msg) {
                var messages = $('#messages');
                var date = new Date();
                var postfix = (date.getHours() >= 12) ? 'pm' : 'am';
                var hours = date.getHours() - (date.getHours() > 12 ? 12 : 0);
                var minutes = (date.getMinutes() >= 10) ? date.getMinutes() : '0' + date.getMinutes();
                var time = hours + ':' + minutes + postfix;
                messages.append($('<li class="message">').html("<p class='messageName'>" + msg.name + "</p>" + "<p class='msgTime'>" + time + "</p>"  + "<p class='msgText'>" + msg.message + "</p>"));
                messages.scrollTop(messages[0].scrollHeight);
                if($('.chatBodyContainer').css('display') == 'none') {
                    $('.chatHeader').addClass('notification');
                }
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
                vm.updateDesign();
            }
            vm.canvas.renderAll(); 
            vm.updateState();
            vm.saveCanvas();
        }
        vm.undo = function() {
            if(vm.mods < vm.state.length) {
                var index = vm.state.length - 1 - vm.mods - 1;
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
            if(vm.mods > 0) {
                vm.canvas.clear().renderAll();
                vm.canvas.loadFromJSON(vm.state[vm.state.length - 1 - vm.mods + 1]);
                vm.canvas.renderAll();
                vm.mods -= 1;
                vm.saveCanvas();
            }
        }
        vm.sendMessage = function() {
            if($('#m').val() != '') {
                vm.message = {name: vm.currentName, message: $('#m').val()};
                $('#m').val('');
                socket.emit('sendMessage', vm.message);
            }
        }
        function regularPolygonPoints(sideCount, radius) {
            var sweep = Math.PI*2/sideCount;
            var cx = radius; 
            var cy = radius;
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
                        var shapeToRemove = vm.canvas.getActiveObject();
                        vm.updateShapeDeletion();
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
            if(event.target.type == 'text' || event.target.id == 'comment' || event.target.id == 'textValue') return false;
            switch( event.keyCode) {
                case 16: 
                    vm.keepSquare = false;
                    break;
                case 86:
                case 27:
                    if(!event.ctrlKey) vm.changeToPointer();
                    break;
                case 84:
                    vm.changeToText();
                    break;
                case 83:
                    vm.changeToRect();
                    break;
                case 80:
                    vm.changeToPolygon();
                    break;
                case 69:
                    vm.changeToEllipse();
                    break;
                case 73:
                    vm.changeToImgShape();
                    break;
                case 76:
                    vm.changeToLine();
                    break;
                case 82:
                    vm.changeToTriangle();
                    break;
                    
            }
        });
        vm.updateState = function() {
            var canvasJson = vm.canvas.toDatalessJSON(['label','comment']);
            var canvasString = JSON.stringify(canvasJson);
            vm.state.push(canvasString);

        }
        vm.saveCanvas = function() {
            var canvasJson = vm.canvas.toDatalessJSON(['label','comment']);
            var canvasString = JSON.stringify(canvasJson);
            vm.currentEmail = authentication.currentUser().email;
            vm.design = {
                id: vm.designId,
                owner: vm.currentEmail,
                design: canvasString
            }
            meanData.saveDesign(vm.design)
                .success(function(data) {
                })
                .error(function(e) {
                    console.log(e);
                });
        }
        vm.updateDesign = function() {
            var toUpdate = {index: vm.canvas.getObjects().indexOf(vm.canvas.getActiveObject()), shape: JSON.stringify(vm.canvas.getActiveObject().toDatalessObject(['label','comment']))};
            console.log(toUpdate);
            socket.emit('updateDesign', toUpdate);
        };
        vm.updateShapeDeletion = function() {
            var toDelete = {index: vm.canvas.getObjects().indexOf(vm.canvas.getActiveObject()), shape: JSON.stringify(vm.canvas.getActiveObject().toDatalessObject())};
            socket.emit('deleteShape', toDelete);
        }
        vm.shapeAdded = function() {
            var toAdd = {shape: JSON.stringify(vm.canvas.getActiveObject().toDatalessObject(['label','comment']))};
            console.log(toAdd);
            socket.emit('addShape', toAdd);
        };
        vm.setCanvasSize = function(size) {
            vm.canvas.setWidth(size.width);
            vm.canvas.setHeight(size.height);

        };
        vm.changeToRect = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'rect';
            $('#rect').addClass('selectedButton'); 
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
        };
        vm.changeToEllipse = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'ellipse';
            $('#ellipse').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
        };
        vm.changeToTriangle = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'triangle';
            $('#triangle').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
        };
        
        vm.changeToText = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'i-text';
            $('#i-text').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
        };
        vm.changeToImgShape = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'image';
            $('#image').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
        };
        vm.changeToPolygon = function() {
            $('#' + vm.shapeType).removeClass('selectedButton');
            vm.shapeType = 'polygon';
            $('#polygon').addClass('selectedButton');
            vm.canvas.defaultCursor = 'crosshair';
            vm.canvas.discardActiveObject().renderAll();
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
            vm.canvas.discardActiveObject().renderAll();
        };
        $scope.toggleChat = function() {
            if($('.chatBodyContainer').css('display') == 'inline-block') {
                $('.chatBodyContainer').css('display','none');  
            } else {
                $('.chatBodyContainer').css('display' ,'inline-block');
                $('.chatHeader').removeClass('notification');
            }
        }
        vm.setUpCanvas = function() {
            document.getElementById('exportLink').addEventListener('click', function(e) {
                if(!fabric.Canvas.supports('toDataURL')) {
                    alert('This browlser doesn\'t support exporting')
                } else {
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
                        var radius = (deltaX / 2) - 4;
                        vm.shape.set({points: regularPolygonPoints(6, radius)});
                        vm.shape.setWidth(deltaX);
                        vm.shape.setHeight(deltaY);
                        vm.shape.set('left', vm.startPosition.x);
                        vm.shape.set('top', vm.startPosition.y);
                        vm.shape.setCoords();
                        break;
                    case 'i-text':
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        vm.shape.setWidth(deltaX);
                        vm.shape.set('left', vm.startPosition.x);
                        vm.shape.set('top', vm.startPosition.y);
                        vm.shape.setCoords();
                        break;
                    case 'image':
                        deltaX = event.e.offsetX - vm.startPosition.x;
                        deltaY = event.e.offsetY - vm.startPosition.y;
                        
                        vm.shape.setWidth(deltaX);
                        vm.shape.setHeight(deltaY);
                        vm.shape.setCoords();
                        
                        //var boundingRect = vm.shape.getBoundingRect();
//                        vm.shape.set('left', vm.startPosition.x);
//                        vm.shape.set('top', vm.startPosition.y);
//                        vm.shape.setObjectsCoords();
                        break;
                    case 'line':
                        vm.shape.set({x2: event.e.offsetX, y2: event.e.offsetY});
                        break;
                }
                vm.canvas.renderAll();
            });
            vm.canvas.on('mouse:up', function(event) {
                vm.isDown = false;

                if(vm.drawingMode && vm.shapeType != 'pointer') {
                    if(vm.shapeType === 'rect') {
                        if(event.e.offsetY - vm.startPosition.y < 0) {
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
                    } else if(vm.shapeType === 'image') {
//                        vm.shape.setWidth(vm.shape._objects[0].width);
//                        vm.shape.setHeight(vm.shape._objects[0].height);
//                        vm.shape.setCoords();
//                        vm.canvas.renderAll();
                    } else if(vm.shapeType === 'line') {
//                        vm.shape.hasBorders = false;
//                        vm.shape.setControlsVisibility({bl:false, mb:false, ml:false, mr:false, mt:false, tr:false, mtr:false});
//                        vm.shape.lockUniScaling = false;
                    }
                    vm.canvas.setActiveObject(vm.shape);
                    vm.updateState();
                    vm.shapeAdded();
                    console.log('calling save canvas from mouse up');
                    vm.saveCanvas();
                } 
                vm.drawingMode = false;
            });
            vm.canvas.on('selection:cleared', function() {
                $('#textOptions').css('display', 'none');
                console.log(document.getElementById('shapeInfoDiv'));
                document.getElementById('shapeInfoDiv').style.display = 'none';
            });
            vm.canvas.on('object:selected', function() {
                if(!vm.viewOnly) {
                    vm.drawingMode = false;
                    var shape = vm.canvas.getActiveObject();
                    $('#' + vm.shapeType).removeClass('selectedButton');
                    $('#' + vm.shapeType).addClass('selectedButton');
                    if(shape.type === 'i-text') {
                        vm.textOptions.text = shape.text;
                        vm.textOptions.fontFamily = shape.fontFamily;
                        vm.textOptions.fontSize = shape.fontSize;
                        vm.textOptions.textAlign = shape.textAlign;
                        $scope.$apply();
                        $('#font-family select').val(shape.fontFamily);
                        $('#font-size').val(shape.fontSize);

                        $('#textOptions').css('display', 'inline-block');
                        $('#textValue').bind('change keyup', function() {
                            vm.canvas.getActiveObject().text = this.value;
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#font-family').change(function() {
                            vm.canvas.getActiveObject().fontFamily = this.value;
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#font-size').change(function() {
                           vm.canvas.getActiveObject().fontSize = this.value;
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#font-align').change(function() {
                            vm.canvas.getActiveObject().fontAlign = this.value;
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#toggleBold').on('click', function() {
                             vm.canvas.getActiveObject().fontWeight = (vm.canvas.getActiveObject().fontWeight === 'bold') ? 'normal' : 'bold';
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#toggleItalic').on('click', function() {
                            vm.canvas.getActiveObject().fontStyle = (vm.canvas.getActiveObject().fontStyle === 'italic') ? 'normal' : 'italic';
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();

                        });
                        $('#toggleUnderline').on('click', function() {
                            vm.canvas.getActiveObject().textDecoration = (vm.canvas.getActiveObject().textDecoration === 'underline') ? '' : 'underline';
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                        $('#toggleLinethrough').on('click', function() {
                            vm.canvas.getActiveObject().textDecoration = (vm.canvas.getActiveObject().textDecoration === 'line-through') ? '' : 'line-through';
                            vm.canvas.renderAll();
                            vm.updateDesign();
                            vm.updateState();
                            vm.saveCanvas();
                        });
                    } else {
                        $('#textOptions').css('display', 'none');
                    }
                }
            });
            vm.canvas.on('mouse:over', function(e) {
                if(e.target && vm.shapeType != 'pointer') {
                    console.log('false selection');
                    e.target.set('selectable',false);
                } else if(e.target && vm.shapeType == 'pointer') {
                    console.log('make selectable again');
                    e.target.set('selectable', true);
                }
                
            });
            vm.canvas.on('object:moving', function() {
                vm.saveCanvas(); 
                vm.updateDesign();
            });
            vm.canvas.on('object:scaling', function() {
//                vm.saveCanvas(); 
//                vm.updateDesign();

            });
            vm.canvas.on('object:rotating', function() {
//                vm.saveCanvas(); 
//                vm.updateDesign();

            });
            vm.canvas.on('selection:cleared', function() {
                vm.drawingMode = true;
            });
    
            vm.canvas.observe('object:modified', function(e) {
                console.log('object modified');
                e.target.resizeToScale();
                vm.updateState();
                vm.updateDesign();
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
                        vm.closeModal();
                        alert('Project shared');
                    })
                    .error(function(e) {
                        console.log(e);
                    });
                }
            };

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
                    case 'image':
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