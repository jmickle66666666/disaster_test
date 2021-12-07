#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Input uniform values
uniform float time;

// Output fragment color
out vec4 finalColor;

void main()
{
    
    finalColor = vec4(0,0,0,1);
    if (mod((fragTexCoord.x*8) + fragTexCoord.y + time * 0.3, 0.5) < 0.25) finalColor = vec4(1.0,0.8,0,1);
    if (fragTexCoord.y < 0.1 || fragTexCoord.y > 0.4) finalColor = vec4(0,0,0,1);
}