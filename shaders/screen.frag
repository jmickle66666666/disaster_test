#version 330
uniform sampler2D texture0;
in vec2 fragTexCoord;
out vec4 finalColor;

const vec4 egaPalette[16] = vec4[16](
    vec4(0.0, 0.0, 0.0, 256.0),
    vec4(0.0, 0.0, 170.0, 256.0),
    vec4(0.0, 170.0, 0.0, 256.0),
    vec4(0.0, 170.0, 170.0, 256.0),
    vec4(170.0, 0.0, 0.0, 256.0),
    vec4(170.0, 0.0, 170.0, 256.0),
    vec4(170.0, 85.0, 0.0, 256.0),
    vec4(170.0, 170.0, 170.0, 256.0),
    vec4(85.0, 85.0, 85.0, 256.0),
    vec4(85.0, 85.0, 255.0, 256.0),
    vec4(85.0, 255.0, 85.0, 256.0),
    vec4(85.0, 255.0, 255.0, 256.0),
    vec4(255.0, 85.0, 85.0, 256.0),
    vec4(255.0, 85.0, 255.0, 256.0),
    vec4(255.0, 255.0, 85.0, 256.0),
    vec4(255.0, 255.0, 255.0, 256.0)
);

vec4 toEGA(vec4 color)
{
    int distIndex = 0;
    float closestDistance = distance(color*256, egaPalette[0]);
    for (int i = 1; i < 16; i++)
    {
        float dist = distance(color*256, egaPalette[i]);
        if (dist < closestDistance) {
            closestDistance = dist;
            distIndex = i;
        }
    }
    return egaPalette[distIndex] / 256;
}

const vec4 cgaPalette[4] = vec4[4](
    vec4(0.0, 0.0, 0.0, 256.0),
    vec4(85.0, 255.0, 255.0, 256.0),
    vec4(255.0, 85.0, 255.0, 256.0),
    vec4(255.0, 255.0, 255.0, 256.0)
);

vec4 toCGA(vec4 color)
{
    int distIndex = 0;
    float closestDistance = distance(color*256, cgaPalette[0]);
    for (int i = 1; i < 4; i++)
    {
        float dist = distance(color*256, cgaPalette[i]);
        if (dist < closestDistance) {
            closestDistance = dist;
            distIndex = i;
        }
    }
    return cgaPalette[distIndex] / 256;
}


void main()
{
    
    
    vec4 col = texture2D(texture0, fragTexCoord);

    finalColor = col;
    // finalColor = 1 - ((1-finalColor) * (1-finalColor));
    // finalColor.rgb = toCGA(finalColor).rgb;
    

    // finalColor = texture2D(texture0, fragTexCoord);
    // finalColor.r = 0;
    // finalColor = egaPalette[1];


    //finalColor = floor(finalColor * 4) / 4;
}