precision highp float;

uniform sampler2D WaveBuffer;
varying vec2 vTexCoord;

out vec4 outputColor;

void main() 
{
	outputColor = vec4(texture(WaveBuffer, vTexCoord).rgba);
}
