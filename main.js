var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");
var console = load("tools/console.js");

function randomResolution()
{
    // useful for testing
    var x = Math.floor(320 + Math.random() * 320);
    var y = Math.floor(240 + Math.random() * 240);
    Engine.setResolution(x, y, 2);
}

function init() {
    Engine.setResolution(320,240,2);
    // randomResolution();
    Engine.setTargetFPS(60);
    Draw.loadFont("lib/fontsmall.png");
    Draw.setFOV(90);
    Engine.setMouseVisible(true);
    gui.init();
    console.init();

    // load a default scene here!
    //scenes.openScene(load("tools/filebrowser.js"));

    initialised = true;
}

let initialised = false;

function update(dt)
{
    if (!initialised) {
        init();
    }

    if (Input.getKeyDown(Key.f1)) {
        Debug.toggleProfileGraph();
    }

    if (Input.getKeyDown(Key.f3)) {
        Engine.reloadShaders();
    }

    if (Input.getKeyDown(Key.f6)) {
        Engine.toggleOverdraw();
    }

    if (Input.getKeyDown(Key.f7)) {
        Engine.slowDrawFrame(64);
    }

    if (Input.getKeyDown(Key.f8)) {
        Assets.unloadAll();
    }

    Draw.clear();
    gui.reset();
    
    if (scenes.sceneStack.length == 0) {
        console.active = true;
    }
    
    scenes.update(dt);
    console.update(dt);
}
