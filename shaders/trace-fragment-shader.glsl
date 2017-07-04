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

void propagate(inout vec4 X4, inout vec3 D)
{
	// deflect direction according to lens equation, given current X and D
	vec3 grad = potential_gradient(X4.xyz);

	// components of gradient orthogonal to ray direction
	vec3 grad_project = grad - D*dot(grad, D);
	
	// bend ray according to lens equation
	D += -2.0*stepDistance*grad_project; // (the famous Einstein factor of two..)
	D = normalize(D);

    // Increment proper time (measured in distance units) along ray, according to:
    X4.w += stepDistance;            // euclidean term
    X4.w += -2.0*POTENTIAL(X4.xyz);  // Shapiro delay

    // advance ray in new direction
    X4.xyz += stepDistance*D;
}      


void main()
{
	vec4 X4        = texture(PosData, vTexCoord);
	vec3 D         = texture(DirData, vTexCoord).xyz;
	vec4 rnd       = texture(RngData, vTexCoord);
	//vec4 rgbw    = texture(RgbData, vTexCoord);
 	
	propagate(X4, D);

	gbuf_pos = X4;
	gbuf_dir = vec4(D, 1.0);
	gbuf_rnd = rnd;
	gbuf_rgb = vec4(1.0);
}


