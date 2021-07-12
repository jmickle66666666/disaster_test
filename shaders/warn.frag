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
    float v = step(fract(time + (fragTexCoord.x + fragTexCoord.y) * 2), 0.5);
    vec4 texelColor = vec4(v, v * 0.7, 0, 1);
    finalColor = texelColor;
}