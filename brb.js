var colors = load("lib/colors.js");
var t = 0;

function update(dt)
{
    t += dt * 40;
    for (var i = 60; i < 320-60; i++)
    {
        for (var j = 60; j < 240-60; j++)
        {
            var col = colors.disaster;
            if ((t + i + j) % 20 < 10) {
                col = colors.black;
            }
            Draw.rect(i, j, 1, 1, col);
        }
    }

    Draw.texture(0, 0, "sprites/brb.png");
}