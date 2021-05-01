var gui = load("gui.js");

var tilesetPath = "tyrian/sprites/tiles.png";
var tileset = [
    0, 1, 2, 3, 4, 5,
    8, 9, 10, 11, 12,
    16, 17, 18, 19, 20,
    5, 6, 7,
    13, 14, 15,
    21, 22, 23,

    28, 29, 30, 31,
    36, 37, 38, 39
];
var count = 10;
var tileNeighbors = {};
var tiles = [];
var tileWidth = 12;
var tileHeight = 30;
var tileSpeed = 2;

// var tilesOnScreenX = 320 / 24;
// var tilesOnScreenY = 240 / 24;
var tileRectX = 240;
var tileRectY = 240;

var xOffset = 0;

function choice(array)
{
    return array[Math.floor(Math.random() * array.length)];
}

function init() {
    
    tileNeighbors[0] = { r: [ 0, 2, 10, 18, 5, 13, 21 ], u: [ 0, 18, 19, 20, 21, 22, 23 ] };
    tileNeighbors[1] = { r: [ 1, 9, 12, 17 ], u: [ 1, 3, 8, 9 ] };

    tileNeighbors[2] = { r: [ 3, 4, 8, 36 ], u: tileNeighbors[0].u };
    tileNeighbors[3] = { r: tileNeighbors[2].r, u: tileNeighbors[0].u };
    tileNeighbors[4] = { r: tileNeighbors[0].r, u: tileNeighbors[0].u };
    
    tileNeighbors[8] = { r: tileNeighbors[1].r, u: [ 2, 10, 16, 37 ] };
    tileNeighbors[9] = { r: tileNeighbors[2].r, u: [ 4, 12, 17, 36 ] };

    tileNeighbors[10] = { r: tileNeighbors[1].r, u: tileNeighbors[8].u };
    tileNeighbors[11] = { r: tileNeighbors[1].r, u: tileNeighbors[1].u };
    tileNeighbors[12] = { r: tileNeighbors[0].r, u: tileNeighbors[9].u };
    
    tileNeighbors[16] = { r: tileNeighbors[1].r, u: tileNeighbors[1].u };
    tileNeighbors[17] = { r: [ 16, 19, 20, 28 ], u: tileNeighbors[1].u };

    tileNeighbors[18] = { r: tileNeighbors[17].r, u: tileNeighbors[8].u };
    tileNeighbors[19] = { r: tileNeighbors[17].r, u: tileNeighbors[1].u };
    tileNeighbors[20] = { r: tileNeighbors[0].r, u: tileNeighbors[9].u };

    // grass tiles
    tileNeighbors[14] = { r: [14, 8, 30, 38], u:[14, 6, 38, 39] };

    tileNeighbors[5] = { r:[6, 7, 39, 29], u: tileNeighbors[0].u };
    tileNeighbors[6] = { r: tileNeighbors[5].r, u: tileNeighbors[0].u };
    tileNeighbors[7] = { r: tileNeighbors[0].r, u: tileNeighbors[0].u };

    tileNeighbors[13] = { r: tileNeighbors[14].r, u: [5, 13, 31, 28] };
    tileNeighbors[15] = { r: tileNeighbors[0].r, u: [7, 15, 30, 29] };

    tileNeighbors[21] = { r: [22, 23, 31, 37], u: tileNeighbors[13].u };
    tileNeighbors[22] = { r: tileNeighbors[21].r, u: tileNeighbors[14].u };
    tileNeighbors[23] = { r: tileNeighbors[0].r, u: tileNeighbors[15].u };

    tileNeighbors[30] = { r: tileNeighbors[21].r, u: tileNeighbors[14].u};
    tileNeighbors[31] = { r: tileNeighbors[14].r, u: tileNeighbors[14].u};
    tileNeighbors[38] = { r: tileNeighbors[5].r, u: tileNeighbors[15].u};
    tileNeighbors[39] = { r: tileNeighbors[14].r, u: tileNeighbors[13].u};

    // multi
    tileNeighbors[28] = { r: tileNeighbors[5].r, u: tileNeighbors[9].u};
    tileNeighbors[29] = { r: tileNeighbors[17].r, u: tileNeighbors[8].u};
    tileNeighbors[36] = { r: tileNeighbors[21].r, u: tileNeighbors[13].u};
    tileNeighbors[37] = { r: tileNeighbors[2].r, u: tileNeighbors[15].u};

    tileNeighbors[63] = {r:tileset, u:tileset};


    for (var i = 0; i < tileWidth; i++)
    {
        var curRow = [];
        for (var j = 0; j < tileHeight; j++)
        {
            curRow.push(-1);
        }
        tiles.push(curRow);
    }

    tileHeight = 0;

    addTiles(16);
}

function addTiles(rows)
{
    var currentHeight = tileHeight;
    for (var i = 0; i < tileWidth; i++)
    {
        var curRow = [];
        for (var j = 0; j < rows; j++)
        {
            curRow.push(-1);
        }
        tiles.push(curRow);
    }

    tileHeight += rows;

    for (var j = currentHeight; j < tileHeight; j++)
    {
        for (var i = 0; i < tileWidth; i++)
        {
            if (i == 0 && j == 0) {
                tiles[i][j] = choice([0, 1]);
            } else {
            
                var possibilities = tileset;

                if (i != 0) {
                    // Console.log(this.tiles[i - 1][j]);/
                    var options = tileNeighbors[tiles[i - 1][j]].r;
                    var newPoss = [];
                    for (var o in options) {
                        if (possibilities.indexOf(options[o]) != -1) {
                            newPoss.push(options[o]);
                        }
                    }
                    possibilities = newPoss;
                }

                if (j != 0) {
                    var options = tileNeighbors[tiles[i][j - 1]].u;
                    var newPoss = [];
                    for (var o in options) {
                        if (possibilities.indexOf(options[o]) != -1) {
                            newPoss.push(options[o]);
                        }
                    }
                    possibilities = newPoss;
                }

                // influence tile probabilities here

                // increase chance of water, ground and grass
                if (possibilities.indexOf(0) != -1) {
                    possibilities.push(0,0,0,0,0);
                }
                if (possibilities.indexOf(1) != -1) {
                    possibilities.push(1,1,1,1,1);
                }
                if (possibilities.indexOf(14) != -1) {
                    possibilities.push(14,14,14,14,14);
                }

                if (possibilities.length > 0) {
                    tiles[i][j] = choice(possibilities);
                } else {
                    log("no possibilities");
                    tiles[i][j] = 63;
                }

            }
        }
    }
}

function draw(time) {
    var tStart = Math.floor(time * tileSpeed);
    var tEnd = tStart + (tileRectY / 24) + 1;

    var tileW = Math.min((tileRectX-xOffset) / 24, tileWidth);
    

    if (tEnd >= tileHeight) {
        addTiles(16);
    }

    for (var i = 0; i < tileW; i++)
    {
        for (var j = tStart; j < tEnd; j++)
        {
            var tileCoords = {
                x: (tiles[i][j] % 8) * 24,
                y: Math.floor(tiles[i][j] / 8) * 24
            };
            
            Draw.texturePart(
                Math.floor(xOffset) + i * 24, 
                216 - Math.round(-time*24 * tileSpeed + (j * 24)), 
                {x: tileCoords.x, y: tileCoords.y, 
                w: 24, h: 24 },
                tilesetPath
            );
        }
    }

    //gui.label(tStart + " " + tEnd + " " + tileHeight);
}