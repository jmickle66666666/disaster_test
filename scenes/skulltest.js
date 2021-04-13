var key = load("keycodes.js");
var scenes = load("scenes.js");

function init()
{

}

function update(dt)
{
    if (Input.getKeyDown(key.escape)) {
        scenes.goToMainMenu();
    }
    Draw.texture(5, 5, "sprites/skull.png");
}

function close()
{

}