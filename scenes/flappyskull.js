var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var skull = {};
var pipes = [];
var score = 0;
var screenshake = 0;
var ss = 0;

var rotTime = 0;
var rotDuration = .5;
var rotSpeed = 360;
var rotation = 0;

var skullRect = {
	x: 0, y:0, w:32, h:32
};

var skullDeadRect = {
	x: 32, y:0, w:32, h:32
};

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
	var delta = dt;
	Draw.clear();

    time += dt;
    if (Input.getKeyDown(key.escape)) {
        scenes.goToMainMenu();
    }

	// Move the skull
	skull.vy += 500 * delta;
	skull.y += skull.vy * delta;
	// Jump
	if (!skull.dead && Input.mouseLeftDown) {
		skull.vy = -175;
		rotTime = rotDuration;
	}

	rotTime -= delta;

	if (rotTime > 0) {
		rotation += rotSpeed * delta;
	} else {
		rotation = 0;
	}

	// Check for OOB
	if (!skull.dead && (skull.y < -16 || skull.y > 180)) {
		skull.dead = true;
		skull.vy = -100;
		skull.respawn_time = 3.5;
		screenshake = 0.5;
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
					}
			}

			// Increase score
			if (pipe.x+32 < skull.x && !pipe.scored) {
				score++;
				pipe.scored = true;
			}
		}

		// Draw pipe
		Draw.texture(pipe.x-32+ss,pipe.y-180+ss,"sprites/pipe.png");

		// Move pipe
		pipe.x -= delta * 64;
		if (pipe.x < -64) {
			pipe.x += 424;
			pipe.y = Math.random() * 90 + 45;
			pipe.scored = false;
		}
	}

	// Screenshake
	if (screenshake > 0) {
		screenshake -= delta;
		ss = Math.random() * screenshake * 10;
		if (screenshake <= 0) {
			ss = 0;
		}
	}

	// Respawn
	if (skull.respawn_time > 0) {
		skull.respawn_time -= delta;
		if (skull.dead && skull.respawn_time < 1) {
			skull.dead = false;
			skull.y = 64;
			skull.vy = 0;
		}
	}


	gui.label("score: " + score);
	gui.label("click to jump");
	// Draw player
	if (skull.respawn_time <= 0 || skull.respawn_time >= 1 || ((skull.respawn_time * 10) % 1) > 0.5) {
		Draw.texturePartTransformed(
			skull.x+ss, 
			skull.y+ss, 
			skull.dead ? skullRect : skullDeadRect,
			{ originX : 16, originY : 16, rotation: rotation}, 
			"sprites/skull.png"
		);
	}

}

function close()
{

}