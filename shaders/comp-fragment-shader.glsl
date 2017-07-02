precision highp float;

uniform sampler2D Fluence;
uniform float invNumPaths;
uniform float exposure;
uniform float invGamma;

in vec2 vTexCoord;
out vec4 outputColor;

void main() 
{
	vec3 fluence = texture(Fluence, vTexCoord).rgb;
	vec3 phi = float(invNumPaths) * fluence; // normalized fluence

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
