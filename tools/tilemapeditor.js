var tilemap = load("lib/tilemap.js");
var gui = load("lib/gui.js");
var colors = load("lib/colors.js");
var key = load("lib/keycodes.js");
var scenes = load("lib/scenes.js");

var state = "edit";
var currentTilemap;
var currentTile = 0;
var camera = {x: 0, y: 0};
var cameraSpeed = 200;
var showPointer = true;
var dragStart;
var dragSide;
var textures;
var hoverEntity = -1;
var currentEntity = -1;
var entityRClickMenuOpen = false;
var entityRClickPos = {x:0, y:0};
var entityDrag = -1;
var entityDragStart = {x:0, y:0};
var entityDragOffset = {x:0, y:0};
var clickTime = 0;
var scriptList = [];
var mapList = [];
var tool = "paint";
var tooltip = "";
var autosavePath = "autosave.json";
var addTextProp = false;
var addNumberProp = false;
var newName = "prop";

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
    entity : { x:0, y:9, w:11, h:11 },
    settings: { x:11, y:13, w:11, h:8 },
    save: {x:19, y:0, w:11, h:11},
    load: {x:22, y:11, w:10, h:8},
    drag_v: {x:12, y:21, w:7, h:12},
    drag_h: {x:0, y:20, w:12, h:7},
    drag: {x:19, y:21, w:15, h:15},
    mouse: {x:0, y:27, w:6, h:6},
    copy: {x:30, y:0, w:10, h:11},
    play: {x:32, y:11, w:9, h:10},
};

function init()
{
    state = "entityEditor";
    var paths = Assets.list().split(',');
    textures = [];
    scriptList = [];
    mapList = [];
    for (var i = 0; i < paths.length; i++)
    {
        if (paths[i].endsWith(".png")) {
            textures.push(paths[i]);
        }

        if (paths[i].endsWith(".js")) {
            scriptList.push(paths[i]);
        }

        if (paths[i].endsWith(".json")) {
            mapList.push(paths[i]);
        }
    }

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

function updateMaplist()
{
    var paths = Assets.list().split(',');
    mapList = [];
    for (var i = 0; i < paths.length; i++)
    {
        if (paths[i].endsWith(".json")) {
            mapList.push(paths[i]);
        }
    }
}

function update(dt)
{
    tooltip = "";
    var numTilesX = Math.floor(Assets.getTextureSize(currentTilemap.properties.texture).w / currentTilemap.properties.tileWidth);
    var numTilesY = Math.floor(Assets.getTextureSize(currentTilemap.properties.texture).h / currentTilemap.properties.tileHeight);

    var tileX = Math.floor(Input.mouseX / currentTilemap.properties.tileWidth);
    var tileY = Math.floor(Input.mouseY / currentTilemap.properties.tileHeight);
    var mouseX = tileX * currentTilemap.properties.tileWidth;
    var mouseY = tileY * currentTilemap.properties.tileHeight;

    switch (state) {
        case "entityEditor":
            cameraControls(dt);
        
            drawCanvas();
            showPointer = true;
        
            hoverEntity = -1;
            for (var i = 0; i < currentTilemap.entities.length; i++)
            {
                var ent = currentTilemap.entities[i];
                var entSize = {w: 16, h: 16};
                if (ent.preview != "") {
                    entSize = Assets.getTextureSize(ent.preview);
                }

                // check hovers
                if (Math.abs(Input.mouseX - (ent.x - camera.x)) < entSize.w/2 && Math.abs(Input.mouseY - (ent.y - camera.y)) < entSize.h/2) {
                    if (hoverEntity == -1) {
                        hoverEntity = i;
                    } else {
                        // do a distance check
                        var d1 = Math.abs(Input.mouseX - (ent.x - camera.x)) + Math.abs(Input.mouseY - (ent.y - camera.y));
                        var d2 = Math.abs(Input.mouseX - (currentTilemap.entities[hoverEntity].x - camera.x)) + Math.abs(Input.mouseY - (currentTilemap.entities[hoverEntity].y - camera.y));
                        if (d1 < d2) hoverEntity = i;
                    }
                }
        
                // draw them
                if (ent.preview != "") {
                    Draw.texture(-camera.x + ent.x - entSize.w/2, -camera.y + ent.y - entSize.h/2, ent.preview);
                } else {
                    Draw.texturePart(-camera.x + ent.x - iconRects.entity.w/2, -camera.y + ent.y - iconRects.entity.h/2, iconRects.entity, "tools/sprites/tileicons.png");
                }
            }
        
            if (entityDrag != -1) {
        
                var ent = currentTilemap.entities[entityDrag];
        
                if (Input.mouseRightDown) {
                    ent.x = entityDragStart.x;
                    ent.y = entityDragStart.y;
                    entityDrag = -1;
                }
        
                ent.x = Input.mouseX + camera.x - entityDragOffset.x;
                ent.y = Input.mouseY + camera.y - entityDragOffset.y;
                
                if (Input.getKey(key.leftcontrol)) {
                    if (ent.preview != "") {
                        var size = Assets.getTextureSize(ent.preview);
                        Draw.texture(-camera.x + entityDragStart.x - size.w/2, -camera.y + entityDragStart.y - size.h/2, ent.preview);
                    } else {
                        Draw.texturePart(-camera.x + entityDragStart.x - iconRects.entity.w/2, -camera.y + entityDragStart.y - iconRects.entity.h/2, iconRects.entity, "tools/sprites/tileicons.png");
                    }
                }
        
                if (Input.mouseLeftUp) {
                    registerUndo();
                    if (Input.getKey(key.leftcontrol)) {
                        currentTilemap.entities.push({
                            script:ent.script,
                            preview:ent.preview,
                            name: ent.name,
                            x: entityDragStart.x,
                            y: entityDragStart.y,
                            properties : JSON.parse(JSON.stringify(ent.properties))
                        });
                    }
        
                    entityDrag = -1;
                }
        
            } else {
        
                if (hoverEntity != -1) {
        
                    if (Input.mouseLeftDown) {
                        registerUndo();
                        entityDrag = hoverEntity;
                        entityDragStart.x = currentTilemap.entities[hoverEntity].x;
                        entityDragStart.y = currentTilemap.entities[hoverEntity].y;
                        entityDragOffset.x = (Input.mouseX + camera.x) - entityDragStart.x;
                        entityDragOffset.y = (Input.mouseY + camera.y) - entityDragStart.y;
        
                        currentEntity = hoverEntity;
                    }
        
                    if (Input.getKey(key.leftcontrol)) {
                        Draw.texturePart(Input.mouseX + 4, Input.mouseY + 4, iconRects.copy, "tools/sprites/tileicons.png");
                    }
                }
        
            }
        
            if (entityRClickMenuOpen) {
                gui.x = entityRClickPos.x;
                gui.y = entityRClickPos.y;
        
                if (currentEntity == -1) {
                    gui.button("new entity", function() { 
                        registerUndo();
                        currentTilemap.entities.push({
                            script:"",
                            preview:"",
                            name: "entity",
                            x: Input.mouseX + camera.x,
                            y: Input.mouseY + camera.y,
                            properties : {}
                        });
                        entityRClickMenuOpen = false;
                    });
                } else {
                    gui.button("delete", function() {
                        registerUndo();
                        currentTilemap.entities.splice(currentEntity, 1);
                        currentEntity = -1;
                        entityRClickMenuOpen = false;
                    });
                    if (currentEntity == -1) return;
                }
        
            }
        
            if (Input.mouseRightDown) {
                entityRClickMenuOpen = true;
                entityRClickPos.x = Input.mouseX;
                entityRClickPos.y = Input.mouseY;
            }
        
            if (currentEntity != -1)
            {
                var ent = currentTilemap.entities[currentEntity];
                var entSize = {w: 16, h: 16};
                if (ent.preview != "") {
                    entSize = Assets.getTextureSize(ent.preview);
                }
                gui.y = 8;
                gui.x = 8;
                ent.name = gui.textField("name", ent.name);
                gui.comboBox("script", ent.script, scriptList, function(newScript) { ent.script = newScript; });
                gui.comboBox("preview", ent.preview, textures, function(newTexture) { ent.preview = newTexture; });
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
                    Draw.texture(320 - size.w, 0, ent.preview);
                }
        
                Draw.rect(
                    -entSize.w/2 + currentTilemap.entities[currentEntity].x - camera.x,
                    -entSize.h/2 + currentTilemap.entities[currentEntity].y - camera.y,
                    entSize.w, entSize.h,
                    colors.disaster,
                    false
                );
            }
        
            if (Input.mouseLeftDown) {
                entityRClickMenuOpen = false;
                if (hoverEntity == -1 && !gui.hovered) {
                    currentEntity = -1;
                }
            }
        
            if (Input.mouseLeft) {
                clickTime += dt;
            }
        
            if (Input.mouseLeftUp) {
                clickTime = 0;
            }
        
            if (hoverEntity != -1)
            {   
                var ent = currentTilemap.entities[hoverEntity];
                var entSize = {w: 16, h: 16};
                if (ent.preview != "") {
                    entSize = Assets.getTextureSize(ent.preview);
                }
                Draw.rect(
                    -entSize.w/2 + currentTilemap.entities[hoverEntity].x - camera.x,
                    -entSize.h/2 + currentTilemap.entities[hoverEntity].y - camera.y,
                    entSize.w, entSize.h,
                    colors.white,
                    false
                );
            }
        break;
    
        case "picktexture":
            gui.label("pick a texture");
            for (var i = 0; i < textures.length; i++)
            {
                if (currentTilemap.properties.texture == textures[i]) {
                    gui.button("-"+textures[i]+"-", function() { state = "properties"; });
                } else {
                    gui.button(" "+textures[i], function() { state = "properties"; currentTilemap.properties.texture = textures[i]; });
                }
        
                if (gui.lastHovered) {
                    var previewSize = Assets.getTextureSize(textures[i]);
                    Draw.texture(319 - previewSize.w, 0, textures[i]);
                }
            }
            break;

        case "properties":
            gui.label("properties:");
            currentTilemap.properties.name = gui.textField("name:", currentTilemap.properties.name);
            gui.button("texture: " + currentTilemap.properties.texture, function() { state = "picktexture"; });
            currentTilemap.properties.tileWidth = gui.numberField("tile width", currentTilemap.properties.tileWidth);
            currentTilemap.properties.tileHeight = gui.numberField("tile height", currentTilemap.properties.tileHeight);
        
            Draw.texture(0, gui.y, currentTilemap.properties.texture);
            if (currentTilemap.properties.tileWidth > 1 && currentTilemap.properties.tileHeight > 1) {
                var textureSize = Assets.getTextureSize(currentTilemap.properties.texture);
                for (var i = 0; i <= textureSize.w; i+= currentTilemap.properties.tileWidth) {
                    Draw.line(i, gui.y, i, gui.y + textureSize.h, colors.gray);
                }
                
                for (var i = 0; i <= textureSize.h; i+= currentTilemap.properties.tileHeight) {
                    Draw.line(0, gui.y + i, textureSize.w, gui.y + i, colors.gray);
                }
            }
        break;   

        case "palette":
            drawCanvas();
            Draw.texture(0, 0, currentTilemap.properties.texture);
            Draw.rect(mouseX, mouseY, currentTilemap.properties.tileWidth, currentTilemap.properties.tileHeight, colors.white, false);

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
                colors.disaster, 
                false
            );

            if (Input.getKeyUp(key.tab)) {
                state = "edit";
            }
        break;

        case "canvasResize":
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
                colors.meat,
                false
            );

            if (dragSide == "left" || dragSide == "right") {
                Draw.texturePart(Input.mouseX - 5, Input.mouseY - 3, iconRects.drag_h, "tools/sprites/tileicons.png");
            } else {
                Draw.texturePart(Input.mouseX - 3, Input.mouseY - 5, iconRects.drag_v, "tools/sprites/tileicons.png");
            }

            if (Input.mouseLeftUp) {
                resizeCanvas(dragSide, amount);
                state = "edit";
            }
        break;

        case "loadMap":
            drawCanvas();
        
            gui.x = 10;
            gui.y = 10;
            for (var i = 0; i < mapList.length; i++)
            {
                gui.button(mapList[i], function() { 
                    currentTilemap = tilemap.load(mapList[i]);
                    state = "edit";
                    return;
                });
            }
            showPointer = true;
        break;

        case "edit":
            drawCanvas();

            tileX = Math.floor((Input.mouseX+camera.x) / currentTilemap.properties.tileWidth);
            tileY = Math.floor((Input.mouseY+camera.y) / currentTilemap.properties.tileHeight);
            mouseX = tileX * currentTilemap.properties.tileWidth;
            mouseY = tileY * currentTilemap.properties.tileHeight;
            Draw.rect(mouseX - camera.x, mouseY - camera.y, currentTilemap.properties.tileWidth, currentTilemap.properties.tileHeight, colors.white, false);

            cameraControls(dt);

            showPointer = true;
            if (tileX == -1 || tileX == currentTilemap.properties.width) {
                showPointer = false;
                Draw.texturePart(Input.mouseX - 5, Input.mouseY - 3, iconRects.drag_h, "tools/sprites/tileicons.png");

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
                Draw.texturePart(Input.mouseX - 3, Input.mouseY - 5, iconRects.drag_v, "tools/sprites/tileicons.png");

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

            // if (Input.getKeyDown(key.key1)) tool = "paint";
            // if (Input.getKeyDown(key.key2)) tool = "fill";
            // if (Input.getKeyDown(key.key3)) tool = "entity";

            //Draw.texturePart(5, 240 - 32, iconRects[tool], "tools/sprites/tileicons.png");


            if (Input.getKeyDown(key.tab)) {
                state = "palette";
            }
        break;

        case "saveConfirm":
            drawCanvas();
            gui.x = 80;
            gui.y = 60;
            var path = "maps/"+currentTilemap.properties.name+".json";
            gui.label("save as "+path+"?");
            gui.button("yes", function() { Assets.unload(path); Assets.unload(autosavePath); currentTilemap.save(path); currentTilemap.save(autosavePath); state="entityEditor"; });
            gui.button("no", function() { state="entityEditor"; return; });
            showPointer = true;
        break;
    }

    toolbar();
    
    if (showPointer) Draw.texturePart(Input.mouseX, Input.mouseY, iconRects.mouse, "tools/sprites/tileicons.png");
    if (tooltip != "") {
        var x = Input.mouseX + 8;
        var y = Input.mouseY - 8;
        Draw.rect(x, y, 4 + tooltip.length * Draw.fontWidth, 4 + Draw.fontHeight, colors.black, true);
        Draw.rect(x, y, 4 + tooltip.length * Draw.fontWidth, 4 + Draw.fontHeight, colors.disaster, false);
        Draw.text(x + 2, y + 2, tooltip, colors.white);
    }

    if (Input.getKeyDown(key.z)) {
        if (Input.getKey(key.leftcontrol)) {
            undo();
        }
    }

    
}

function cameraControls(dt)
{
    if (gui.keyboardFocus != -1) return;
    if (Input.getKey(key.a)) { camera.x -= dt * cameraSpeed };
    if (Input.getKey(key.d)) { camera.x += dt * cameraSpeed };
    if (Input.getKey(key.w)) { camera.y -= dt * cameraSpeed };
    if (Input.getKey(key.s)) { camera.y += dt * cameraSpeed };
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
    Draw.line(0, Draw.screenHeight - 17, Draw.screenWidth, Draw.screenHeight - 17, colors.disaster);
    Draw.rect(0, Draw.screenHeight - 16, Draw.screenWidth, 16, colors.brown, true);

    if (state == "properties") { Draw.rect(0, Draw.screenHeight - 16, 16, 16, colors.disaster, true); }
    if (state == "edit" && tool == "paint") { Draw.rect(16, Draw.screenHeight - 16, 16, 16, colors.disaster, true); }
    if (state == "edit" && tool == "fill") { Draw.rect(32, Draw.screenHeight - 16, 16, 16, colors.disaster, true); }
    //if (state == "edit" && tool == "entity") { Draw.rect(48, Draw.screenHeight - 16, 16, 16, colors.disaster, true); }
    if (state == "entityEditor") { Draw.rect(48, Draw.screenHeight - 16, 16, 16, colors.disaster, true); }

    Draw.texturePart(
        8 - iconRects.settings.w/2, 
        Draw.screenHeight - 8 - iconRects.settings.h/2, 
        iconRects.settings,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        16 + 8 - iconRects.paint.w/2, 
        Draw.screenHeight - 8 - iconRects.paint.h/2, 
        iconRects.paint,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        32 + 8 - iconRects.fill.w/2, 
        Draw.screenHeight - 8 - iconRects.fill.h/2, 
        iconRects.fill,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        48 + 8 - iconRects.entity.w/2, 
        Draw.screenHeight - 8 - iconRects.entity.h/2, 
        iconRects.entity,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        64 + 8 - iconRects.save.w/2, 
        Draw.screenHeight - 8 - iconRects.save.h/2, 
        iconRects.save,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        80 + 8 - iconRects.load.w/2, 
        Draw.screenHeight - 8 - iconRects.load.h/2, 
        iconRects.load,
        "tools/sprites/tileicons.png"
    );

    Draw.texturePart(
        96 + 8 - iconRects.play.w/2, 
        Draw.screenHeight - 8 - iconRects.play.h/2, 
        iconRects.play,
        "tools/sprites/tileicons.png"
    );

    if (Input.mouseY >= Draw.screenHeight-16) {
        if (Input.mouseX < 16*7) {
            var index = Math.floor(Input.mouseX / 16);
            Draw.rect(index * 16, Draw.screenHeight - 16, 16, 16, colors.white, false);

            if (index == 0) { tooltip = "properties"; }
            if (index == 1) { tooltip = "paint"; }
            if (index == 2) { tooltip = "fill"; }
            if (index == 3) { tooltip = "entities"; }
            if (index == 4) { tooltip = "save"; }
            if (index == 5) { tooltip = "load"; }
            if (index == 6) { tooltip = "play"; }

            if (Input.mouseLeftDown) {

                if (index == 0) { state = "properties" }
                if (index == 1) { state = "edit"; tool = "paint"; }
                if (index == 2) { state = "edit"; tool = "fill"; }
                // if (index == 3) { state = "edit"; tool = "entity"; }
                if (index == 3) { state = "entityEditor"; }
                if (index == 4) { state = "saveConfirm"; }
                if (index == 5) { state = "loadMap"; updateMaplist(); }
                if (index == 6) { 
                    currentTilemap.save(autosavePath);
                    Assets.unload(autosavePath);
                    var game = load("game.js");
                    game.levelPath = autosavePath;
                    scenes.switchScene(game);
                }
            }
        }
    }

    

    // gui.x = 0; gui.y = 240-Draw.fontHeight;
    // gui.button("properties", function() { state = "properties" });


    // gui.x = 80; gui.y = 240-Draw.fontHeight;
    // gui.button("edit", function() { state = "edit" });

    // gui.x = 120; gui.y = 240-Draw.fontHeight;
    // gui.button("entities", function() { state = "entityEditor" });
}

function drawCanvas()
{
    Draw.rect(0, 0, 320, 240, colors.darkbrown, true);

    
    camera.x = Math.floor(camera.x);
    camera.y = Math.floor(camera.y);

    var canvasSize = {w: currentTilemap.properties.width * currentTilemap.properties.tileWidth, h: currentTilemap.properties.height * currentTilemap.properties.tileHeight};

    Draw.rect(-camera.x, -camera.y, canvasSize.w, canvasSize.h, colors.black, true);
    Draw.rect(-camera.x-1, -camera.y-1, 2 + canvasSize.w, 2 + canvasSize.h, colors.skyblue, false);
    Draw.line(-camera.x, 2-camera.y-1 + canvasSize.h, -1-camera.x + canvasSize.w, 2-camera.y-1 + canvasSize.h, colors.black);
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