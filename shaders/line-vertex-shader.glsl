precision highp float;

uniform sampler2D PosDataA;
uniform sampler2D PosDataB;
uniform sampler2D RgbData;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

attribute vec3 TexCoord;

varying vec3 vColor;

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

