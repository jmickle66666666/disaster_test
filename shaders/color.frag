#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Input uniform values

// Output fragment color
out vec4 finalColor;

void main()
{
    finalColor = fragColor;
}