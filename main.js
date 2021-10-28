var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");
var console = load("tools/console.js");

function init() {
    Engine.setResolution(320,240,2);
    Draw.loadFont("lib/fontsmall.png");
    Engine.setMouseVisible(true);
    gui.init();
    console.init();

    // load a default scene here!
    //scenes.openScene(load("mycoolgame.js"));

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
    
    if (scenes.sceneStack.length == 0) console.active = true;
    scenes.update(dt);
    console.update(dt);
}
