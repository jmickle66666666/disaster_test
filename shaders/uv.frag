#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Input uniform values
uniform sampler2D texture0;
uniform sampler2D cooltex;
uniform vec4 colDiffuse;

uniform float time;
uniform float warp;

// Output fragment color
out vec4 finalColor;

// NOTE: Add here your custom variables

void main()
{
    // Texel color fetching from texture sampler
    
    vec4 texelColor = texture(texture0, fragTexCoord + vec2(time * warp, 0)) + texture(cooltex, fragTexCoord);
    //texelColor.r = 0;
    // NOTE: Implement here your fragment shader code
    
    //finalColor = texelColor*colDiffuse;

    // float t = 0.5 + sin(time * 1) * 0.5;
    // finalColor = vec4(t, t, t, 1.0);
    //vec4 color = vec4(1.0, 0.5 + sin(time * 20) * 0.5, 0.5 + sin(time * 20) * 0.5, 1.0) * texelColor;
    finalColor = (texelColor * fragColor);
    finalColor = vec4(fragTexCoord.x, fragTexCoord.y, 0, 1);
    //finalColor.a = 1.0;
    //finalColor = color;
}