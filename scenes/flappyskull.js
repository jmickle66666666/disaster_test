var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var skull = {};
var pipes = [];
var score = 0;
var screenshake = 0;
var ss = 0;

function init()
{
	skull = {
		x:64,y:64,
		vy:0,
		dead:false,
		respawn_time:0
	};

	// Create pipes
	pipes = [];
	for (var i=0;i<3;i++) {
		pipes.push({x:320+i*128,y:90,scored:false});
	}
}

var time = 0;

function update(dt)
{
	Draw.clear();

    time += dt;
    if (Input.getKeyDown(key.escape)) {
        scenes.goToMainMenu();
    }

	// Move the skull
	skull.vy += 500 * dt;
	skull.y += skull.vy * dt;
	// Jump
	if (!skull.dead && Input.mouseLeftDown) {
		skull.vy = -175;
	}

	// Check for OOB
	if (!skull.dead && (skull.y < -16 || skull.y > 180)) {
		skull.dead = true;
		skull.vy = -100;
		skull.respawn_time = 3.5;
		screenshake = 0.5;
		Engine.timescale = 0.5;
	}

	// Screenshake
	if (screenshake > 0) {
		screenshake -= dt;
		Draw.offset(Math.random() * screenshake * 10,Math.random() * screenshake * 10);
		if (screenshake <= 0) {
			ss = 0;
			Draw.offset(0,0);
		}
	}

	// Draw pipes and do collision checking
	for (var i=0;i<pipes.length;i++) {

		var pipe = pipes[i];

		// Check for collision with skull
		if (!skull.dead && skull.respawn_time <= 0) {
			if ((pipe.x-32 <= skull.x+6 && pipe.x+32 >= skull.x+6) || 
				(pipe.x-32 <= skull.x+28 && pipe.x+32 >= skull.x+28)) {

					// Check y collision
					if (skull.y+6 < pipe.y-36 || skull.y+24 > pipe.y + 36) {
						skull.dead = true;
						skull.vy = -100;
						skull.respawn_time = 3.5;
						screenshake = 0.5;
						Engine.timescale = 0.5;
					}
			}

			// Increase score
			if (pipe.x+32 < skull.x && !pipe.scored) {
				score++;
				pipe.scored = true;
			}
		}

		// Draw pipe
		Draw.texture(pipe.x-32,pipe.y-180,"sprites/pipe.png");

		// Move pipe
		pipe.x -= dt * 64;
		if (pipe.x < -64) {
			pipe.x += 424;
			pipe.y = Math.random() * 90 + 45;
			pipe.scored = false;
		}
	}

	// Respawn
	if (skull.respawn_time > 0) {
		skull.respawn_time -= dt;
		
		if (Engine.timescale < 1) {
			Engine.timescale += dt;
			if (Engine.timescale >= 1) {
				Engine.timescale = 1;
			}
		}
		if (skull.dead && skull.respawn_time < 1) {
			skull.dead = false;
			skull.y = 64;
			skull.vy = 0;
		}
	}

	// Draw player
	if (skull.respawn_time <= 0 || skull.respawn_time >= 1 || ((skull.respawn_time * 10) % 1) > 0.5) {
		Draw.texturePartTransformed(skull.x+16, skull.y+16, 
			{x:skull.dead ? 0 : 32,y:0,w:32,h:32},
			{originX:16, originY:16, rotation:skull.vy*0.1},
			"sprites/skull.png");
		Draw.line(skull.x,skull.y,skull.x+8,skull.y,{ r: 255, g: 0, b: 0, a: 255 });
		Draw.strokeRect(skull.x,skull.y,32,32,{ r: 255, g: 0, b: 0, a: 255 })
	}

	Draw.offset(0,0);

	gui.label("score: " + score);
	gui.label("click to jump");

}

function close()
{

}