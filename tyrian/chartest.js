var gui = load("gui.js");
var scenes = load("scenes.js");

var string = "";
var othervalue = "hello";
var numbervalue = 100;
var bool = false;

var coolRect = {
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    color: {
        r: 255,
        g: 180,
        b: 0
    },
    array : ["eggs", "beans", "chips"],
    index : 0,
    func : function() { coolRect["fer"+coolRect.index] = "test"; coolRect.index += 1; },
    filled: false
}

// var obj = {
//     name : "hello",
//     coolness : 100,
//     other : {
//         x: 10,
//         y: 10
//     },
//     toggle : false,
//     wow : function() {
//         log("hi!");
//     }
// };

function init()
{
    string = "";
}

function close()
{

}

function update(dt)
{
    gui.label("--------------------");
    gui.label("welcome to gui world");
    gui.label("--------------------");
    // gui.button("button", function() { log("pressed button"); });
    // bool = gui.propertyField("bool", bool);
    // othervalue = gui.textField("textfield:", othervalue);
    // numbervalue = gui.numberField("numberfield:", numbervalue);
    gui.objectEditor("obj", coolRect);
    gui.button("leave", function() { scenes.goToMainMenu(); })

    if (coolRect.filled) {
        Draw.rect(coolRect.x, coolRect.y, coolRect.w, coolRect.h, coolRect.color, true);
    } else {
        Draw.rect(coolRect.x, coolRect.y, coolRect.w, coolRect.h, coolRect.color, false);
    }
}