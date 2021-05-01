var enemies = load("tyrian/enemies.js");

/*
movement types:
down - just go straight down
sine - ignore x position; does a sine wave down the screen
*/

var list = {
    basic : enemies.newEnemyType(
        24, 24, 25, 
        "target",
        { x: 48, y: 0, w: 32, h: 32 },
        { x: 48, y: 32, w: 32, h: 32 }
    ),
    snake_head : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        { x: 80, y: 48, w: 16, h: 16 },
        { x: 80, y: 96, w: 16, h: 16 }
    ),
    snake_body : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        { x: 80, y: 32, w: 16, h: 16 },
        { x: 80, y: 80, w: 16, h: 16 }
    ),
    snake_tail : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        { x: 80, y: 16, w: 16, h: 16 },
        { x: 80, y: 64, w: 16, h: 16 }
    ),
};