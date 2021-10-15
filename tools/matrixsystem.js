var cellular = load("lib/cellular.js");
var gui = load("lib/gui.js");

width = 16;
height = 16;

drawOffsetX = 120;
drawOffsetY = 16;

funcs = [];
history = [];
matrix = [];

function init()
{
    width = 16;
    height = 16;
    cellular.generate(width, height, {list:[]}); 
    funcs = cellular.getFunctions();
    history = [];
}

function update()
{
    // gui.button("reset", function() { 
    //     cellular.generate(width, height, []); 
    //     history = [];
    // });
    // gui.button("gen", function() { 
    //     runMatrix();
    //     // do matrix stuff here
    // });

    // testGUI();

    generationMatrix(8, 16);

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

    var bx = 260;
    var by = 40;

    if (button(bx, by)) { cycleMatrixDown(); } bx += 8;
    if (button(bx, by)) { runPassOnMatrix("invert"); } bx += 8;
    if (button(bx, by)) { cycleMatrixUp(); } bx += 8;
    
    bx = 260; by += 8;

    if (button(bx, by)) { runPassOnMatrix("noise"); } bx += 8;
    if (button(bx, by)) { runPassOnMatrix("outline"); } bx += 8;
    if (button(bx, by)) { addRandomMatrixRow(); } bx += 8;
    
    bx = 260; by += 8;
    
    if (button(bx, by)) { cycleMatrixLeft(); } bx += 8;
    if (button(bx, by)) { runPassOnMatrix("smooth"); } bx += 8;
    if (button(bx, by)) { cycleMatrixRight(); } bx += 8;
    
    // historyGUI();
}

function generationMatrix(x, y)
{
    var mx = Math.floor((Input.mouseX - x) / 8);
    var my = Math.floor((Input.mouseY - y) / 8);

    for (var i = 0; i < matrix.length; i++)
    {
        for (var j = 0; j < matrix[i].length; j++)
        {
            if (matrix[i][j]) {
                Draw.rect(x + (j * 8), y + (i * 8), 8, 8, Color.disaster, true);
            } else {
                Draw.rect(x + (j * 8), y + (i * 8), 8, 8, Color.gray, false);
            }
        }
    }

    for (var i = 0; i < funcs.length; i++) {
        Draw.rect(x + (i * 8), y + (matrix.length * 8), 8, 8, Color.darkbrown, false);   
    }

    if (mx < funcs.length && mx >= 0 && my >= 0 && my <= matrix.length) {
        Draw.rect(x + mx * 8, y + my * 8, 8, 8, Color.white, false);

        if (Input.mouseLeftDown) {
            if (my == matrix.length) {
                var newMatrixEntry = [];
                for (var i = 0; i < funcs.length; i++) {
                    newMatrixEntry.push(mx == i);
                }
                matrix.push(newMatrixEntry);
            } else {
                matrix[my][mx] = !matrix[my][mx];

                // just removed one, check if shrink is needed
                if (!matrix[my][mx] && my == matrix.length-1) {
                    var empty = true;
                    for (var i = 0; i < matrix[my].length; i++) {
                        if (matrix[my][i]) {
                            empty = false;
                            break;
                        }
                    }
                    if (empty) {
                        matrix.length = my;
                    }
                }
            }
            runMatrix();
        }
    }
}

function cycleMatrixLeft()
{
    for (var i = 0; i < matrix.length; i++)
    {
        var matrixEntry = matrix[i];
        var temp = matrixEntry[0];
        for (var j = 0; j < matrixEntry.length-1; j++) {
            matrixEntry[j] = matrixEntry[j+1];
        }
        matrixEntry[matrixEntry.length-1] = temp;
    }
    runMatrix();
}

function cycleMatrixRight()
{
    for (var i = 0; i < matrix.length; i++)
    {
        var matrixEntry = matrix[i];
        var temp = matrixEntry[matrixEntry.length-1];
        for (var j = matrixEntry.length-1; j > 0; j--) {
            matrixEntry[j] = matrixEntry[j-1];
        }
        matrixEntry[0] = temp;
    }
    runMatrix();
}

function cycleMatrixDown()
{
    var temp = matrix[matrix.length-1];
    for (var j = matrix.length-1; j > 0; j--) {
        matrix[j] = matrix[j-1];
    }
    matrix[0] = temp;
    runMatrix();
}

function cycleMatrixUp()
{
    var temp = matrix[0];
    for (var j = 0; j < matrix.length-1; j++) {
        matrix[j] = matrix[j+1];
    }
    matrix[matrix.length-1] = temp;
    runMatrix();
}

function addRandomMatrixRow()
{
    var newMatrix = [];
    for (var i = 0; i < funcs.length; i++)
    {
        newMatrix.push(Math.random() < 0.3);
    }
    matrix.push(newMatrix);
    runMatrix();
}

function runPassOnMatrix(func)
{
    var tempBuffer = [];
    for (var i = 0; i < cellular.buffer.length; i++) {
        tempBuffer.push(cellular.buffer[i]);
    }
    var tempWidth = cellular.width;
    var tempHeight = cellular.height;
    log("matrix size: "+matrix.length * funcs.length);
    cellular.width = funcs.length;
    cellular.height = matrix.length;
    //var matrixBuffer = [];
    for (var i = 0; i < matrix.length; i++)
    {
        for (var j = 0; j < funcs.length; j++) {
            cellular.buffer[(i * funcs.length) + j] = matrix[i][j]?1:0;
        }
    }
    cellular.buffer.length = matrix.length * funcs.length;
    //cellular.buffer = matrixBuffer;
    cellular[func]();
    log (cellular.buffer.length);
    for (var i = 0; i < cellular.buffer.length; i++)
    {
        var x = i % cellular.width;
        var y = Math.floor(i / cellular.width);
        log(x + ", "+ y);
        matrix[y][x] = (cellular.buffer[i] == 1);
    }
    
    cellular.buffer.length = tempWidth * tempHeight;
    for (var i = 0; i < tempBuffer.length; i++)
    {
        cellular.buffer[i] = tempBuffer[i];
    }
    cellular.width = tempWidth;
    cellular.height = tempHeight;

    runMatrix();

}

function button(x, y)
{
    if (Input.mouseX >= x && Input.mouseX < x + 8 && Input.mouseY >= y && Input.mouseY < y + 8) {
        Draw.rect(x, y, 8, 8, Color.white, false);
        if (Input.mouseLeftDown) {
            return true;
        }
    } else {
        Draw.rect(x, y, 8, 8, Color.gray, false);
    }
    return false;
}

function runMatrix()
{
    cellular.seed = 0.5;
    cellular.generate(width, height, {list:[]}); 
    history = [];
    for (var i = 0; i < matrix.length; i++)
    {
        var matrixEntry = matrix[i];
        var options = [];
        for (var j = 0; j < matrixEntry.length; j++) {
            log(funcs[j]);
            if (matrixEntry[j]) cellular[funcs[j]]();
            //if (matrixEntry[j]) options.push(funcs[j]);
        }
        
        if (options.length > 0) {
            var func = options[Math.floor(Math.random() * options.length)];
            history.push(func);
            cellular[func]();
        }
    }
}

function testGUI()
{
    gui.button("randomFunc", function() {
        var func = funcs[Math.floor(Math.random() * funcs.length)];
        history.push(func);
        cellular[func]();
    });

    gui.button("20randomFunc", function() {
        for (var i = 0; i < 20; i++) {
            var func = funcs[Math.floor(Math.random() * funcs.length)];
            history.push(func);
            cellular[func]();
        }
    });

    gui.button("do 20 until Filled Enough", function() {
        var attempts = 0;
        var fillRatio = 0;
        while (fillRatio < 0.4 || fillRatio > 0.9) {
            attempts += 1;
            cellular.generate(width, height, []); 
            history = [];
            for (var i = 0; i < 20; i++) {
                var func = funcs[Math.floor(Math.random() * funcs.length)];
                history.push(func);
                cellular[func]();
            }
            fillRatio = cellular.getFillRatio();
            log(fillRatio);
        }
        log(attempts);
    });

    gui.y += 8;
    for (var i = 0; i < funcs.length; i++)
    {
        gui.button(funcs[i], function () { 
            history.push(funcs[i]);
            cellular[funcs[i]](); 
        });
    }
}

function historyGUI()
{
    gui.y = 0;
    gui.x = 220;
    gui.label("history");
    for (var i = 0; i < history.length; i++)
    {
        gui.label(history[i]);
    }
}

function close()
{

}