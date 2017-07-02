precision highp float;

varying vec3 vColor;

out vec4 outputColor;

void main() 
{
	outputColor = vec4(vColor, 1.0);
}
