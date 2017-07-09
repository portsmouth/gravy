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

	// image.w contains the summed times for all rays which 
	// cross the pixel, so we need to divide by the total fluence of the pixel
	// to get the average delay of all rays crossing the pixel.
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
