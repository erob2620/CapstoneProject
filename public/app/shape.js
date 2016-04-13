var MyApp = {};
function setUpFabric() {
    MyApp.canvas = new fabric.Canvas('c');
    MyApp.keepSquare = false;
    var line, isDown, startPosition={}, rect, drawingMode = true;
    MyApp.canvas.selection = false;
    MyApp.canvas.on('mouse:down', function(event) {
        if(!drawingMode) return;
        isDown = true;
        startPosition.x = event.e.offsetX - 5;
        startPosition.y = event.e.offsetY - 5;
        
        console.log(startPosition);
        
        rect = new fabric.Rect({
            left: startPosition.x,
            top: startPosition.y,
            width:0,
            height:0,
            stroke:'black',
            strokeWidth:1,
            fill:undefined
        });
        MyApp.canvas.add(rect);
        
    });
    
    MyApp.canvas.on('mouse:move', function(event) {
        var deltaX, deltaY;
        if(!isDown || !drawingMode) return;
        if(MyApp.keepSquare) {
            deltaX = event.e.offsetX - startPosition.x;
            deltaY = deltaX;
        } else {
            deltaX = event.e.offsetX - startPosition.x;
            deltaY = event.e.offsetY - startPosition.y;
        }
       
        rect.setWidth(deltaX);
        rect.setHeight(deltaY);
        
        MyApp.canvas.renderAll();
    });
    
    MyApp.canvas.on('mouse:up', function(event) {
        isDown = false;
        console.log(rect.getHeight());
        if(drawingMode) {
            if(event.e.offsetY - startPosition.y < 0) {
                rect.top = event.e.offsetY;
                rect.setHeight(rect.getHeight() * -1);
            }
            MyApp.canvas.add(rect);
            MyApp.canvas.setActiveObject(rect);
        } 
        console.log(MyApp.canvas);
    });
    
    MyApp.canvas.on('object:selected', function() {
        drawingMode = false;
    });
    MyApp.canvas.on('selection:cleared', function() {
        drawingMode = true;
    });
    
    MyApp.canvas.observe('object:modified', function(e) {
        e.target.resizeToScale();
    });
    
    fabric.Object.prototype.resizeToScale = function() {
        this.width *= this.scaleX;
        this.height *= this.scaleY;
        this.scaleX = 1;
        this.scaleY = 1;
    }
};
window.deleteShape = function() {
    console.log('deleting shape');
    var shape = MyApp.canvas.getActiveObject();
    MyApp.canvas.remove(shape);
    MyApp.canvas.remove(shape);
    
//    MyApp.canvas.clear();
    MyApp.canvas.renderAll();
}

function onKeyDownHandler(e) {
    switch (e.keyCode) {
        case 46:
            if(MyApp.canvas.getActiveObject()) {
                console.log('trying to delete');
                var shape = MyApp.canvas.getActiveObject();
                MyApp.canvas.remove(shape);
                MyApp.canvas.remove(shape);
                MyApp.canvas.renderAll();
                return;
            }
            break;
        case 16:
            MyApp.keepSquare = true;
            break;
    }
}
function onKeyUpHandler(e) {
    switch( e.keyCode) {
        case 16: 
            console.log('shift released');
            MyApp.keepSquare = false;
            break;
    }
}
window.onkeydown = onKeyDownHandler;
window.onkeyup = onKeyUpHandler;
window.onload = setUpFabric;