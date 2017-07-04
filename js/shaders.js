var Shaders = {

'comp-fragment-shader': `#version 300 es
precision highp float;

uniform sampler2D Fluence;
uniform float invNumRays;
uniform float exposure;
uniform float invGamma;

uniform float timeScale; 
uniform float timePhase;
uniform vec3 colorA;
uniform vec3 colorB;

in vec2 vTexCoord;
out vec4 outputColor;

#define M_PI 3.1415926535897932384626433832795


vec3 timeDelayToEmissionColor(float time)
{
	float phase = -2.0*M_PI*time/timeScale + timePhase;
	float S = sin(phase);
	float C = cos(phase);
	return colorA*S*S + colorB*C*C;
}

void main() 
{
	// Read normalized fluence and time delay (integrated along primary rays)
	vec4 image = float(invNumRays) * texture(Fluence, vTexCoord);

	vec3 fluence = image.rgb;

	// @todo: need to compute the average of only the ray *times*
	//        which cross the pixel. (Not normalized to the global count).
	//        Probably need a buffer which blends in 1 per ray pixel.
	float time = image.w / fluence.r;

	// Apply coloring to indicate time delay
	vec3 emission = fluence * timeDelayToEmissionColor(time);

	// Apply exposure 
	float gain = pow(2.0, exposure);
	float r = gain*emission.x; 
	float g = gain*emission.y; 
	float b = gain*emission.z;
	
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
	
	gbuf_pos = vec4(pos, 0.0); // time initialized to zero at source
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

in vec4 vColor;
out vec4 outputColor;

void main() 
{
	outputColor = vColor;
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
out vec4 vColor;

void main()
{
	// Textures A and B contain line segment start and end points respectively
	// (i.e. the geometry defined by this vertex shader is stored in textures)
	// as well as the proper time per ray
	vec4 posA = texture(PosDataA, TexCoord.xy);
	vec4 posB = texture(PosDataB, TexCoord.xy);

	// Line segment vertex position (either posA or posB)
	vec4 pos = mix(posA, posB, TexCoord.z);
	gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(pos.xyz, 1.0);

	// Keep t
	vec3 rgb = vec3(1.0);
	float t = pos.w;
	vColor = vec4(rgb, t);
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