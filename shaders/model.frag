#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Input uniform values
uniform sampler2D texture0;
uniform vec4 colDiffuse;

// Output fragment color
out vec4 finalColor;

// NOTE: Add here your custom variables

void main()
{
    // Texel color fetching from texture sampler
    vec4 texelColor = texture(texture0, fragTexCoord);
    if (texelColor.a == 0.0) discard;
    texelColor.a = 1;
    //texelColor.r = 0;
    // NOTE: Implement here your fragment shader code
    
    //fragColor.a = 1.0;
    //finalColor+= fragColor;;
    finalColor = texelColor*colDiffuse * fragColor;

    //finalColor = vec4(1.0, 1.0, 0.0, 1.0);
}