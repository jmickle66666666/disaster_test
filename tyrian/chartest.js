var gui = load("gui.js");
var scenes = load("scenes.js");

var string = "";
var othervalue = "hello";

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
    gui.button("button", function() { log("pressed button"); });
    othervalue = gui.textField("textfield:", othervalue);
    gui.button("leave", function() { scenes.goToMainMenu(); })
}