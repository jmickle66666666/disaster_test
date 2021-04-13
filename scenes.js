var gui = load("gui.js");

function switchScene(newScene)
{
    if (scene != null) {
        scene.close();
    }
    scene = newScene;
    scene.init();
}

function goToMainMenu()
{
    if (scene != null) {
        scene.close();
    }
    scene = null;
}

var scene = null;