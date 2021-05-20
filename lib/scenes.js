var gui = load("lib/gui.js");

function switchScene(newScene)
{
    if (scene != null) {
        scene.close();
    }
    scene = newScene;
    if (scene.init != null) scene.init();
}

function goToMainMenu()
{
    if (scene != null) {
        if (scene.close != null) scene.close();
    }
    scene = null;
}

var scene = null;