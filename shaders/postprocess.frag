#version 330
uniform sampler2D texture0;
uniform sampler2D depthTexture;
in vec2 fragTexCoord;
out vec4 finalColor;
uniform mat4 mvp;
uniform vec4 screenSize;
uniform float time;

float near = 0.01;
float far = 1000.0;
const int samples = 16;

// float fuckDepth(float input)
// {
//     return (1 - input) * 100.0;
// }

float linearizeDepth(float depth)
{
    float nearToFarDistance = far - near;
    return (2.0 * near) / (far + near - depth * nearToFarDistance);
    //http://www.ozone3d.net/blogs/lab/20090206/how-to-linearize-the-depth-value/ 
    //http://www.geeks3d.com/20091216/geexlab-how-to-visualize-the-depth-buffer-in-glsl/
} 

float rand3dTo1d(vec3 value, vec3 dotDir = vec3(12.9898, 78.233, 37.719)){
	//make value smaller to avoid artefacts
	vec3 smallValue = sin(value);
	//get scalar value from 3d vector
	float random = dot(smallValue, dotDir);
	//make value more random by making it bigger and then taking the factional part
	random = fract(sin(random) * 143758.5453);
	return random;
}

vec3 rand3dTo3d(vec3 value){
	return vec3(
		rand3dTo1d(value, vec3(12.989, 78.233, 37.719)),
		rand3dTo1d(value, vec3(39.346, 11.135, 83.155)),
		rand3dTo1d(value, vec3(73.156, 52.235, 09.151))
	);
}

vec3 normalAt(vec2 fragCoord)
{
    vec2 dx = vec2(1.0/screenSize.x,0.0);
    vec2 dy = vec2(0, 1.0/screenSize.y);
    float depth00 = linearizeDepth(texture2D(depthTexture, fragCoord).r);
    float depth10 = linearizeDepth(texture2D(depthTexture, fragCoord + dx).r);
    float depth01 = linearizeDepth(texture2D(depthTexture, fragCoord + dy).r);
    vec3 p1 = vec3(dx, depth10 - depth00);
    vec3 p2 = vec3(dy, depth01 - depth00);
    vec3 normal = cross(p1, p2);
    return normalize(normal);
}

float aoAt(vec2 fragCoord)
{   
    float fgx = floor(fragCoord.x * screenSize.x) / screenSize.x;
    float fgy = floor(fragCoord.y * screenSize.y) / screenSize.y;

    vec3 sample_sphere[16] = vec3[16](
        vec3( 0.5381, 0.1856,-0.4319), vec3( 0.1379, 0.2486, 0.4430),
        vec3( 0.3371, 0.5679,-0.0057), vec3(-0.6999,-0.0451,-0.0019),
        vec3( 0.0689,-0.1598,-0.8547), vec3( 0.0560, 0.0069,-0.1843),
        vec3(-0.0146, 0.1402, 0.0762), vec3( 0.0100,-0.1924,-0.0344),
        vec3(-0.3577,-0.5301,-0.4358), vec3(-0.3169, 0.1063, 0.0158),
        vec3( 0.0103,-0.5869, 0.0046), vec3(-0.0897,-0.4940, 0.3287),
        vec3( 0.7119,-0.0154,-0.0918), vec3(-0.0533, 0.0596,-0.5411),
        vec3( 0.0352,-0.0631, 0.5460), vec3(-0.4776, 0.2847,-0.0271)
    );

    vec3 random = rand3dTo3d(vec3(fgx, fgy, 1.0));
    float depth = linearizeDepth(texture2D(depthTexture, fragTexCoord).r);
    float radius = 0.002;
    float radius_depth = radius/depth;
    float occlusion = .0;
    vec3 position = vec3(fragTexCoord, depth);
    vec3 normal = normalAt(fragTexCoord);
    const float falloff = 0.0000001;
    const float area = 0.075;
    for(int i=0; i < 16; i++) {
    
        vec3 ray = radius_depth * reflect(sample_sphere[i], random);
        vec3 hemi_ray = position + sign(dot(ray,normal)) * ray;
        
        float occ_depth = linearizeDepth(texture2D(depthTexture, clamp(hemi_ray.xy,0,1)).r);
        float difference = depth - occ_depth;
        
        occlusion += step(falloff, difference) * (1.0-smoothstep(falloff, area, difference));
    }
    float ao = 1.0 - (1.0 * occlusion * (1.0 / samples));
    ao *= 2.0;
    ao += 0.2;
    ao = clamp(ao, 0, 1);
    ao = sqrt(ao);
    return ao;
}

float multiAO(vec2 fragCoord)
{
    vec2 dx = vec2(1.0/screenSize.x,0.0);
    vec2 dy = vec2(0, 1.0/screenSize.y);

    float ao = 0;
    int count = 0;
    for (int i = -1; i < 2; i++)
    {
        for (int j = -1; j < 2; j++)
        {
            count += 1;
            ao += aoAt(fragCoord + dx * i + dy * j);
        }
    }
    ao /= count;

    return ao;
}

float randomAO(vec2 fragCoord)
{
    vec2 dx = vec2(1.0/screenSize.x,0.0);
    vec2 dy = vec2(0, 1.0/screenSize.y);

    int steps = 16;
    float range = .5;
    float depth = linearizeDepth(texture2D(depthTexture, fragTexCoord).r);
    range /= depth;

    float ao = aoAt(fragCoord);
    for (int i = 0; i < steps; i++) {
        float offx = range * rand3dTo1d(vec3(fragCoord.x, fragCoord.y, i)) - range/2.0;
        float offy = range * rand3dTo1d(vec3(fragCoord.x, i, fragCoord.y)) - range/2.0;
        ao += aoAt(fragCoord + offx * dx + offy * dy);
    }
    ao /= steps + 1;

    return ao;
}
//float pi = 3.14159;
float pi = 3.14;

vec4 thing(vec2 uv)
{
    uv -= 0.5;

    vec2 puv = vec2(
        0.5 + atan(uv.y, uv.x) / (pi * 2),
        length(uv) * 1
    );


    vec4 col = vec4(0,0,0,1);
    float mult = 24;
    float offset = 10 + time;

    puv.x += puv.y/ 1;
    // return vec4(puv.x, puv.y, 0, 1);

    float stripes = smoothstep(0, 0.1, sin(offset + puv.x * pi * mult));

    col = mix(vec4(0,0,0,1), vec4(1.0, 0.72, 0, 1), stripes);

    //col.b = step(puv.y, 0.4) - step(puv.y, 0.3);
    //col.x = stripes;

    return col;
}

float noise1(float x)
{
    return fract(sin(x * 123.245) + tan(x * 459.31));
}

float noise2(vec2 x)
{
    return noise1(noise1(x.x) + noise1(x.y * 3.52623734));
}

float noiseLayer(vec2 uv, int res)
{
    
    
    vec2 iuv = floor(uv * res) / res;
    vec2 duv = (uv - iuv) * res;
    vec2 uv2 = iuv + vec2(1.01/res, 1.01/res);
    uv2 = floor(uv2 * res) / res;
    float noise00 = noise2(iuv);
    float noise10 = noise2(vec2(uv2.x, iuv.y));
    float noise01 = noise2(vec2(iuv.x, uv2.y));
    float noise11 = noise2(uv2);

    float noiseX1 = mix(noise00, noise10, duv.x);
    float noiseX2 = mix(noise01, noise11, duv.x);
    float noiseY = mix(noiseX1, noiseX2, duv.y);
    
    return noiseY;
}

float layeredNoise(vec2 uv, int quality, int steps)
{
    float output = 0;
    int power = 1;
    for (int i = 1; i <= steps; i++)
    {
        int q = quality * power;
        power *= 2;
        output += clamp(noiseLayer(uv, q) / (0.5 * power), 0, 1);
    }
    return output/2;
}

vec4 thing2(vec2 uv)
{
    float o = layeredNoise(uv, 4, 64);
    return vec4(o, o, o, 1);
}

const float[] psx_dither_table = float[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);

vec3 DitherCrunch(vec3 col, vec2 p){
    col*=255.0; //extrapolate 16bit color float to 16bit integer space
    float dither = psx_dither_table[(int(p.x) % 4) + ((int(p.y) % 4) * 4)];
    col += (dither / 2.0 - 0.0); //dithering process as described in PSYDEV SDK documentation
    
    vec3 ca = vec3(
        int(col.x) & 248,
        int(col.y) & 248,
        int(col.z) & 248
    );

    col = mix(ca, vec3(248, 248, 248), step(248.0,col)); 
    col /= 255; //bring color back to floating point number space
    return col;
}


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
    //fragTexCoord.x = floor(fragTexCoord.x / screenSize.x) * screenSize.x;
    vec2 fg = vec2(fragTexCoord.x, fragTexCoord.y);
    // fragTexCoord.x = x;
    vec4 col = texture(texture0, fg);

    // fg.x = floor(fg.x * screenSize.x) / screenSize.x;
    // fg.y = floor(fg.y * screenSize.y) / screenSize.y;
    //fragTexCoord.r *= screenSize.r;
    // col.xyz = normalAt(fragTexCoord);

    
    //float ao = multiAO(fragTexCoord);
    // float ao = aoAt(fragTexCoord);
    float ao = randomAO(fg);
    
    vec3 normal = normalAt(fg);
    float upness = clamp(-normal.y, 0, 1);
    // upness /= 2;
    // upness += .5;
    upness = 0-step(upness, 0.001);

    finalColor = (col * ao);// + upness*0.05;

    

    //finalColor = vec4(ao, ao,ao, 1.0);
    // finalColor = vec4(upness, upness,upness, 1.0);
    float d = -.1 + linearizeDepth(texture2D(depthTexture, fg).r) * 5;
    //d = 0;
    if (d > 5) {

        vec4 top = vec4(1.0, 0.6, 0.0, 1) * 0.6;
        vec4 bottom = vec4(0, 0, 0, 1);

        float stripe = (fragTexCoord.x / screenSize.y) + (fragTexCoord.y / screenSize.x);
        //stripe += time * 0.01;
        stripe *= 1000;
        stripe = mod(stripe, 1.0);
        vec4 sky = mix(top, bottom, step(stripe, 0.5));
        //vec4 sky = mix(top, bottom, fg.y);

        finalColor = sky;
        finalColor = vec4(1,0.75,0.0,1.0);
        finalColor = vec4(0,0,0,1.0);
    } else {

        if (d > 1) d = 1;
        if (d < 0) d = 0;
        finalColor -= d;
    }
    finalColor = clamp(finalColor, 0, 1);
    vec3 d2 = DitherCrunch(finalColor.rgb, fg * screenSize.xy);
    finalColor.rgb = d2;


    // finalColor = 1 - ((1-finalColor) * (1-finalColor));
    // finalColor = toCGA(finalColor);

    //finalColor = thing2(fragTexCoord);

    //finalColor = vec4(ao, ao, ao, 1);
}

