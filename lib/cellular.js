var buffer = new Int8Array();
var width = 0;
var height = 0;
var maxAttempts = 20;

function generate(width, height, constraints)
{    
    this.width = width;
    this.height = height;

    if (constraints.randomSeed) {
        seed = Math.random();
        var attempts = 0;
        var fillRatio = -1;
        var hitMaxAttempts = false;
        while (fillRatio < constraints.min || fillRatio > constraints.max) {
            if (attempts > maxAttempts) {
                hitMaxAttempts = true;
                log("hit max");
                break;
            }
            attempts += 1;
            buffer = new Int8Array(width*height);
            // for (var i = 0; i < width*height; i++)
            // {
            //     buffer[i] = 0;
            // }

            for (var i = 0; i < constraints.list.length; i++)
            {
                this[constraints.list[i]]();
            }        
            if (constraints.contiguous)
            {
                makeContiguousIsland();
            }
            fillRatio = getFillRatio();
        }
    } else {
        seed = 0;
        buffer = new Int8Array(width*height);
        // for (var i = 0; i < width*height; i++)
        // {
        //     buffer[i] = 0;
        // }

        for (var i = 0; i < constraints.list.length; i++)
        {
            this[constraints.list[i]]();
        } 
    }
}

function copyBuffer()
{
    var output = new Int8Array(width*height);
    for (var i = 0; i < buffer.length; i++)
    {
        output[i] = buffer[i];
    }
    return output;
}

function getNeighborCount(index)
{
    var x = index % width;
    var y = Math.floor(index / width);

    var output = 0;

    if (x > 0 && buffer[index-1] == 1) output += 1;
    if (x < width-1 && buffer[index+1] == 1) output += 1;
    if (y > 0 && buffer[index-width] == 1) output += 1;
    if (y < height-1 && buffer[index+width] == 1) output += 1;
    
    return output;
}

function get8NeighborCount(index)
{
    var x = index % width;
    var y = Math.floor(index / width);

    var output = 0;

    for (var i = -1; i < 2; i++)
    {
        for (var j = -1; j < 2; j++)
        {
            if (!(i == 0 && j == 0)) {
                if (x + i > 0 && x + i < width-1 && y + j > 0 && y + j < height - 1) {
                    var ni = ((y + j) * width) + x + i;
                    if (buffer[ni] == 1) output += 1;
                }
            }
        }
    }
    
    return output;
}

function getFunctions()
{
    var myProps = Object.getOwnPropertyNames(this);
    var stf = Object.getOwnPropertyNames(load("main.js"));
    var ignoreProperties = ["buffer", "width", "height", "get8NeighborCount", "generate", "copyBuffer", "getNeighborCount", "getFunctions", "getFillRatio", "random", "randomSeed", "seed", "makeContiguousIsland", "maxAttempts"];
    var output = [];
    for (var i = 0; i < myProps.length; i++)
    {
        if (stf.indexOf(myProps[i]) == -1 && ignoreProperties.indexOf(myProps[i]) == -1) {
            output.push(myProps[i]);
        } 
    }
    return output;
}

function getFillRatio()
{
    var count = 0;

    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i]) count += 1;
    }

    return count / buffer.length;
}

var seed = Math.random() *1234668;
function random()
{
    seed = (seed * 1103515245 + 12345) % 2147483647;
    return (seed/1000) % 1.0;
}

// finds the largest island and removes everything else
function makeContiguousIsland()
{
    //var maxSize = (width * height) / 2;
    var data = [];
    for (var i = 0; i < width * height; i++)
    {
        data.push(buffer[i] - 1);
    }

    function floodTile(index, id)
    {
        if (data[index] != 0) return;
        var x = index % width;
        var y = Math.floor(index / width);

        data[index] = id;
        
        if (x != 0) floodTile(index - 1, id);
        if (x != width-1) floodTile(index + 1, id);
        if (y != 0) floodTile(index - width, id);
        if (y != height-1) floodTile(index + width, id);
    }

    var index = 1;
    
    for (var i = 0; i < buffer.length; i++)
    {
        if (data[i] == 0) {
            floodTile(i, index);
            index += 1;
        }
    }

    var counts = [];
    for (var i = 0; i < index; i++) {
        counts.push(0);
    }

    var maxCount = 0;
    var maxIndex = 0;
    for (var i = 0; i < buffer.length; i++)
    {
        if (data[i] > 0) {
            counts[data[i]] += 1;
            if (counts[data[i]] > maxCount) {
                maxCount = counts[data[i]];
                maxIndex = data[i];
            }
        }
    }

    for (var i = 0; i < buffer.length; i++)
    {
        if (data[i] == maxIndex) {
            buffer[i] = 1;
        } else {
            buffer[i] = 0;
        }
    }
}

// processes

function noise()
{
    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i] == 0 && random()<0.33) buffer[i] = 1;
    }
}

function decay()
{
    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i] == 1 && random()<0.33) buffer[i] = 0;
    }
}

function invert()
{
    for (var i = 0; i < buffer.length; i++)
    {
        buffer[i] = 1-buffer[i];
    }
}

function grow()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (getNeighborCount(i) > 0) newBuffer[i] = 1;
    }
    buffer = newBuffer;
}

function growNoise()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (getNeighborCount(i) > 0 && random()<0.33) newBuffer[i] = 1;
    }
    buffer = newBuffer;
}

function shrink()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (getNeighborCount(i) < 4) newBuffer[i] = 0;
    }
    buffer = newBuffer;
}

function shrinkNoise()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (getNeighborCount(i) < 4 && random()<0.33) newBuffer[i] = 0;
    }
    buffer = newBuffer;
}

function outline()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i] == 0) {
            if (getNeighborCount(i) > 0) newBuffer[i] = 1;
        } else {
            newBuffer[i] = 0;
        }
    }
    buffer = newBuffer;
}

function squareOutline()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i] == 0) {
            if (get8NeighborCount(i) > 0) newBuffer[i] = 1;
        } else {
            newBuffer[i] = 0;
        }
    }
    buffer = newBuffer;
}

function smooth()
{
    var newBuffer = copyBuffer();
    for (var i = 0; i < buffer.length; i++)
    {
        if (buffer[i] == 1 && getNeighborCount(i) < 2) {
            newBuffer[i] = 0;
        }
    }
    buffer = newBuffer;
}

function border()
{
    for (var i = 0; i < buffer.length; i++)
    {
        var x = i % width;
        var y = Math.floor(i / width);
        if (x == 0 || x == width-1 || y == 0 || y == height-1) buffer[i] = 1;
    }
}

function circle()
{
    var centerX = Math.floor(random() * width);
    var centerY = Math.floor(random() * height);
    var radius = (0.25 + random() * 0.75) * Math.min(width, height) / 2;
    radius *= radius;
    var fill = buffer[centerY * width + centerX] == 1;

    for (var i = 0; i < buffer.length; i++)
    {
        var x = i % width;
        var y = Math.floor(i / width);
        var dx = x - centerX;
        var dy = y - centerY;
        var dist = dx * dx + dy * dy;
        if (dist < radius) {
            buffer[i] = fill?0:1;
        }
    }
}

function rect()
{
    var x1 = 0;
    var x2 = 0;
    var y1 = 0;
    var y2 = 0;

    while (x1 == x2 || y1 == y2) {
        x1 = Math.floor(random() * width);
        y1 = Math.floor(random() * height);
        x2 = Math.floor(random() * width);
        y2 = Math.floor(random() * height);
    }

    var minx = Math.min(x1, x2);
    var miny = Math.min(y1, y2);
    var maxx = Math.max(x1, x2);
    var maxy = Math.max(y1, y2);

    var centerX = ((maxx - minx) / 2) + minx;
    var centerY = ((maxy - miny) / 2) + miny;

    var fill = buffer[centerY * width + centerX] == 1;

    for (var i = 0; i < buffer.length; i++)
    {
        var x = i % width;
        var y = Math.floor(i / width);
        if (x >= minx && x < maxx && y >= miny && y < maxy) {
            buffer[i] = fill?0:1;
        }
    }
}