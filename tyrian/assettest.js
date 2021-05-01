var gui = load("gui.js");
var scenes = load("scenes.js");
var key = load("keycodes.js");

var paths = [];

function init()
{
    paths = Assets.list().split(',');
}

function close()
{

}

function update()
{
    if (Input.getKeyDown(key.escape))
    {
        scenes.goToMainMenu();
    }

    for (var i = 0; i < paths.length; i++)
    {
        gui.label(paths[i]);
    }
}