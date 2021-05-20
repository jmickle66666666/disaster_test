var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");
var tiles = load("tyrian/tilesetter.js");
var bullets = load("tyrian/bullets.js");
var collision = load("tyrian/collision.js");
var enemies = load("tyrian/enemies.js");
var weapons = load("tyrian/weapons.js");
var xplos = load("tyrian/xplos.js");
var screenshake = load("tyrian/screenshake.js");
var score = load("tyrian/score.js");
var enemytypes = load("tyrian/enemytypes.js");
var timeline = load("tyrian/timeline.js");
var sprite = load("lib/sprite.js");

var preload = [
    "tyrian/sprites/sprites.png",
    "tyrian/sprites/tiles.png",
    "audio/hit1.wav",
    "audio/wove.ogg",
    "audio/hit2.wav",
    "audio/shoot1.wav",
    "audio/slap1.wav",
]

function init()
{
    Draw.clear();
    gui.reset();
    gui.label("loading..")
    for (var i = 0; i < preload.length; i++)
    {
        gui.label(preload[i]);
        Engine.preload(preload[i]);
        Engine.redraw();
    }

    tiles.init();
    timeline.loadlevel("tyrian/levels/test.txt");
    score.init(timeline.length);
}

var shipX = 160;
var shipY = 160;
var shipSpeed = 1600;
var shipMomentum = {
    x:0, y:0
};
var friction = -5;
var reloadTimer = 0;
var debugEnabled = false;
var shipBounds = {
    x:16, y:16, w:224, h:208
};

var shipRect = {
    x: 16, y: 0,
    w: 32, h: 32
};

var time = 0;

var weaponSelect = false;
var currentWeapon = weapons.list.blaster;

function update(dt)
{
    time += dt;

    timeline.update(dt);
    
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


    //gui.label("sprite test");

    tiles.xOffset = (shipX / 320) * -40;
    tiles.draw(time);

    if (shipX < shipBounds.x) shipX = shipBounds.x;
    if (shipX > shipBounds.w) shipX = shipBounds.w;
    if (shipY < shipBounds.y) shipY = shipBounds.y;
    if (shipY > shipBounds.h) shipY = shipBounds.h;

    if (Input.getKey(key.z)) {
        if (reloadTimer <= 0) {
            reloadTimer = currentWeapon.fireRate;
            
            currentWeapon.fire(shipX, shipY);
        }
    }
    reloadTimer -= dt;

    if (mx == 1) {
        sprite.draw(shipX, shipY, "player_r");
    } else if (mx == -1) {
        sprite.draw(shipX, shipY, "player_l");
    } else {
        sprite.draw(shipX, shipY, "player");
    }

    collision.bbox(shipX - 6, shipY - 6, 12, 12, "player", {
        collide: function () {
            score.score -= 1;
        }
    });

    enemies.update(dt, shipX, shipY);
    bullets.update(dt);

    if (Input.getKeyDown(key.f3)) {
        collision.debugEnabled = !collision.debugEnabled;
        debugEnabled = !debugEnabled;
    }

    if (Input.getKeyDown(key.f4)) {
        weaponSelect =! weaponSelect;
    }

    if (Input.getKeyDown(key.f5)) {
        screenshake.shake(10);
    }

    if (weaponSelect) {
        gui.label("waepon select:");
        var weaponNames = Object.keys(weapons.list);
        for (var i = 0; i < weaponNames.length; i++)
        {
            gui.button(weaponNames[i], function() {
                currentWeapon = weapons.list[weaponNames[i]];
            });
        }
    }
    
    if (debugEnabled) {
        gui.label("colliders: "+collision.colliders.length);
        gui.label("bullets: "+bullets.bullets.length);
        gui.label("xplos: "+xplos.xplos.length);
    }

    collision.resolve();
    xplos.update(dt);
    screenshake.update(dt);

    //gui.label("score: "+score.score);
    score.draw(dt);
}

function close()
{

}