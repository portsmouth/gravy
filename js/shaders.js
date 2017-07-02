var Shaders = {

'comp-fragment-shader': `#version 300 es
precision highp float;

uniform sampler2D Fluence;
uniform float invNumRays;
uniform float exposure;
uniform float invGamma;

in vec2 vTexCoord;
out vec4 outputColor;

void main() 
{
	vec3 fluence = texture(Fluence, vTexCoord).rgb;
	vec3 phi = float(invNumRays) * fluence; // normalized fluence

	// Apply exposure 
	float gain = pow(2.0, exposure);
	float r = gain*phi.x; 
	float g = gain*phi.y; 
	float b = gain*phi.z;
	
	// Reinhard tonemap
	vec3 C = vec3(r/(1.0+r), g/(1.0+g), b/(1.0+b));

	// Apply gamma
	C = pow(C, vec3(invGamma));

	outputColor = vec4(C, 1.0);
}
`,

'comp-vertex-shader': `#version 300 es
precision highp float;

in vec3 Position;
in vec2 TexCoord;
out vec2 vTexCoord;

void main(void)
{
	gl_Position = vec4(Position, 1.0);
	vTexCoord = TexCoord;
}
`,

'init-fragment-shader': `#version 300 es
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
	
	gbuf_pos = vec4(pos, 1.0);
	gbuf_dir = vec4(dir, 1.0);
	gbuf_rnd = seed;
	gbuf_rgb = vec4(1.0, 1.0, 1.0, 1.0);
}
`,

'init-vertex-shader': `#version 300 es
precision highp float;

in vec3 Position;
in vec2 TexCoord;
out vec2 vTexCoord;

void main() 
{
	gl_Position = vec4(Position, 1.0);
	vTexCoord = TexCoord;
}
`,

'line-fragment-shader': `#version 300 es
precision highp float;

in vec3 vColor;
out vec4 outputColor;

void main() 
{
	outputColor = vec4(vColor, 1.0);
}
`,

'line-vertex-shader': `#version 300 es
precision highp float;

uniform sampler2D PosDataA;
uniform sampler2D PosDataB;
uniform sampler2D RgbData;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

in vec3 TexCoord;
out vec3 vColor;

void main()
{
	// Textures A and B contain line segment start and end points respectively
	// (i.e. the geometry defined by this vertex shader is stored in textures)
	vec4 posA = texture(PosDataA, TexCoord.xy);
	vec4 posB = texture(PosDataB, TexCoord.xy);

	// Line segment vertex position (either posA or posB)
	vec3 pos = mix(posA.xyz, posB.xyz, TexCoord.z);

	gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(pos, 1.0);
	vColor = texture(RgbData, TexCoord.xy).rgb;
}
`,

'pass-fragment-shader': `#version 300 es
precision highp float;

uniform sampler2D WaveBuffer;

in vec2 vTexCoord;
out vec4 outputColor;

void main() 
{
	outputColor = vec4(texture(WaveBuffer, vTexCoord).rgba);
}
`,

'pass-vertex-shader': `#version 300 es
precision highp float;

in vec3 Position;
in vec2 TexCoord;
out vec2 vTexCoord;

void main(void)
{
	gl_Position = vec4(Position, 1.0);
	vTexCoord = TexCoord;
}
`,

'tonemapper-fragment-shader': `#version 300 es
precision highp float;

uniform sampler2D Radiance;
uniform float exposure;
uniform float invGamma;

varying vec2 vTexCoord;

out vec4 outputColor;

void main()
{
	vec3 L = exposure * texture(Radiance, vTexCoord).rgb;
	float r = L.x; 
	float g = L.y; 
	float b = L.z;
	vec3 Lp = vec3(r/(1.0+r), g/(1.0+g), b/(1.0+b));
	vec3 S = pow(Lp, vec3(invGamma));
	
	outputColor = vec4(S, 1.0);
}
`,

'tonemapper-vertex-shader': `#version 300 es
precision highp float;

in vec3 Position;
in vec2 TexCoord;
out vec2 vTexCoord;

void main() 
{
	gl_Position = vec4(Position, 1.0);
	vTexCoord = TexCoord;
}
`,

'trace-fragment-shader': `#version 300 es
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
`,

'trace-vertex-shader': `#version 300 es
precision highp float;

in vec3 Position;
in vec2 TexCoord;

out vec2 vTexCoord;

void main() 
{
	gl_Position = vec4(Position, 1.0);
	vTexCoord = TexCoord;
}
`,

}