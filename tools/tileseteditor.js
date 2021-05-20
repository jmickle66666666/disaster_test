var tileset = load("lib/tileset.js");
var gui = load("lib/gui.js");
var colors = load("lib/colors.js");
var key = load("lib/keycodes.js");

var currentTileset;
var currentTile = 0;

function init()
{
    currentTileset = tileset.create();
    currentTileset.properties.texture = "sprites/cavetiles.png";
}

var state = "properties";

function update()
{
    var numTilesX = Math.floor(Assets.getTextureSize(currentTileset.properties.texture).w / currentTileset.properties.tileWidth);
    var numTilesY = Math.floor(Assets.getTextureSize(currentTileset.properties.texture).h / currentTileset.properties.tileHeight);

    var tileX = Math.floor(Input.mouseX / currentTileset.properties.tileWidth);
    var tileY = Math.floor(Input.mouseY / currentTileset.properties.tileHeight);
    var mouseX = tileX * currentTileset.properties.tileWidth;
    var mouseY = tileY * currentTileset.properties.tileHeight;

    if (state == "properties") {
        currentTileset.properties = gui.objectEditor("tileset properties", currentTileset.properties);
    }

    if (state == "pick") {
        Draw.texture(0, 0, currentTileset.properties.texture);
        Draw.rect(mouseX, mouseY, currentTileset.properties.tileWidth, currentTileset.properties.tileHeight, colors.white, false);

        if (Input.mouseLeftDown) {
            if (tileX < numTilesX && tileY < numTilesY) {
                currentTile = tileX + (tileY * numTilesX);
            }
        }

        Draw.rect(
            (currentTile % numTilesX) * currentTileset.properties.tileWidth, 
            Math.floor(currentTile / numTilesX) * currentTileset.properties.tileHeight, 
            currentTileset.properties.tileWidth, 
            currentTileset.properties.tileHeight, 
            colors.disaster, 
            false
        );

        if (Input.getKeyUp(key.tab)) {
            state = "edit";
        }
    }

    if (state == "edit") {
        currentTileset.render(0, 0);

        Draw.rect(mouseX, mouseY, currentTileset.properties.tileWidth, currentTileset.properties.tileHeight, colors.white, false);

        if (Input.mouseRightDown) {
            if (tileX < currentTileset.properties.width && tileY < currentTileset.properties.height) {
                var index = tileX + tileY * currentTileset.properties.width;
                currentTile = currentTileset.tiles[index];
            }
        }

        if (Input.mouseLeft) {
            if (tileX < currentTileset.properties.width && tileY < currentTileset.properties.height) {
                var index = tileX + tileY * currentTileset.properties.width;
                currentTileset.tiles[index] = currentTile;
            }
        }

        if (Input.getKeyDown(key.tab)) {
            state = "pick";
        }
    }

    

    gui.x = 0; gui.y = 240-Draw.fontHeight;
    gui.button("properties", function() { state = "properties" });

    // gui.x = 80; gui.y = 240-Draw.fontHeight;
    // gui.button("pick", function() { state = "pick" });

    gui.x = 80; gui.y = 240-Draw.fontHeight;
    gui.button("edit", function() { state = "edit" });

}