var key = load("keycodes.js");
var scenes = load("scenes.js");

function init()
{

}

var time = 0;
function update(dt)
{
    time += dt;
    if (Input.getKeyDown(key.escape)) {
        scenes.goToMainMenu();
    }
    Draw.texture(5, 5, "sprites/ship1.png");
    Draw.textureTransformed(5 + 32, 5, {scaleX:.5, scaleY:.5}, "sprites/ship1.png");
    var scal = 1 + Math.sin(time);
    Draw.textureTransformed(5 + 64, 5, {scaleX:scal, scaleY:scal}, "sprites/ship1.png");
    Draw.textureTransformed(5 + 128 + 32, 5 + 32, {originX:16, originY:16, scaleX:scal, scaleY:scal}, "sprites/ship1.png");
    Draw.textureTransformed(5, 5 + 32, {scaleX:2, scaleY:2}, "sprites/ship1.png");
    Draw.textureTransformed(5 + 16, 5 + 128 + 16, {rotation:time * 180, originX:16, originY:16}, "sprites/ship1.png");
    Draw.textureTransformed(5 + 16 + 64, 5 + 128 + 16, {scaleX:2, scaleY:2, rotation:time * 180, originX:16, originY:16}, "sprites/ship1.png");
    Draw.textureTransformed(5 + 16 + 64 + 64, 5 + 128 + 16, {scaleX:scal, scaleY:scal, rotation:time * 180, originX:16, originY:16}, "sprites/ship1.png");
}

function close()
{

}