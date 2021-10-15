var cellular = load("lib/cellular.js");
var gui = load("lib/gui.js");

width = 16;
height = 16;

drawOffsetX = 80;
drawOffsetY = 80;

funcs = [];
matrix = [];

MAX_RUNS = 20;
constraints = {
    list : [],
    randomSeed : true,
    min : 0,
    max : 1,
    contiguous : false
};

function init()
{
    constraints = {
        list : [],
        randomSeed : true,
        min : 0,
        max : 1,
        contiguous : false
    };
    width = 16;
    height = 16;
    cellular.generate(width, height, {list:[]}); 
    funcs = cellular.getFunctions();
}

function update()
{
    gui.button("reset", function() { 
        cellular.generate(width, height, {list:[]});
        constraints.list = [];
    });
    gui.button("gen", function() { 
        //generate();
    });

    gui.button("save profile", function() {
        Assets.writeText("cellgen.json", JSON.stringify(constraints));
    });

    testGUI();

    //generationMatrix(8, 16);

    for (var i = 0; i < cellular.buffer.length; i++)
    {
        var x = i % width;
        var y = Math.floor(i/width);
        if (cellular.buffer[i] == 1) {
            Draw.rect(drawOffsetX + (x * 8), drawOffsetY + (y * 8), 8, 8, Color.disaster, true);
        } else {
            Draw.rect(drawOffsetX + (x * 8), drawOffsetY + (y * 8), 8, 8, Color.gray, false);
        }
    }
    
    historyGUI();

    if (gui.hovered && Input.mouseLeftUp) {
        generate();
    }

    if (hitMaxAttempts) {
        gui.y += 16;
        gui.label("hit max attempts");
    }
}

var hitMaxAttempts = false;

function generate()
{
    cellular.generate(width, height, constraints);
}

function testGUI()
{
    gui.button("randomFunc", function() {
        var func = funcs[Math.floor(Math.random() * funcs.length)];
        constraints.list.push(func);
        cellular[func]();
    });

    gui.y += 8;

    constraints.randomSeed = gui.boolField("random seed", constraints.randomSeed);
    constraints.contiguous = gui.boolField("contiguous", constraints.contiguous);
    constraints.min = gui.rangeField("min density", constraints.min, 100, 0, 1);
    constraints.max = gui.rangeField("max density", constraints.max, 100, 0, 1);
    
    gui.y += 8;
    for (var i = 0; i < funcs.length; i++)
    {
        gui.button(funcs[i], function () { 
            constraints.list.push(funcs[i]);
        });
    }
}

function historyGUI()
{
    gui.y = 0;
    gui.x = 220;
    gui.label("list:");
    for (var i = 0; i < constraints.list.length; i++)
    {
        gui.button(constraints.list[i], function() {
            constraints.list.splice(i, 1);
        });
    }
}

function close()
{

}