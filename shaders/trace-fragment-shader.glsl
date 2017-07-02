precision highp float;

uniform sampler2D PosData;
uniform sampler2D DirData;
uniform sampler2D RngData;
uniform sampler2D RgbData;

uniform float lengthScale;
uniform float stepDistance;

layout(location = 0) out vec4 gbuf_pos;
layout(location = 1) out vec4 gbuf_dir;
layout(location = 2) out vec4 gbuf_rnd;
layout(location = 3) out vec4 gbuf_rgb;

in vec2 vTexCoord;


//////////////////////////////////////////////////////////////
// Dynamically injected code
//////////////////////////////////////////////////////////////

POTENTIAL_FUNC


//////////////////////////////////////////////////////////////
// Raytracing in a weak gravitational field
//////////////////////////////////////////////////////////////

vec3 potential_gradient(in vec3 X)
{
    // Compute normal as gradient of SDF
    float epsilon = 1.0e-4*lengthScale;
    vec3 e = vec3(epsilon, 0.0, 0.0);
    vec3 xyyp = X+e.xyy; vec3 xyyn = X-e.xyy;
    vec3 yxyp = X+e.yxy; vec3 yxyn = X-e.yxy;
    vec3 yyxp = X+e.yyx; vec3 yyxn = X-e.yyx;
  	return vec3(POTENTIAL(xyyp) - POTENTIAL(xyyn), 
  		        POTENTIAL(yxyp) - POTENTIAL(yxyn), 
  		        POTENTIAL(yyxp) - POTENTIAL(yyxn)) / epsilon;
}


// propagate each photon beam further along its geodesic by some step distance

void propagate(inout vec3 X, inout vec3 D)
{
	// deflect direction according to lens equation, given current X and D
	vec3 grad = potential_gradient(X);
	vec3 grad_project = grad - D*dot(grad, D);
	D += -2.0*stepDistance*grad_project;
	D = normalize(D);
    X += stepDistance*D;
}


void main()
{
	vec3 X         = texture(PosData, vTexCoord).xyz;
	vec3 D         = texture(DirData, vTexCoord).xyz;
	vec4 rnd       = texture(RngData, vTexCoord); // not needed (yet?)
	vec4 rgbw      = texture(RgbData, vTexCoord); // not needed (yet?)
 	
	propagate(X, D);

	gbuf_pos = vec4(X, 1.0);
	gbuf_dir = vec4(D, 1.0);
	gbuf_rnd = rnd;
	gbuf_rgb = rgbw;
}


