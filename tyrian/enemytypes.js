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
        "basic"
    ),
    snake_head : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        "snake_head"
    ),
    snake_body : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        "snake_body"
    ),
    snake_tail : enemies.newEnemyType(
        14, 14, 8, 
        "none",
        "snake_tail"
    ),
};