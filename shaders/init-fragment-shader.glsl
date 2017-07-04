precision highp float;

uniform sampler2D RngData;

uniform vec3 SourcePos;
uniform vec3 SourceDir;
uniform float SourceRadius;
uniform float SourceBeamAngle; // in degrees

layout(location = 0) out vec4 gbuf_pos;
layout(location = 1) out vec4 gbuf_dir;
layout(location = 2) out vec4 gbuf_rnd;
layout(location = 3) out vec4 gbuf_rgb;

in vec2 vTexCoord;

#define M_PI 3.1415926535897932384626433832795

/// GLSL floating point pseudorandom number generator, from
/// "Implementing a Photorealistic Rendering System using GLSL", Toshiya Hachisuka
/// http://arxiv.org/pdf/1505.06022.pdf
float rand(inout vec4 rnd) 
{
    const vec4 q = vec4(   1225.0,    1585.0,    2457.0,    2098.0);
    const vec4 r = vec4(   1112.0,     367.0,      92.0,     265.0);
    const vec4 a = vec4(   3423.0,    2646.0,    1707.0,    1999.0);
    const vec4 m = vec4(4194287.0, 4194277.0, 4194191.0, 4194167.0);
    vec4 beta = floor(rnd/q);
    vec4 p = a*(rnd - beta*q) - beta*r;
    beta = (1.0 - sign(p))*0.5*m;
    rnd = p + beta;
    return fract(dot(rnd/m, vec4(1.0, -1.0, 1.0, -1.0)));
}

void main()
{
	vec4 seed = texture(RngData, vTexCoord);

	float rPos   = SourceRadius*sqrt(rand(seed));
	float phiPos = 2.0*M_PI*rand(seed);
	vec3 X = vec3(1.0, 0.0, 0.0);
	vec3 Z = vec3(0.0, 0.0, 1.0);
	vec3 u = cross(Z, SourceDir);
	if ( length(u) < 1.0e-3 )
	{
		u = cross(X, SourceDir);
	}
	u = normalize(u);
	vec3 v = cross(SourceDir, u);
	vec3 pos = SourcePos + rPos*(u*cos(phiPos) + v*sin(phiPos)); 

	// Emit in a cone with the given spread
	float spreadAngle = 0.5*abs(SourceBeamAngle)*M_PI/180.0;
	float rDir = min(tan(spreadAngle), 1.0e6) * sqrt(rand(seed));
	float phiDir = 2.0*M_PI*rand(seed);
	vec3 dir = normalize(SourceDir + rDir*(u*cos(phiDir) + v*sin(phiDir)));
	
	gbuf_pos = vec4(pos, 0.0); // time initialized to zero at source
	gbuf_dir = vec4(dir, 1.0);
	gbuf_rnd = seed;
	gbuf_rgb = vec4(1.0, 1.0, 1.0, 1.0);
}
