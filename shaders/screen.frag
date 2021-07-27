#version 330
uniform sampler2D texture0;
in vec2 fragTexCoord;
out vec4 finalColor;

void main()
{
    vec4 col = texture2D(texture0, fragTexCoord);
    
    if (col.a < 0.5) {
        discard;
    }

    //col.r = 0;

    finalColor = col;
}