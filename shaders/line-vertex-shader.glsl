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

