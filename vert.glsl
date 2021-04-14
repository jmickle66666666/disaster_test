#version 150

uniform mat4 projection_matrix;
uniform mat4 modelview_matrix;

in vec3 pos;
in vec3 normal;
in vec2 uv;

noperspective out vec2 fragUV;
out float dist;
noperspective out float fog;

const float SCREEN_WIDTH = 160.0;
const float SCREEN_HEIGHT = 120.0;

uniform float Fog_Start;
uniform float Fog_Distance;
uniform bool Use_Fog;

void main(void)
{
  gl_Position = projection_matrix * modelview_matrix * vec4(pos, 1);

  if(Use_Fog)
  {
    dist = gl_Position.z;
    fog = clamp(dist - Fog_Start, 0.0, Fog_Distance) / Fog_Distance;
    fog = 1 - fog;
  } else {
    fog = 0;
  }
  
  fragUV = uv;

  vec2 screenSpace = (gl_Position.xyz / gl_Position.w).xy;
  screenSpace = floor(screenSpace * vec2(SCREEN_WIDTH, SCREEN_HEIGHT)) / vec2(SCREEN_WIDTH, SCREEN_HEIGHT);
  screenSpace *= gl_Position.w;
  gl_Position.x = screenSpace.x;
  gl_Position.y = screenSpace.y;
}