

var RayState = function(size) 
{
	var posData   = new Float32Array(size*size*4); // ray position
	var dirData   = new Float32Array(size*size*4); // ray direction
	var rngData   = new Float32Array(size*size*4); // Random number seed
	var rgbData   = new Float32Array(size*size*4); // Ray color, and wavelength

	for (var i = 0; i<size*size; ++i)
	{
		for (var t = 0; t<4; ++t)
		{
			dirData[i*4 + t] = 0.0;
			rgbData[i*4 + t] = Math.random();
			rngData[i*4 + t] = Math.random()*4194167.0;
		}
		dirData[i*4 + 0] = 1.0;
	}

	this.posTex   = new GLU.Texture(size, size, 4, true, false, true, posData);
	this.dirTex   = new GLU.Texture(size, size, 4, true, false, true, dirData);
	this.rngTex   = new GLU.Texture(size, size, 4, true, false, true, rngData);
	this.rgbTex   = new GLU.Texture(size, size, 4, true, false, true, rgbData);
}

RayState.prototype.bind = function(shader)
{
	this.posTex.bind(0);
	this.dirTex.bind(1);
	this.rngTex.bind(2);
	this.rgbTex.bind(3);
	shader.uniformTexture("PosData", this.posTex);
	shader.uniformTexture("DirData", this.dirTex);
	shader.uniformTexture("RngData", this.rngTex);
	shader.uniformTexture("RgbData", this.rgbTex);
}

RayState.prototype.attach = function(fbo)
{
	var gl = GLU.gl;
	fbo.attachTexture(this.posTex, 0);
	fbo.attachTexture(this.dirTex, 1);
	fbo.attachTexture(this.rngTex, 2);
	fbo.attachTexture(this.rgbTex, 3);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) 
	{
		GLU.fail("Invalid framebuffer");
	}
}

RayState.prototype.detach = function(fbo)
{
	var gl = GLU.gl;
	fbo.detachTexture(0);
	fbo.detachTexture(1);
	fbo.detachTexture(2);
	fbo.detachTexture(3);
}

/** 
* Interface to the raytracer.
* @constructor 
* @property {number} [maxNumSteps=256]          - maximum number of raymarching steps per path segment
* @property {number} [raySize=128]              - number of rays per wavefront is the square of this
* @property {number} [marchDistance=100.0]      - the total distance travelled by each ray
* @property {number} [sourceDist=10.0]          - distance of light source (along positive x axis)
* @property {number} [sourceRadius=0.001]       - radius of light source disk
* @property {number} [sourceBeamAngle=135.0]    - opening angle of light source beam (degrees)
* @property {number} [exposure=3.0]             - image exposure, on a log scale
* @property {number} [gamma=2.2]                - image gamma correction
* @property {number} [timeScale=1.0]            - delay timescale over which color cycles
* @property {number} [timePeriodSecs=2.0]       - real time (in seconds) over which the color cycles
* @property {number} [includeShapiroDelay=true] - whether to add the Shapiro term to the time delay
* @property {Array}  colorA                     - color to cycle to on even phase of the time delay
* @property {Array}  colorB                     - color to cycle to on odd phase of the time delay
*/
var Raytracer = function()
{
	this.gl = GLU.gl;
	var gl = GLU.gl;

	// Initialize textures containing ray states
	this.raySize = 128;
	this.enabled = true;
	this.initStates();

	this.maxNumSteps = 256;
	this.marchDistance = 100.0;
	this.exposure = 3.0;
	this.gamma = 2.2;

	this.sourceDist = 10.0;    // along positive x axis
	this.sourceRadius = 0.001;
	this.sourceBeamAngle = 135.0;

	this.timeScale = 1.0;
	this.timePeriodSecs = 2.0;
	this.time_ms = 0.0;
	this.includeShapiroDelay = true;
	this.colorA = [1.0, 1.0, 1.0];
	this.colorB = [1.0, 1.0, 1.0];

	// Create a quad VBO for rendering textures
	this.quadVbo = this.createQuadVbo();

	// Initialize raytracing shaders
	this.shaderSources = GLU.resolveShaderSource(["init", "trace", "line", "comp", "pass"]);

	// Initialize GL
	this.fbo = new GLU.RenderTarget();
}



Raytracer.prototype.createQuadVbo = function()
{
	var vbo = new GLU.VertexBuffer();
	vbo.addAttribute("Position", 3, this.gl.FLOAT, false);
	vbo.addAttribute("TexCoord", 2, this.gl.FLOAT, false);
	vbo.init(4);
	vbo.copy(new Float32Array([
		 1.0,  1.0, 0.0, 1.0, 1.0,
		-1.0,  1.0, 0.0, 0.0, 1.0,
		-1.0, -1.0, 0.0, 0.0, 0.0,
		 1.0, -1.0, 0.0, 1.0, 0.0
	]));
	return vbo;
}

Raytracer.prototype.reset = function()
{
	this.wavesTraced = 0;
	this.raysTraced = 0;
	this.pathLength = 0;
	this.time_ms = 0.0;

	this.compileShaders();
	this.initStates();

	// Clear fluence buffers
	let gl = GLU.gl;
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.fbo.bind();
	this.fbo.drawBuffers(1);
	this.fbo.attachTexture(this.fluenceBuffer, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	this.fbo.unbind();

	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

Raytracer.prototype.compileShaders = function()
{
	var potentialObj = gravy.getPotential();
	if (potentialObj==null) return;
	
	// Inject code for the current scene and material:
	let code = potentialObj.program();

	// Copy the current scene and material routines into the source code
	// of the trace fragment shader
	replacements = {};
	replacements.POTENTIAL_FUNC = code;

	// shaderSources is a dict from name (e.g. "trace")
	// to a dict {v:vertexShaderSource, f:fragmentShaderSource}
	this.traceProgram = new GLU.Shader('trace', this.shaderSources, replacements);
	this.initProgram  = new GLU.Shader('init',  this.shaderSources, null);
	this.lineProgram  = new GLU.Shader('line',  this.shaderSources, null);
	this.compProgram  = new GLU.Shader('comp',  this.shaderSources, null);
	this.passProgram  = new GLU.Shader('pass',  this.shaderSources, null);
}


Raytracer.prototype.initStates = function()
{
	this.raySize = Math.floor(this.raySize);
	this.rayCount = this.raySize*this.raySize;
	this.currentState = 0;
	this.rayStates = [new RayState(this.raySize), new RayState(this.raySize)];
		
	// Create the buffer of texture coordinates, which maps each drawn line
	// to its corresponding texture lookup.
	{
		let gl = GLU.gl;
		this.rayVbo = new GLU.VertexBuffer();
		this.rayVbo.addAttribute("TexCoord", 3, gl.FLOAT, false);
		this.rayVbo.init(this.rayCount*2);
		var vboData = new Float32Array(this.rayCount*2*3);
		for (var i=0; i<this.rayCount; ++i)
		{
			var u = ((i % this.raySize) + 0.5) / this.raySize;
			var v = (Math.floor(i/this.raySize) + 0.5) / this.raySize;
			vboData[i*6 + 0] = vboData[i*6 + 3] = u;
			vboData[i*6 + 1] = vboData[i*6 + 4] = v;
			vboData[i*6 + 2] = 0.0;
			vboData[i*6 + 5] = 1.0;
		}
		this.rayVbo.copy(vboData);
	}
}


Raytracer.prototype.getStats = function()
{
	stats = {};
	stats.rayCount    = this.raysTraced;
	stats.wavesTraced = this.wavesTraced;
	stats.maxNumSteps = this.maxNumSteps;
	return stats;
}

Raytracer.prototype.composite = function()
{
	let gl = GLU.gl;

	// Normalize and tonemap the fluence buffer to produce final pixels
	this.compProgram.bind();
	this.quadVbo.bind();

	// Normalize the emission by dividing by the total number of paths
	// (and also apply gamma correction)
	var gui = gravy.getGUI();
	this.compProgram.uniformF("invNumRays", 1.0/Math.max(this.raysTraced, 1));
	this.compProgram.uniformF("exposure", this.exposure);
	this.compProgram.uniformF("invGamma", 1.0/this.gamma);
	
	let potentialObj = gravy.getPotential();
	if (potentialObj==null) return;
	this.compProgram.uniformF("timeScale", this.timeScale);
	this.compProgram.uniformF("timePhase", 2.0*Math.PI*this.time_ms/(1000.0*this.timePeriodSecs)); 
	this.compProgram.uniform3Fv("colorA", this.colorA);
	this.compProgram.uniform3Fv("colorB", this.colorB);

	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.ONE, gl.ONE);

	this.fluenceBuffer.bind(0);
	this.compProgram.uniformTexture("Fluence", this.fluenceBuffer);
	this.quadVbo.draw(this.compProgram, this.gl.TRIANGLE_FAN);

	gl.disable(gl.BLEND);
}


Raytracer.prototype.isEnabled = function()
{
	return this.enabled;
}


Raytracer.prototype.render = function()
{
	if (!this.enabled) return;
	var gl = GLU.gl;

	var timer_start = performance.now();

	let potentialObj = gravy.getPotential();
	if (potentialObj==null) return;

	this.fbo.bind();

	// Clear wavebuffer
	{	
		this.quadVbo.bind();
		this.fbo.drawBuffers(1);
		gl.viewport(0, 0, this.width, this.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.fbo.attachTexture(this.waveBuffer, 0); // write to wavebuffer
		gl.disable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	// Initialize light wavefront at the source
	{
		gl.disable(gl.BLEND);
		gl.viewport(0, 0, this.raySize, this.raySize);

		this.fbo.drawBuffers(4);
		
		let current = this.currentState;
		let next = 1 - current;
		
		this.rayStates[next].attach(this.fbo);
		this.quadVbo.bind();
		this.initProgram.bind(); // Start all rays at emission point(s)
		this.rayStates[current].rngTex.bind(0); // Read random seed from the current state
		this.initProgram.uniformTexture("RngData", this.rayStates[current].rngTex);
		
		this.initProgram.uniform3F("SourcePos", this.sourceDist, 0.0, 0.0);
		this.initProgram.uniform3F("SourceDir", -1.0, 0.0, 0.0);
		this.initProgram.uniformF("SourceRadius", this.sourceRadius);
		this.initProgram.uniformF("SourceBeamAngle", this.sourceBeamAngle);
		
		this.quadVbo.draw(this.initProgram, gl.TRIANGLE_FAN);
		this.currentState = 1 - this.currentState; // so emitted ray initial conditions are now the 'current' state
	}

	// Prepare raytracing program
	{
		this.traceProgram.bind();
		let stepDistance = this.marchDistance / this.maxNumSteps;
		let lengthScale = 1.0;
		if (typeof potentialObj.getScale !== "undefined") 
		{
			lengthScale = potentialObj.getScale();
		}
		this.traceProgram.uniformF("lengthScale", lengthScale); 
		this.traceProgram.uniformF("stepDistance", stepDistance); 
		if (typeof potentialObj.syncProgram !== "undefined") 
		{
			potentialObj.syncProgram(gravy, this.traceProgram);    // upload current potential parameters
		}
		this.traceProgram.uniformI("includeShapiroDelay", Boolean(this.includeShapiroDelay) ? 1 : 0);
	}

	// Prepare line drawing program
	{
		this.lineProgram.bind();

		// Setup projection matrix
		var camera = gravy.camera;
		var projectionMatrix = camera.projectionMatrix.toArray();
		var projectionMatrixLocation = this.lineProgram.getUniformLocation("u_projectionMatrix");
		gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

		// Setup modelview matrix (to match camera)
		camera.updateMatrixWorld();
		var matrixWorldInverse = new THREE.Matrix4();
		matrixWorldInverse.getInverse( camera.matrixWorld );
		var modelViewMatrix = matrixWorldInverse.toArray();
		var modelViewMatrixLocation = this.lineProgram.getUniformLocation("u_modelViewMatrix");
		gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
	}


	// Integrate progressively along the wavefront of light rays
	while (this.pathLength < this.maxNumSteps)
	{
		let current = this.currentState;
		let next = 1 - current;

		// Propagate the current set of rays through the potential, generating new ray pos/dir data in 'next' rayStates textures
		{
			gl.viewport(0, 0, this.raySize, this.raySize);
			this.fbo.drawBuffers(4);
			this.rayStates[next].attach(this.fbo);
			this.quadVbo.bind();

			this.traceProgram.bind();
			this.rayStates[current].bind(this.traceProgram);       // Use the current state as the initial conditions
			this.quadVbo.draw(this.traceProgram, gl.TRIANGLE_FAN); // Generate the next ray state
			this.rayStates[next].detach(this.fbo)
		}

		// Read this data to draw the next 'wavefront' of rays (i.e. line segments) into the wave buffer
		{
			gl.viewport(0, 0, this.width, this.height);
			gl.disable(gl.DEPTH_TEST);
			this.fbo.drawBuffers(1);

			// The float radiance channels of all lines are simply added each pass
			gl.blendFunc(gl.ONE, gl.ONE); // accumulate line segment radiances
			gl.enable(gl.BLEND);
			this.lineProgram.bind();
			this.rayStates[current].posTex.bind(0); // read PosDataA = current.posTex
			this.rayStates[   next].posTex.bind(1); // read PosDataB = next.posTex
			this.rayStates[current].rgbTex.bind(2); // read current  = current.rgbTex
			this.lineProgram.uniformTexture("PosDataA", this.rayStates[current].posTex);
			this.lineProgram.uniformTexture("PosDataB", this.rayStates[   next].posTex);
			this.lineProgram.uniformTexture("RgbData",  this.rayStates[current].rgbTex);
			this.rayVbo.bind(); // Binds the TexCoord attribute
			this.fbo.attachTexture(this.waveBuffer, 0); // write to wavebuffer
			this.rayVbo.draw(this.lineProgram, gl.LINES, this.raySize*this.raySize*2);
			gl.disable(gl.BLEND);
		}

		// Update raytracing state
		this.pathLength += 1;
		this.currentState = next;
	}

	// Add the wavebuffer contents, a complete set of rendered path segments, into the fluence buffer
	{
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE); // accumulate radiances of all line segments from current 'wave' of bounces
		this.quadVbo.bind();
		this.fbo.attachTexture(this.fluenceBuffer, 0); // write to fluence buffer
		this.waveBuffer.bind(0);                       // read from wave buffer
		this.passProgram.bind();
		this.passProgram.uniformTexture("WaveBuffer", this.waveBuffer);
		this.quadVbo.draw(this.passProgram, gl.TRIANGLE_FAN);
	}

	this.fbo.unbind();
	gl.disable(gl.BLEND);
	
	// Final composite of normalized fluence to window
	this.raysTraced += this.raySize*this.raySize;
	this.composite();

	this.wavesTraced += 1;
	this.pathLength = 0;

	var timer_end = performance.now();
	var frame_time_ms = (timer_end - timer_start);
	this.time_ms += frame_time_ms;
}


Raytracer.prototype.resize = function(width, height)
{
	this.width = width;
	this.height = height;

	this.waveBuffer    = new GLU.Texture(width, height, 4, true, false, true, null);
	this.fluenceBuffer = new GLU.Texture(width, height, 4, true, false, true, null);

	this.reset();
}

