var gui = load("lib/gui.js");
var sceneStack = [];

function openScene(newScene)
{
    log(newScene.path);
    sceneStack.push(newScene);
    if (newScene.init != null) newScene.init();
}

function closeScene()
{
    let popScene = sceneStack.pop();
    if (popScene == null) return;
    if (popScene.close != null) popScene.close();
}

function update(dt)
{
    if (sceneStack.length > 0) {
        sceneStack[sceneStack.length-1].update(dt);
    }
}