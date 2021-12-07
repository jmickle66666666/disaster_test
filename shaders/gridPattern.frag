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
    if (mod(fragTexCoord.x + fragTexCoord.y + time * 0.3, 0.5) < 0.25) discard;
    finalColor = fragColor;
}