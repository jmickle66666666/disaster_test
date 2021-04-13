var gui = load("gui.js");

var tileset = [
    0, 1, 2, 3, 4, 5,
    8, 9, 10, 11, 12,
    16, 17, 18, 19, 20
];
var count = 10;
var tileNeighbors = {};
var tiles = [];
var tileWidth = 14;
var tileHeight = 50;
var tileSpeed = 2;

var tilesOnScreenX = 320 / 24;
var tilesOnScreenY = 240 / 24;

function choice(array)
{
    return array[Math.floor(Math.random() * array.length)];
}

function init() {
    tileNeighbors[0] = { r: [ 0, 2, 10, 18, ], u: [ 0, 18, 19, 20, ] };
    tileNeighbors[1] = { r: [ 1, 9, 11, 12, 17 ], u: [ 1, 3, 8, 9, 11 ] };
    tileNeighbors[2] = { r: [ 3, 4, 8, ], u: tileNeighbors[0].u };
    tileNeighbors[3] = { r: tileNeighbors[2].r, u: tileNeighbors[0].u };
    tileNeighbors[4] = { r: tileNeighbors[0].r, u: tileNeighbors[0].u };
    
    tileNeighbors[8] = { r: tileNeighbors[1].r, u: [ 2, 10, 16, ] };
    tileNeighbors[9] = { r: tileNeighbors[2].r, u: [ 4, 12, 17, ] };
    tileNeighbors[10] = { r: tileNeighbors[1].r, u: tileNeighbors[8].u };
    tileNeighbors[11] = { r: tileNeighbors[1].r, u: tileNeighbors[1].u };
    tileNeighbors[12] = { r: tileNeighbors[0].r, u: tileNeighbors[9].u };
    
    tileNeighbors[16] = { r: tileNeighbors[1].r, u: tileNeighbors[1].u };
    tileNeighbors[17] = { r: [ 16, 19, 20, ], u: tileNeighbors[1].u };
    tileNeighbors[18] = { r: tileNeighbors[17].r, u: tileNeighbors[8].u };
    tileNeighbors[19] = { r: tileNeighbors[17].r, u: tileNeighbors[1].u };
    tileNeighbors[20] = { r: tileNeighbors[0].r, u: tileNeighbors[9].u };

    for (var i = 0; i < tileWidth; i++)
    {
        var curRow = [];
        for (var j = 0; j < tileHeight; j++)
        {
            curRow.push(-1);
        }
        tiles.push(curRow);
    }

    for (var j = 0; j < tileHeight; j++)
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

                if (possibilities.length > 0) {
                    tiles[i][j] = choice(possibilities);
                } else {
                    Console.log("no possibilities");
                    tiles[i][j] = 0;
                }

            }
        }
    }
}


function draw(time) {
    var tStart = Math.floor(time * tileSpeed);
    var tEnd = Math.min(tileHeight + tStart - 14, tileHeight)
    for (var i = 0; i < tileWidth; i++)
    {
        for (var j = tStart; j < tStart + tilesOnScreenY + 1; j++)
        {
            var tileCoords = {
                x: (tiles[i][j] % 8) * 24,
                y: Math.floor(tiles[i][j] / 8) * 24
            };
            
            // tileCoords.y = (192-24) - tileCoords.y;
            Draw.texturePart(
                i * 24, 
                216 - Math.round(-time*24 * tileSpeed + (j * 24)), 
                {x: tileCoords.x, y: tileCoords.y, 
                w: 24, h: 24 },
                "sprites/tiles.png"
            );

            // Draw.texturePart(shipX, shipY, shipRect.x, shipRect.y + frame, shipRect.w, shipRect.h, "sprites/sprites.png");
        }
    }
}