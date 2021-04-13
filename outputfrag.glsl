uniform sampler2D texture;
in vec2 fuv;

void main(void)
{
    vec4 col = texture2D(texture, fuv);
    //col.r = 0;
    gl_FragColor = col;
}