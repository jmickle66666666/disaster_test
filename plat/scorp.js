var game = load("plat/game.js");
var gui = load("lib/gui.js");
var colors = load("lib/colors.js");
var collision = load("lib/collision.js");

var x;
var y;

var time = 0;
var frame = 0;

var direction = 1;
var moveSpeed = 15;


var solidTiles = [
    16, 17, 18, 19, 20,
    64, 65, 66, 67, 68,
    80, 81, 82, 83, 84,
];

function tileCheck(x, y)
{
    return solidTiles.includes(game.level.getTile(
        Math.floor(x / 16),
        Math.floor(y / 16)
    ));
}

function update(dt)
{
    time += dt;
    frame = Math.floor((time * 4) % 3);

    x += dt * moveSpeed * direction;

    if (
        !tileCheck(x + (8 * direction), y + 9) || tileCheck(x + (8 * direction), y)
    ) {
        direction *= -1;
    }

    Draw.texturePart(
        x - 16 - game.camera.x, 
        y - 8 - game.camera.y, 
        {x: (direction + 1) * 16, y : frame * 16, w: 32, h:16},
        "sprites/scorp.png"
    );

    collision.bbox(x - game.camera.x - 8, y - game.camera.y, 16, 8, this);
}

function collide(other)
{
    if (other.name == "player") 
    {
        other.hurt(Math.sign(other.x - x));
    }
}