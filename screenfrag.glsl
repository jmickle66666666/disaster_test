
uniform sampler2D texture;
uniform float ditherStrength;
in vec2 fuv;

void main(void)
{

    vec4 col = texture2D(texture, fuv);
    if (col.a < 0.5) {
        discard;
    }

    gl_FragColor = col;
}