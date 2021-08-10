var game = load("plat/game.js");
var gui = load("lib/gui.js");
var colors = load("lib/colors.js");

var x;
var y;

var signDistance = 16;
var signTimer = 0;

function update(dt)
{
    var playerDist = Math.abs(game.player.x - x) + Math.abs(game.player.y - y);
    if (playerDist < signDistance) {
        if (Input.getKey(Key.up)) {
            signTimer += dt * 30;
            var m = message.substring(0, Math.min(signTimer, message.length));
            var messageLength = m.length * Draw.fontWidth;
            Draw.rect(-3 + x - messageLength/2- game.camera.x, y + 13- game.camera.y, messageLength+6, Draw.fontHeight+5, colors.orange, false);
            Draw.rect(-2 + x - messageLength/2- game.camera.x, y + 14- game.camera.y, messageLength+4, Draw.fontHeight+3, colors.darkbrown, true);
            Draw.text(x - messageLength/2- game.camera.x, y + 16- game.camera.y, m, colors.white);
        } else {
            signTimer = 0;
        }
    }

    Draw.texture(x - 8 - game.camera.x, y - 8 - game.camera.y, "sprites/sign.png");
}