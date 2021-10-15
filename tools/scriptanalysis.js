var gui = load("lib/gui.js");
var lines = [];

function init()
{
    var il = Debug.ilAnalysis("test.js");

    lines = il.split(/\r?\n/);

    Engine.setResolution(1024,768,1);
}

function update()
{
    for (var i = 0; i < lines.length; i++)
    {
        gui.label(lines[i]);
    }
}

function close()
{

}