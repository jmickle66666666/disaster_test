var spriteCount = 0;
var rot = 0;

function update(dt)
{

    // rot += dt * 100;
    if (Input.getKeyDown(Key.g)) {
        spriteCount+= 1;
    }
    for (var i = 0; i < spriteCount; i++) {
        Draw.texture("sprites/bigtest.png", 0, 0);
        //     Draw.texture("sprites/ship1.png", 20 + i * 20, 100, {x:0, y:0, w:32, h:32}, {originX:16, originY:16, rotation: rot});
    }
    Draw.text(spriteCount, 0, 20, Color.white);
}