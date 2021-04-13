var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");
var tiles = load("scenes/tilesetter.js");

function init()
{
    tiles.init();
}

var shipX = 5;
var shipY = 5;
var shipSpeed = 1000/320;
var shipMomentum = {
    x:0, y:0
};
var friction = -10;

var shipRect = {
    x: 16, y: 0,
    w: 32, h: 32
};

var time = 0;

function update(dt)
{
    time += dt;
    if (Input.getKeyDown(key.escape)) {
        scenes.goToMainMenu();
    }

    var mx = 0;
    var my = 0;
    if (Input.getKey(key.left)) { mx -= 1; }
    if (Input.getKey(key.right)) { mx += 1; }
    if (Input.getKey(key.up)) { my -= 1; }
    if (Input.getKey(key.down)) { my += 1; }

    shipMomentum.x += shipSpeed * mx * dt;
    shipMomentum.y += shipSpeed * my * dt;
    shipMomentum.x *= Math.exp(friction * dt);
    shipMomentum.y *= Math.exp(friction * dt);
    shipX += shipMomentum.x * dt;
    shipY += shipMomentum.y * dt;

    var frame = 0;
    if (mx == 1) frame += 32; else if (mx == -1) frame += 64;

    gui.label("sprite test");

    tiles.draw(time);

    if (shipX < 0) shipX = 0;
    if (shipX > 320-32) shipX = 320-32;
    if (shipY < 0) shipY = 0;
    if (shipY > 240-32) shipY = 240-32;

    shipRect.y = 0 + frame;
    Draw.texturePart(shipX, shipY, shipRect, "sprites/sprites.png");


}

function close()
{

}