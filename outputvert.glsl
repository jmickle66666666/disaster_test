#version 130
in vec3 pos;
in vec2 uv;
out vec2 fuv;

void main(void)
{
    fuv = uv;
    // fuv.y = 1.0 - fuv.y;
    gl_Position = vec4(pos,1);
}