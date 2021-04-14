var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var sceneList = {
    "laptopZome" : load("scenes/laptopzome.js"),
    "spritetest" : load("scenes/spritetest.js"),
    "transformtests" : load("scenes/transformtests.js"),
    "flappy" : load("scenes/flappyskull.js"),
    "intro" : load("scenes/intro/intro.js"),
    "lunaship" : load("scenes/lunaship/lunaship.js"),
};

Draw.loadFont("font1b.png");


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
    if (Input.getKeyDown(key.d)) {
        Debug.toggleProfileGraph();
    }

    Draw.clear();
    gui.reset();

    if (scenes.scene == null) {
        mainMenu();
    } else {
        scenes.scene.update(dt);
    }
}
