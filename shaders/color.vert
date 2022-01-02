#version 330

// Input vertex attributes
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

// Input uniform values
uniform mat4 mvp;

// Output vertex attributes (to fragment shader)
out vec4 fragColor;

// NOTE: Add here your custom variables 

void main()
{
    // Send vertex attributes to fragment shader
    fragColor = vertexColor;
    
    // Calculate final vertex position
    gl_Position = mvp*vec4(vertexPosition, 1.0);

    //fragColor -= (gl_Position.z * gl_Position.z * gl_Position.z ) / 5000;
}