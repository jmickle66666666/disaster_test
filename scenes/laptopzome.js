
var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");



var color = { r: 255, g: 127, b: 20, a: 255 };
var color2 = { r: 255, g: 127, b: 20, a: 255 };
var rand = [0.72,0.04,0.8,0.55,0.56,0.2,0.86,0.84,0.16,0.9,0.38,0.87,0.74,0.45,0.36,0.24,0.94,0.25,0.12,0.31,0.12,0.88,0.68,0.59,0.4,0.76,0.59,0.85,0.56,0.72,0.24,0.49,0.3,0.15,0.17,0.63,0.96,0.57,0.61,0.38,0.12,0.57,0.8,0.01,0.88,0.34,0.6,0.93,0.47,0.34,0.67,0.93,0.54,0.05,0.77,0.67,0.55,0.71,0.58,0.9,0.55,0.49,0.05,0.59];
var randIndex = 0;
var position = {x: 0, y: -1, z: -5};
var rotation = {x: 0, y: 0, z: 0};

var t = 0;

var laptops = 10;



function random()
{
    var output = rand[randIndex];
    randIndex += 1;
    if (randIndex >= rand.length) {
        randIndex = 0;
    }
    return output;
}

function init()
{

}

function update(dt)
{
    t += dt;
    if (Input.getKeyDown(key.m)) {
        Audio.playMusic("audio/wove.ogg");
    }

    if (Input.getKeyDown(key.n)) {
        Audio.playSound("audio/slap1.wav");
    }

    // gui.label("mouse "+Input.mouseX+" "+Input.mouseY+" "+Input.mouseLeft+" "+Input.mouseLeftDown);
    //gui.label("label "+(scenes));
    gui.space(5);
    gui.button("get the h*ck out of here", function() {scenes.goToMainMenu();});
    gui.space(5);
    gui.button("more", function() { laptops *= 2; });
    gui.button("less", function() { laptops /= 2; });
    
    var ct = t / 100;
    color2.b = 128 + Math.sin(ct) * 128;
    color2.r = 128 + Math.sin(ct + 2) * 128;
    color2.g = 128 + Math.sin(ct + 4) * 128;
    Draw.text(75, 124, "SPINNING LAPTOP ZOME", color2);
    randIndex = 0;
    for (var i = 0; i < laptops; i++) {
        rotation.y = t/1000;
        position.x = -5 + random() * 10;
        position.y = -4 + random() * 6;
        position.z = -5 - random() * 25;
        Draw.model(
            position,
            rotation,
            "laptop.obj", "laptop.png"
        );
    }
}

function close()
{

}