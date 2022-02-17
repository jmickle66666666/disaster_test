var tilemap = load("lib/tilemap.js");
var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");
var filebrowser = load("tools/filebrowser.js");

var state = "paint";
var currentTilemap;
var currentTile = 0;
var camera = {x: 0, y: 0};
var cameraSpeed = 200;
var showPointer = true;
var dragStart;
var dragSide;
var textures;
var hoverGadget = -1;
var currentGadget = -1;
var gadgetRClickMenuOpen = false;
var gadgetRClickPos = {x:0, y:0};
var gadgetDrag = -1;
var gadgetDragStart = {x:0, y:0};
var gadgetDragOffset = {x:0, y:0};
var clickTime = 0;
var scriptList = [];
var mapList = [];
var tool = "paint";
var tooltip = "";
var autosavePath = "autosave.tilemap";
var addTextProp = false;
var addNumberProp = false;
var newName = "prop";
var showHelp = false;

var undoStack = [];

function registerUndo()
{
    undoStack.push(currentTilemap.serialise());
}

function undo()
{
    currentTilemap = tilemap.deserialise(undoStack.pop());
}

var iconRects = {
    paint : { x:11, y:0, w:8, h:13 },
    fill : { x:0, y:0, w:11, h:9 },
    gadget : { x:0, y:9, w:11, h:11 },
    settings: { x:11, y:13, w:11, h:8 },
    save: {x:19, y:0, w:11, h:11},
    load: {x:22, y:11, w:10, h:8},
    drag_v: {x:12, y:21, w:7, h:12},
    drag_h: {x:0, y:20, w:12, h:7},
    drag: {x:19, y:21, w:15, h:15},
    mouse: {x:0, y:27, w:6, h:6},
    copy: {x:30, y:0, w:10, h:11},
    play: {x:32, y:11, w:9, h:10},
    help: {x:34, y:21, w:8, h:11}
};

function init()
{
    state = "edit";

    if (Assets.exists(autosavePath)) {
        currentTilemap = tilemap.load(autosavePath);
    } else {
        currentTilemap = tilemap.create();
        currentTilemap.properties.texture = "sprites\\cavetiles.png";
    }
    Engine.setMouseVisible(false);

    camera.x = -(Draw.screenWidth - (currentTilemap.properties.tileWidth * currentTilemap.properties.width))*0.5;
    camera.y = -(Draw.screenHeight - (currentTilemap.properties.tileHeight * currentTilemap.properties.height))*0.5;
}

function close()
{
    Engine.setMouseVisible(true);
}

function update(dt)
{
    Engine.setMouseVisible(false);
    tooltip = "";

    switch (state) {
        case "gadgetEditor":
            gadgetEditor(dt);
        break;

        case "properties":
            propertyEditor();
        break;   

        case "palette":
            paletteView();
        break;

        case "canvasResize":
            canvasResize();
        break;

        case "edit":
            paintMode(dt);
        break;
    }

    if (showHelp) helpScreen();

    toolbar();
    
    if (showPointer) Draw.texture("tools/sprites/tileicons.png", Input.mouseX, Input.mouseY, iconRects.mouse);
    if (tooltip != "") {
        var x = Input.mouseX + 8;
        var y = Input.mouseY - 8;
        Draw.rect(x, y, 4 + tooltip.length * Draw.fontWidth, 4 + Draw.fontHeight, Color.black, true);
        Draw.rect(x, y, 4 + tooltip.length * Draw.fontWidth, 4 + Draw.fontHeight, Color.disaster, false);
        Draw.text(tooltip, x + 2, y + 2, Color.white);
    }

    if (Input.getKeyDown(Key.z)) {
        if (Input.getKey(Key.leftcontrol)) {
            undo();
        }
    }
}

function cameraControls(dt)
{
    if (gui.keyboardFocus != -1) return;
    if (Input.getKey(Key.a)) { camera.x -= dt * cameraSpeed };
    if (Input.getKey(Key.d)) { camera.x += dt * cameraSpeed };
    if (Input.getKey(Key.w)) { camera.y -= dt * cameraSpeed };
    if (Input.getKey(Key.s)) { camera.y += dt * cameraSpeed };
}

function fill(x, y, newTile)
{

    var index = x + y * currentTilemap.properties.width;
    var oldTile = currentTilemap.tiles[index];
    if (oldTile == newTile) return;

    function doTile(x, y, newTile)
    {
        var index = x + y * currentTilemap.properties.width;
        if (currentTilemap.tiles[index] != oldTile) return;
        currentTilemap.tiles[index] = newTile;
        if (x > 0) doTile(x-1, y, newTile);
        if (x < currentTilemap.properties.width-1) doTile(x+1, y, newTile);
        if (y > 0) doTile(x, y-1, newTile);
        if (y < currentTilemap.properties.height-1) doTile(x, y+1, newTile);
    }

    doTile(x, y, newTile);
}

function toolbar()
{
    Draw.line(0, Draw.screenHeight - 17, Draw.screenWidth, Draw.screenHeight - 17, Color.disaster);
    Draw.rect(0, Draw.screenHeight - 16, Draw.screenWidth, 16, Color.brown, true);

    if (state == "properties") { Draw.rect(0, Draw.screenHeight - 16, 16, 16, Color.disaster, true); }
    if (state == "edit" && tool == "paint") { Draw.rect(16, Draw.screenHeight - 16, 16, 16, Color.disaster, true); }
    if (state == "edit" && tool == "fill") { Draw.rect(32, Draw.screenHeight - 16, 16, 16, Color.disaster, true); }
    if (state == "gadgetEditor") { Draw.rect(48, Draw.screenHeight - 16, 16, 16, Color.disaster, true); }
    if (showHelp) { Draw.rect(96, Draw.screenHeight - 16, 16, 16, Color.disaster, true); }

    Draw.texture(
        "tools/sprites/tileicons.png",
        8 - iconRects.settings.w/2, 
        Draw.screenHeight - 8 - iconRects.settings.h/2, 
        iconRects.settings
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        16 + 8 - iconRects.paint.w/2, 
        Draw.screenHeight - 8 - iconRects.paint.h/2, 
        iconRects.paint
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        32 + 8 - iconRects.fill.w/2, 
        Draw.screenHeight - 8 - iconRects.fill.h/2, 
        iconRects.fill
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        48 + 8 - iconRects.gadget.w/2, 
        Draw.screenHeight - 8 - iconRects.gadget.h/2, 
        iconRects.gadget
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        64 + 8 - iconRects.save.w/2, 
        Draw.screenHeight - 8 - iconRects.save.h/2, 
        iconRects.save
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        80 + 8 - iconRects.load.w/2, 
        Draw.screenHeight - 8 - iconRects.load.h/2, 
        iconRects.load
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        96 + 8 - iconRects.help.w/2, 
        Draw.screenHeight - 8 - iconRects.help.h/2, 
        iconRects.help
    );

    Draw.texture(
        "tools/sprites/tileicons.png",
        112 + 8 - iconRects.play.w/2, 
        Draw.screenHeight - 8 - iconRects.play.h/2, 
        iconRects.play
    );

    if (Input.mouseY >= Draw.screenHeight-16) {
        if (Input.mouseX < 16*8) {
            var index = Math.floor(Input.mouseX / 16);
            Draw.rect(index * 16, Draw.screenHeight - 16, 16, 16, Color.white, false);

            if (index == 0) { tooltip = "properties"; }
            if (index == 1) { tooltip = "paint"; }
            if (index == 2) { tooltip = "fill"; }
            if (index == 3) { tooltip = "gadgets"; }
            if (index == 4) { tooltip = "save"; }
            if (index == 5) { tooltip = "load"; }
            if (index == 6) { tooltip = "help"; }
            if (index == 7) { tooltip = "test"; }

            if (Input.mouseLeftDown) {

                if (index == 0) { state = "properties" }
                if (index == 1) { state = "edit"; tool = "paint"; }
                if (index == 2) { state = "edit"; tool = "fill"; }
                if (index == 3) { state = "gadgetEditor"; }
                if (index == 4) { filebrowser.save(
                    currentTilemap.properties.name+".tilemap",
                    "",
                    function(savepath) { 
                        log("saving to: "+savepath);
                        Assets.unload(savepath); 
                        Assets.unload(autosavePath);
                        currentTilemap.save(savepath); 
                        currentTilemap.save(autosavePath); 
                    }
                ); }
                if (index == 5) { 
                    filebrowser.browse(
                        ".tilemap",
                        "",
                        function(loadpath) {
                            currentTilemap = tilemap.load(loadpath);
                            state = "edit";
                            return;
                        }
                    );
                }
                if (index == 6) { 
                    showHelp =! showHelp;
                }
                if (index == 7) { 
                    Assets.unload(autosavePath);
                    currentTilemap.save(autosavePath);
                    Engine.setMouseVisible(true);
                    scenes.openScene(currentTilemap);
                }
            }
        }
    }
}

function drawCanvas()
{
    Draw.rect(0, 0, 320, 240, Color.darkbrown, true);

    
    camera.x = Math.floor(camera.x);
    camera.y = Math.floor(camera.y);

    var canvasSize = {w: currentTilemap.properties.width * currentTilemap.properties.tileWidth, h: currentTilemap.properties.height * currentTilemap.properties.tileHeight};

    Draw.rect(-camera.x, -camera.y, canvasSize.w, canvasSize.h, Color.black, true);
    Draw.rect(-camera.x-1, -camera.y-1, 2 + canvasSize.w, 2 + canvasSize.h, Color.skyblue, false);
    Draw.line(-camera.x, 2-camera.y-1 + canvasSize.h, -1-camera.x + canvasSize.w, 2-camera.y-1 + canvasSize.h, Color.black);
    currentTilemap.render(-camera.x, -camera.y);
}

function resizeCanvas(direction, amount)
{
    var newTiles = [];
    var oldTiles = currentTilemap.tiles;

    var oldWidth = currentTilemap.properties.width;
    var oldHeight = currentTilemap.properties.height;
    var newWidth = oldWidth;
    var newHeight = oldHeight;
    if (direction == "left" || direction == "right") { newWidth += amount; }
    if (direction == "top" || direction == "bottom") { newHeight += amount; }


    for (var i = 0; i < newWidth * newHeight; i++)
    {
        var newX = i % newWidth;
        var newY = Math.floor(i / newWidth);
        var oldX = newX;
        var oldY = newY;

        if (direction == "left") oldX -= amount;
        if (direction == "top") oldY -= amount;
        
        if (oldX >= 0 && oldX < oldWidth && oldY >= 0 && oldY < oldHeight)
        {
            var oldIndex = (oldY * oldWidth) + oldX;
            newTiles[i] = oldTiles[oldIndex];
        } else {
            newTiles[i] = null;
        }
    }

    currentTilemap.properties.width = newWidth;
    currentTilemap.properties.height = newHeight;
    currentTilemap.tiles = newTiles;
    currentTilemap.dirty = true;

    if (direction == "left") camera.x += currentTilemap.properties.tileWidth * amount;
    if (direction == "top") camera.y += currentTilemap.properties.tileHeight * amount;
}

function gadgetEditor(dt)
{
    cameraControls(dt);
        
    drawCanvas();
    showPointer = true;

    hoverGadget = -1;
    for (var i = 0; i < currentTilemap.gadgets.length; i++)
    {
        var ent = currentTilemap.gadgets[i];
        var entSize = {w: 16, h: 16};
        if (ent.preview != "") {
            entSize = Assets.getTextureSize(ent.preview);
        }

        // check hovers
        if (Math.abs(Input.mouseX - (ent.x - camera.x)) < entSize.w/2 && Math.abs(Input.mouseY - (ent.y - camera.y)) < entSize.h/2) {
            if (hoverGadget == -1) {
                hoverGadget = i;
            } else {
                // do a distance check
                var d1 = Math.abs(Input.mouseX - (ent.x - camera.x)) + Math.abs(Input.mouseY - (ent.y - camera.y));
                var d2 = Math.abs(Input.mouseX - (currentTilemap.gadgets[hoverGadget].x - camera.x)) + Math.abs(Input.mouseY - (currentTilemap.gadgets[hoverGadget].y - camera.y));
                if (d1 < d2) hoverGadget = i;
            }
        }

        // draw them
        if (ent.preview != "") {
            Draw.texture(ent.preview, -camera.x + ent.x - entSize.w/2, -camera.y + ent.y - entSize.h/2);
        } else {
            Draw.texture("tools/sprites/tileicons.png", -camera.x + ent.x - iconRects.gadget.w/2, -camera.y + ent.y - iconRects.gadget.h/2, iconRects.gadget);
        }
    }

    if (gadgetDrag != -1) {

        var ent = currentTilemap.gadgets[gadgetDrag];

        if (Input.mouseRightDown) {
            ent.x = gadgetDragStart.x;
            ent.y = gadgetDragStart.y;
            gadgetDrag = -1;
        }

        ent.x = Input.mouseX + camera.x - gadgetDragOffset.x;
        ent.y = Input.mouseY + camera.y - gadgetDragOffset.y;
        
        if (Input.getKey(Key.leftcontrol)) {
            if (ent.preview != "") {
                var size = Assets.getTextureSize(ent.preview);
                Draw.texture(ent.preview, -camera.x + gadgetDragStart.x - size.w/2, -camera.y + gadgetDragStart.y - size.h/2);
            } else {
                Draw.texture("tools/sprites/tileicons.png", -camera.x + gadgetDragStart.x - iconRects.gadget.w/2, -camera.y + gadgetDragStart.y - iconRects.gadget.h/2, iconRects.gadget);
            }
        }

        if (Input.mouseLeftUp) {
            registerUndo();
            if (Input.getKey(Key.leftcontrol)) {
                currentTilemap.gadgets.push({
                    script:ent.script,
                    preview:ent.preview,
                    name: ent.name,
                    x: gadgetDragStart.x,
                    y: gadgetDragStart.y,
                    properties : JSON.parse(JSON.stringify(ent.properties))
                });
            }

            gadgetDrag = -1;
        }

    } else {

        if (hoverGadget != -1) {

            if (Input.mouseLeftDown) {
                registerUndo();
                gadgetDrag = hoverGadget;
                gadgetDragStart.x = currentTilemap.gadgets[hoverGadget].x;
                gadgetDragStart.y = currentTilemap.gadgets[hoverGadget].y;
                gadgetDragOffset.x = (Input.mouseX + camera.x) - gadgetDragStart.x;
                gadgetDragOffset.y = (Input.mouseY + camera.y) - gadgetDragStart.y;

                currentGadget = hoverGadget;
            }

            if (Input.getKey(Key.leftcontrol)) {
                Draw.texture("tools/sprites/tileicons.png", Input.mouseX + 4, Input.mouseY + 4, iconRects.copy);
            }
        }

    }

    if (gadgetRClickMenuOpen) {
        gui.x = gadgetRClickPos.x;
        gui.y = gadgetRClickPos.y;

        if (currentGadget == -1) {
            gui.button("new gadget", function() { 
                registerUndo();
                currentTilemap.gadgets.push({
                    script:"",
                    preview:"",
                    name: "gadget",
                    x: Input.mouseX + camera.x,
                    y: Input.mouseY + camera.y,
                    properties : {}
                });
                gadgetRClickMenuOpen = false;
            });
        } else {
            gui.button("delete", function() {
                registerUndo();
                currentTilemap.gadgets.splice(currentGadget, 1);
                currentGadget = -1;
                gadgetRClickMenuOpen = false;
            });
            if (currentGadget == -1) return;
        }

    }

    if (Input.mouseRightDown) {
        gadgetRClickMenuOpen = true;
        gadgetRClickPos.x = Input.mouseX;
        gadgetRClickPos.y = Input.mouseY;
    }

    if (currentGadget != -1)
    {
        var ent = currentTilemap.gadgets[currentGadget];
        var entSize = {w: 16, h: 16};
        if (ent.preview != "") {
            entSize = Assets.getTextureSize(ent.preview);
        }
        gui.y = 8;
        gui.x = 8;
        ent.name = gui.textField("name", ent.name);
        if (gui.button("script: "+ent.script, function() {
            filebrowser.browse(".js", "", 
                function(path) {ent.script = path}
            );
        }));
        if (gui.button("preview:"+ent.preview, function() {
            filebrowser.browse(".png", "", 
                function(path) {ent.preview = path}
            );
        }));
        ent.properties = gui.objectEditor("properties", ent.properties);
        
        if (addTextProp) {
            newName = gui.textField("name:", newName);
            gui.button("done", function() { ent.properties[newName] = "text"; addTextProp = false; });
            gui.button("cancel", function() { newName = "prop"; addTextProp = false; })
        } else {
            gui.button("add text property", function() { addTextProp = true; newName = "prop"; });
        }

        if (addNumberProp) {
            newName = gui.textField("name:", newName);
            gui.button("done", function() { ent.properties[newName] = 0; addNumberProp = false; });
            gui.button("cancel", function() { newName = "prop"; addNumberProp = false; })
        } else {
            gui.button("add number property", function() { addNumberProp = true; newName = "prop"; });
        }

        if (ent.preview != "") {
            var size = Assets.getTextureSize(ent.preview);
            Draw.texture(ent.preview, 320 - size.w, 0);
        }

        Draw.rect(
            -entSize.w/2 + currentTilemap.gadgets[currentGadget].x - camera.x,
            -entSize.h/2 + currentTilemap.gadgets[currentGadget].y - camera.y,
            entSize.w, entSize.h,
            Color.disaster,
            false
        );
    }

    if (Input.mouseLeftDown) {
        gadgetRClickMenuOpen = false;
        if (hoverGadget == -1 && !gui.hovered) {
            currentGadget = -1;
        }
    }

    if (Input.mouseLeft) {
        clickTime += dt;
    }

    if (Input.mouseLeftUp) {
        clickTime = 0;
    }

    if (hoverGadget != -1)
    {   
        var ent = currentTilemap.gadgets[hoverGadget];
        var entSize = {w: 16, h: 16};
        if (ent.preview != "") {
            entSize = Assets.getTextureSize(ent.preview);
        }
        Draw.rect(
            -entSize.w/2 + currentTilemap.gadgets[hoverGadget].x - camera.x,
            -entSize.h/2 + currentTilemap.gadgets[hoverGadget].y - camera.y,
            entSize.w, entSize.h,
            Color.white,
            false
        );
    }
}

var lineLength = 50;
var toothThick = 10;
var teeth = 5;
var cograd = 42;
var brighterBrown = {r: Color.brown.r + 10, g: Color.brown.g + 10, b: Color.brown.b + 10}
function propertyEditor()
{
    Draw.rect(0, 0, 320, 240, Color.darkbrown, true);
    
    gui.x = 5;
    gui.y = 5;
    currentTilemap.properties.name = gui.textField("name:", currentTilemap.properties.name);
    gui.y += 5;
    gui.button("texture: " + currentTilemap.properties.texture, function() { 
        filebrowser.browse(".png", "", 
            function (path) { currentTilemap.properties.texture = path; }
        );
    });
    gui.y += 5;
    currentTilemap.properties.tileWidth = gui.numberField("tile width", currentTilemap.properties.tileWidth);
    currentTilemap.properties.tileHeight = gui.numberField("tile height", currentTilemap.properties.tileHeight);

    
    var textureSize = Assets.getTextureSize(currentTilemap.properties.texture);
    var tilemapx = (Draw.screenWidth - textureSize.w) / 2;
    var tilemapy = (Draw.screenHeight - textureSize.h) / 2;
    Draw.texture(currentTilemap.properties.texture, tilemapx, tilemapy);
    if (currentTilemap.properties.tileWidth > 1 && currentTilemap.properties.tileHeight > 1) {
        for (var i = 0; i <= textureSize.w; i+= currentTilemap.properties.tileWidth) {
            Draw.line(tilemapx + i, tilemapy, tilemapx + i, tilemapy + textureSize.h, Color.gray);
        }
        
        for (var i = 0; i <= textureSize.h; i+= currentTilemap.properties.tileHeight) {
            Draw.line(tilemapx, tilemapy + i, tilemapx + textureSize.w, tilemapy + i, Color.gray);
        }
    }

    var t = Engine.getTime();
    var centerX = 10;
    var centerY = 210;
    
    
    
    for (var i = 0; i < 3.139; i += 3.14/teeth) {
        var angle = t * 1;
        var endX = centerX + Math.cos(angle + i) * lineLength;
        var endY = centerY + Math.sin(angle + i) * lineLength;
        var ex1 = endX + Math.cos(angle + i + 1.57) * toothThick;
        var ey1 = endY + Math.sin(angle + i + 1.57) * toothThick;
        var ex2 = endX + Math.cos(angle + i - 1.57) * toothThick;
        var ey2 = endY + Math.sin(angle + i - 1.57) * toothThick;

        var startX = centerX + Math.cos(angle + i + 3.14) * lineLength;
        var startY = centerY + Math.sin(angle + i + 3.14) * lineLength;
        var sx1 = startX + Math.cos(angle + i + 1.57) * toothThick;
        var sy1 = startY + Math.sin(angle + i + 1.57) * toothThick;
        var sx2 = startX + Math.cos(angle + i - 1.57) * toothThick;
        var sy2 = startY + Math.sin(angle + i - 1.57) * toothThick;
        
        Draw.triangle(sx1, sy1, sx2, sy2, ex1, ey1, Color.brown, true);
        Draw.triangle(sx2, sy2, ex2, ey2, ex1, ey1, Color.brown, true);
    }
    cograd = lerp(42, cograd, 0.95);
    Draw.circle(centerX, centerY, cograd, Color.brown, true);
    lineLength = lerp(50, lineLength, 0.95);
    toothThick = lerp(10, toothThick, 0.95);
    teeth = lerp(5, teeth, 0.95);
    if (Input.mouseX < 20 && Input.mouseY > 205 && Input.mouseY < 215) {
        Draw.circle(centerX, centerY, cograd, brighterBrown, true);
        if (Input.mouseLeftDown) {
        var r = Math.floor(Math.random() * 4);
        switch (r) {
            case 0:
                lineLength = 80;
                cograd = 72;
                teeth = 15;
                toothThick = 1;
                break;
            case 1:
                lineLength = 20;
                cograd = 18;
                toothThick = 1;
                teeth = 0;
                break;
            case 2:
                lineLength = 45;
                cograd = 38;
                teeth = 0;
                break;
            case 3:
                lineLength = 45;
                cograd = 38;
                teeth = 10;
                toothThick = 1;
                break;
        }
        
    }
    }
}

function lerp(a, b, t) { return a * (1 - t) + b * t; }

function paletteView()
{
    var numTilesX = Math.floor(Assets.getTextureSize(currentTilemap.properties.texture).w / currentTilemap.properties.tileWidth);
    var numTilesY = Math.floor(Assets.getTextureSize(currentTilemap.properties.texture).h / currentTilemap.properties.tileHeight);

    var tileX = Math.floor(Input.mouseX / currentTilemap.properties.tileWidth);
    var tileY = Math.floor(Input.mouseY / currentTilemap.properties.tileHeight);
    var mouseX = tileX * currentTilemap.properties.tileWidth;
    var mouseY = tileY * currentTilemap.properties.tileHeight;

    drawCanvas();
    Draw.texture(currentTilemap.properties.texture, 0, 0);
    Draw.rect(mouseX, mouseY, currentTilemap.properties.tileWidth, currentTilemap.properties.tileHeight, Color.white, false);

    if (Input.mouseLeftDown) {
        if (tileX < numTilesX && tileY < numTilesY) {
            currentTile = tileX + (tileY * numTilesX);
            return;
        }
    }

    Draw.rect(
        (currentTile % numTilesX) * currentTilemap.properties.tileWidth, 
        Math.floor(currentTile / numTilesX) * currentTilemap.properties.tileHeight, 
        currentTilemap.properties.tileWidth, 
        currentTilemap.properties.tileHeight, 
        Color.disaster, 
        false
    );

    if (Input.getKeyUp(Key.tab)) {
        state = "edit";
    }
}

function canvasResize()
{
    showPointer = false;
    drawCanvas();

    var baseRect = {
        x: 0, y: 0, w: currentTilemap.properties.width, h:currentTilemap.properties.height
    };

    //cameraControls();

    tileX = Math.floor((Input.mouseX+camera.x) / currentTilemap.properties.tileWidth);
    tileY = Math.floor((Input.mouseY+camera.y) / currentTilemap.properties.tileHeight);

    var amount = 0;

    if (dragSide == "left") { baseRect.x = tileX + 1; baseRect.w += dragStart - tileX; amount = dragStart - tileX; }
    if (dragSide == "right") { baseRect.w = tileX; amount = tileX - dragStart; }
    if (dragSide == "top") { baseRect.y = tileY + 1; baseRect.h += dragStart - tileY; amount = dragStart - tileY; }
    if (dragSide == "bottom") { baseRect.h = tileY; amount = tileY - dragStart; }

    Draw.rect(
        -camera.x + baseRect.x * currentTilemap.properties.tileWidth, 
        -camera.y + baseRect.y * currentTilemap.properties.tileHeight,
        baseRect.w * currentTilemap.properties.tileWidth,
        baseRect.h * currentTilemap.properties.tileHeight,
        Color.meat,
        false
    );

    if (dragSide == "left" || dragSide == "right") {
        Draw.texture("tools/sprites/tileicons.png", Input.mouseX - 5, Input.mouseY - 3, iconRects.drag_h);
    } else {
        Draw.texture("tools/sprites/tileicons.png", Input.mouseX - 3, Input.mouseY - 5, iconRects.drag_v);
    }

    if (Input.mouseLeftUp) {
        resizeCanvas(dragSide, amount);
        state = "edit";
    }
}

function paintMode(dt)
{
    drawCanvas();

    var tileX = Math.floor((Input.mouseX+camera.x) / currentTilemap.properties.tileWidth);
    var tileY = Math.floor((Input.mouseY+camera.y) / currentTilemap.properties.tileHeight);
    var mouseX = tileX * currentTilemap.properties.tileWidth;
    var mouseY = tileY * currentTilemap.properties.tileHeight;
    Draw.rect(mouseX - camera.x, mouseY - camera.y, currentTilemap.properties.tileWidth, currentTilemap.properties.tileHeight, Color.white, false);

    cameraControls(dt);

    showPointer = true;
    if (tileX == -1 || tileX == currentTilemap.properties.width) {
        showPointer = false;
        Draw.texture("tools/sprites/tileicons.png", Input.mouseX - 5, Input.mouseY - 3, iconRects.drag_h);

        if (Input.mouseLeftDown) {
            registerUndo();
            if (tileX == -1) {
                dragSide = "left";
                dragStart = tileX;
                state = "canvasResize";
            } else {
                dragSide = "right";
                dragStart = tileX;
                state = "canvasResize";
            }
        }

    } else if (tileY == -1 || tileY == currentTilemap.properties.height) {
        showPointer = false;
        Draw.texture("tools/sprites/tileicons.png", Input.mouseX - 3, Input.mouseY - 5, iconRects.drag_v);

        if (Input.mouseLeftDown) {
            registerUndo();
            if (tileY == -1) {
                dragSide = "top";
                dragStart = tileY;
                state = "canvasResize";
            } else {
                dragSide = "bottom";
                dragStart = tileY;
                state = "canvasResize";
            }
        }

    } else {

        if (Input.mouseRightDown) {
            if (tileX >= 0 && tileY >= 0 && tileX < currentTilemap.properties.width && tileY < currentTilemap.properties.height) {
                var index = tileX + tileY * currentTilemap.properties.width;
                currentTile = currentTilemap.tiles[index];
            }
        }

        if (tool == "paint" && Input.mouseLeftDown) {
            registerUndo();
        }

        if (tool == "paint" && Input.mouseLeft) {
            if (tileX >= 0 && tileY >= 0 && tileX < currentTilemap.properties.width && tileY < currentTilemap.properties.height) {
                var index = tileX + tileY * currentTilemap.properties.width;
                if (currentTilemap.tiles[index] != currentTile) {
                    currentTilemap.tiles[index] = currentTile;
                    currentTilemap.dirty = true;
                }
            }
        }

        if (tool == "fill" && Input.mouseLeftDown) {
            registerUndo();
            if (tileX >= 0 && tileY >= 0 && tileX < currentTilemap.properties.width && tileY < currentTilemap.properties.height) {
                fill(tileX, tileY, currentTile);
                currentTilemap.dirty = true;
            }
        }
    }

    if (Input.getKeyDown(Key.tab)) {
        state = "palette";
    }
}

function helpScreen()
{
    drawCanvas();

    Draw.rect(17, 17, 186, 88, Color.black, true);
    Draw.rect(18, 18, 184, 86, Color.brown, true);

    Draw.textStyled("$s$w$rDISASTER ENGINE TILEMAP EDITOR", 20, 20);
    
    Draw.textStyled("WASD: pan the canvas", 20, 24 + Draw.fontHeight * 2);

    Draw.textStyled("paint mode: ", 20, 24 + Draw.fontHeight * 4);
    Draw.textStyled("TAB: open the palette", 20, 24 + Draw.fontHeight * 5);

    Draw.textStyled("gadget mode: ", 20, 24 + Draw.fontHeight * 7);
    Draw.textStyled("r-click: context menu", 20, 24 + Draw.fontHeight * 8);
    Draw.textStyled("l-click: select and move", 20, 24 + Draw.fontHeight * 9);
}