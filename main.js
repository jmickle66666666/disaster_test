var key = load("lib/keycodes.js");
var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");

var sceneList = {
    //"tyrian clone" : load("tyrian/tyrian.js"),
    //"path editor" : load("tyrian/patheditor.js"),
    //"asset list test" : load("tyrian/assettest.js"),
    //"char test" : load("tyrian/chartest.js"),
    "play game" : load("game.js"),
    "sprite editor" : load("tools/spriteeditor.js"),
    "tilemap editor" : load("tools/tilemapeditor.js"),
    "brb" : load("brb.js"),
    //"func" : load("func.js"),
    //"zigeye" : load("zigeye.js"),
    //"triangle" : load("triangle.js"),
    // "laptopZome" : load("scenes/laptopzome.js"),
    // "transformtests" : load("scenes/transformtests.js"),
    // "flappy" : load("scenes/flappyskull.js"),
    // "intro" : load("scenes/intro/intro.js"),
    //"lunaship" : load("scenes/lunaship/lunaship.js"),
};

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
}

function update(dt)
{
    if (Input.getKeyDown(key.f1)) {
        Debug.toggleProfileGraph();
    }

    if (Input.getKeyDown(key.f2)) {
        Engine.reset();
    }

    if (Input.getKeyDown(key.f6)) {
        Engine.toggleOverdraw();
    }

    if (Input.getKeyDown(key.f7)) {
        Engine.slowDrawFrame(64);
    }

    Draw.clear();
    gui.reset();

    
    if (scenes.scene == null) {
        mainMenu();
    } else {
        scenes.scene.update(dt);
    }
    gui.button("break", function() { hello(); })
}
