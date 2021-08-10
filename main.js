var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");

var sceneList = {
    "zone editor" : load("tools/zoneeditor.js"),
    "plat game" : load("plat/game.js"),
    "tilemap editor" : load("tools/tilemapeditor.js"),
};

Engine.setResolution(320,240,2);

// var autoload = "zone editor";
let autoload = "nothing";

Draw.loadFont("lib/fontsmall.png");
Engine.setMouseVisible(true);

function mainMenu()
{
    gui.label("disaster engine 5");
    gui.label("(c) jazz mickle technocorp");
    gui.space(5);

    var sceneKeys = Object.keys(sceneList);
    for (var i = 0; i < sceneKeys.length; i++) {
        gui.button(sceneKeys[i], function() {scenes.switchScene(sceneList[sceneKeys[i]])});
    }
    
    gui.space(5);
    gui.button("reset", function() { Engine.reset(); });
    gui.button("quit", function() { Engine.quit(); });

    if (sceneList[autoload] != undefined) {
        scenes.switchScene(sceneList[autoload]);
    }
}

function update(dt)
{
    if (Input.getKeyDown(Key.f1)) {
        log("test");
        Debug.toggleProfileGraph();
    }

    if (Input.getKeyDown(Key.f2)) {
        Engine.reset();
        return;
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

    
    if (scenes.scene == null) {
        mainMenu();
    } else {
        scenes.scene.update(dt);
    }
    //gui.button("break", function() { hello(); })
}
