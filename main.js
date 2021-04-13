var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");
var laptopZome = load("scenes/laptopzome.js");
var spritetest = load("scenes/spritetest.js");
var skulltest = load("scenes/skulltest.js");
var flappy = load("scenes/flappyskull.js");

Draw.loadFont("font1b.png");


function mainMenu()
{
    gui.label("disaster engine 5");
    gui.label("(c) jazz mickle technocorp");
    gui.space(5);
    gui.button("go to the laptop zome", function() { scenes.switchScene(laptopZome); });
    gui.button("go to sprite test", function() { scenes.switchScene(spritetest); });
    gui.button("enter skull testing site", function() { scenes.switchScene(skulltest); });
    gui.button("enable flappy skull", function() { scenes.switchScene(flappy); });
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
