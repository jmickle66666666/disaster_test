#version 150

uniform vec3 color;
uniform sampler2D texture;

uniform vec3 Fog_Color;

uniform bool Use_Fog;

noperspective in vec2 fragUV;
in float dist;
noperspective in float fog;

vec4 PSXDither(vec4 InColor, vec2 PixelPos)
{
  vec4 Local2 = InColor;
  float  Local4 = (Local2.rgba.rgb.r * 0.21259999);
	float  Local5 = (Local2.rgba.rgb.g * 0.71520001);
	float  Local6 = (Local4 + Local5);
	float  Local7 = (Local2.rgba.rgb.b * 0.07220000);
	float  Local8 = (Local6 + Local7);
	float  Local9 = (Local2.rgba.rgb.b - Local8);
	float  Local10 = (Local9 / 1.85560000);
	float  Local11 = (Local10 + 0.50000000);
	float  Local12 = (Local2.rgba.rgb.r - Local8);
	float  Local13 = (Local12 / 1.57480001);
	float  Local14 = (Local13 + 0.50000000);
	vec3  Local15 = ( vec3 ( vec2 (Local8,Local11),Local14) * 255.00000000);
	vec2  Local16 = PixelPos;
	vec2  Local17 = mod(Local16, vec2 (4.00000000,4.00000000));
	vec4  Local18 = ((abs(Local17.g - 2.00000000) > 0.50000000) ? (Local17.g >= 2.00000000 ?  vec4 (15.00000000,7.00000000,13.00000000,5.00000000) :  vec4 (15.00000000,7.00000000,13.00000000,5.00000000)) :  vec4 (3.00000000,11.00000000,1.00000000,9.00000000));
	vec4  Local19 = ((abs(Local17.g - 1.00000000) > 0.50000000) ? (Local17.g >= 1.00000000 ? Local18 : Local18) :  vec4 (12.00000000,4.00000000,14.00000000,6.00000000));
	vec4  Local20 = ((abs(Local17.g - 0.00000000) > 0.50000000) ? (Local17.g >= 0.00000000 ? Local19 : Local19) :  vec4 (0.00000000,8.00000000,2.00000000,10.00000000));
	float  Local21 = ((abs(Local17.r - 2.00000000) > 0.50000000) ? (Local17.r >= 2.00000000 ? Local20.a : Local20.a) : Local20.b);
	float  Local22 = ((abs(Local17.r - 1.00000000) > 0.50000000) ? (Local17.r >= 1.00000000 ? Local21 : Local21) : Local20.g);
	float  Local23 = ((abs(Local17.r - 0.00000000) > 0.50000000) ? (Local17.r >= 0.00000000 ? Local22 : Local22) : Local20.r);
	float  Local24 = (Local23 / 2.00000000);
	float  Local25 = (Local24 - 4.00000000);
	vec3  Local26 = (Local15 + Local25);
	vec3  Local27 = (Local26 / 255.00000000);
	vec3  Local28 = (Local27 * 32.00000000);
	vec3  Local29 = round(Local28);
	vec3  Local30 = (Local29 / 32.00000000);
	float  Local31 = (Local30.b - 0.50000000);
	float  Local32 = (Local31 * 1.57480001);
	float  Local33 = (Local32 + Local30.r);
	float  Local34 = (Local30.g - 0.50000000);
	float  Local35 = (Local34 * -0.18732400);
	float  Local36 = (Local35 + Local30.r);
	float  Local37 = (Local31 * -0.46812400);
	float  Local38 = (Local36 + Local37);
	float  Local39 = (Local34 * 1.85560000);
	float  Local40 = (Local39 + Local30.r);
	vec3  Local42 = (vec3 ( Local33,Local38,Local40) * 32.00000000);
	vec3  Local43 = round(Local42);
	vec3  Local44 = (Local43 / 32.00000000);
  return vec4(Local44,1.0);
}

void main(void)
{
  gl_FragColor = texture2D(texture, fragUV);
  if(Use_Fog)
  {
    gl_FragColor = (gl_FragColor * fog) + ((1-fog) * vec4(Fog_Color, 1.0));
    // LUNA: Dither still works on full fog, we dont want that!
    gl_FragColor = mix(PSXDither(gl_FragColor, gl_FragCoord.xy), vec4(Fog_Color, 1.0), floor(1-fog));
  }
  else
  {
    gl_FragColor = PSXDither(gl_FragColor, gl_FragCoord.xy);
  }
}