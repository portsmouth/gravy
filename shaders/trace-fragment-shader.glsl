precision highp float;

uniform sampler2D PosData;
uniform sampler2D DirData;
uniform sampler2D RngData;
uniform sampler2D RgbData;

uniform float SceneScale;

layout(location = 0) out vec4 gbuf_pos;
layout(location = 1) out vec4 gbuf_dir;
layout(location = 2) out vec4 gbuf_rnd;
layout(location = 3) out vec4 gbuf_rgb;

varying vec2 vTexCoord;


//////////////////////////////////////////////////////////////
// Dynamically injected code
//////////////////////////////////////////////////////////////

POTENTIAL_FUNC


//////////////////////////////////////////////////////////////
// Raytracing in a weak gravitational field
//////////////////////////////////////////////////////////////

// propagate each photon beam further along its geodesic by some step distance

void propagate(inout vec3 X, inout vec3 D)
{
	// deflect direction according to lens equation, given current X and D
	float phi = POTENTIAL(X);
	
	vec3 Dprime = D; // @todo: use potential
	float marchStep = 1.0e-5*SceneScale;

    X += marchStep*D;
    D = Dprime;
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


