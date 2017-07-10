
## Classes

<dl>
<dt><a href="#Gravy">Gravy</a></dt>
<dd></dd>
<dt><a href="#Raytracer">Raytracer</a></dt>
<dd></dd>
<dt><a href="#Potential">Potential</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#GLU">GLU</a> : <code>object</code></dt>
<dd><p>Namespace for webGL utility wrappers.
Functions for loading shader uniform variables are exposed to the user
for convenience.</p>
</dd>
</dl>

<a name="Gravy"></a>

## Gravy
**Kind**: global class  

* [Gravy](#Gravy)
    * [new Gravy(sceneObj)](#new_Gravy_new)
    * [.getVersion()](#Gravy+getVersion) ⇒ <code>Array</code>
    * [.getRaytracer()](#Gravy+getRaytracer) ⇒ <code>Renderer</code>
    * [.getGUI()](#Gravy+getGUI) ⇒ <code>GUI</code>
    * [.getCamera()](#Gravy+getCamera) ⇒ <code>THREE.PerspectiveCamera</code>
    * [.getControls()](#Gravy+getControls) ⇒ <code>THREE.OrbitControls</code>
    * [.getGLContext()](#Gravy+getGLContext) ⇒ <code>WebGLRenderingContext</code>
    * [.showGUI(show)](#Gravy+showGUI)

<a name="new_Gravy_new"></a>

### new Gravy(sceneObj)
Gravy is the global object providing access to all functionality in the system.


| Param | Type | Description |
| --- | --- | --- |
| sceneObj | [<code>Potential</code>](#Potential) | The object defining the gravitational potential |

<a name="Gravy+getVersion"></a>

### gravy.getVersion() ⇒ <code>Array</code>
Returns the current version number of the Gravy system, in the format [1, 2, 3] (i.e. major, minor, patch version)

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
<a name="Gravy+getRaytracer"></a>

### gravy.getRaytracer() ⇒ <code>Renderer</code>
Access to the Renderer object

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
<a name="Gravy+getGUI"></a>

### gravy.getGUI() ⇒ <code>GUI</code>
Access to the GUI object

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
<a name="Gravy+getCamera"></a>

### gravy.getCamera() ⇒ <code>THREE.PerspectiveCamera</code>
Access to the camera object

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
**Returns**: <code>THREE.PerspectiveCamera</code> - .  
<a name="Gravy+getControls"></a>

### gravy.getControls() ⇒ <code>THREE.OrbitControls</code>
Access to the camera controller object

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
<a name="Gravy+getGLContext"></a>

### gravy.getGLContext() ⇒ <code>WebGLRenderingContext</code>
**Kind**: instance method of [<code>Gravy</code>](#Gravy)  
**Returns**: <code>WebGLRenderingContext</code> - The webGL context  
<a name="Gravy+showGUI"></a>

### gravy.showGUI(show)
Programmatically show or hide the dat.GUI UI

**Kind**: instance method of [<code>Gravy</code>](#Gravy)  

| Param | Type | Description |
| --- | --- | --- |
| show | <code>Boolean</code> | toggle |

<a name="Raytracer"></a>

## Raytracer
**Kind**: global class  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| maxNumSteps | <code>number</code> | <code>256</code> | maximum number of raymarching steps per path segment |
| raySize | <code>number</code> | <code>128</code> | number of rays per wavefront is the square of this |
| marchDistance | <code>number</code> | <code>100.0</code> | the total distance travelled by each ray |
| sourceDist | <code>number</code> | <code>10.0</code> | distance of light source (along positive x axis) |
| sourceRadius | <code>number</code> | <code>0.001</code> | radius of light source disk |
| sourceBeamAngle | <code>number</code> | <code>135.0</code> | opening angle of light source beam (degrees) |
| exposure | <code>number</code> | <code>3.0</code> | image exposure, on a log scale |
| gamma | <code>number</code> | <code>2.2</code> | image gamma correction |
| timeScale | <code>number</code> | <code>1.0</code> | delay timescale over which color cycles |
| timePeriodSecs | <code>number</code> | <code>2.0</code> | real time (in seconds) over which the color cycles |
| includeShapiroDelay | <code>number</code> | <code>true</code> | whether to add the Shapiro term to the time delay |
| colorA | <code>Array</code> |  | color to cycle to on even phase of the time delay |
| colorB | <code>Array</code> |  | color to cycle to on odd phase of the time delay |

<a name="new_Raytracer_new"></a>

### new Raytracer()
Interface to the raytracer.

<a name="Potential"></a>

## Potential
**Kind**: global class  

* [Potential](#Potential)
    * [.init(gravy)](#Potential+init)
    * [.initGenerator()](#Potential+initGenerator)
    * [.getName()](#Potential+getName) ⇒ <code>String</code>
    * [.getURL()](#Potential+getURL) ⇒ <code>String</code>
    * [.program()](#Potential+program) ⇒ <code>String</code>
    * [.initGui(gui)](#Potential+initGui)
    * [.syncProgram(gravy, shader)](#Potential+syncProgram)
    * [.getScale()](#Potential+getScale) ⇒ <code>number</code>

<a name="Potential+init"></a>

### potential.init(gravy)
Optionally (but usually), provide this function to set potential and raycaster initial state.This is called only once during execution, on loading the HTML page (or on global reset via 'R' key).

**Kind**: instance method of [<code>Potential</code>](#Potential)  

| Param | Type | Description |
| --- | --- | --- |
| gravy | [<code>Gravy</code>](#Gravy) | The Gravy object |

<a name="Potential+initGenerator"></a>

### potential.initGenerator()
Optionally, provide this function which generates the init code to re-generate the current UI parameter settings. This will be dumped to the console (along with the rest of the UI state) on pressing key 'O', allowing the scene and rendererstate to be tweaked in the UI then saved by copy-pasting code into the init function.

**Kind**: instance method of [<code>Potential</code>](#Potential)  
<a name="Potential+getName"></a>

### potential.getName() ⇒ <code>String</code>
Optional name (displayed in UI)

**Kind**: instance method of [<code>Potential</code>](#Potential)  
<a name="Potential+getURL"></a>

### potential.getURL() ⇒ <code>String</code>
Optional clickable URL (displayed in UI)

**Kind**: instance method of [<code>Potential</code>](#Potential)  
<a name="Potential+program"></a>

### potential.program() ⇒ <code>String</code>
Returns a chunk of GLSL code defining the 3D gravitational potential in which the light propagates.Light is deflected according to the local gradient of the potential.This function is mandatory! The code *must* define the function:```glsl     float POTENTIAL(vec3 X);```

**Kind**: instance method of [<code>Potential</code>](#Potential)  
<a name="Potential+initGui"></a>

### potential.initGui(gui)
Optional. Set up gui and callbacks for this scene via dat.GUI

**Kind**: instance method of [<code>Potential</code>](#Potential)  

| Param | Type | Description |
| --- | --- | --- |
| gui | <code>GUI</code> | wrapper for dat.GUI object |

<a name="Potential+syncProgram"></a>

### potential.syncProgram(gravy, shader)
Optional. Called whenever the UI is changed,
/* and must sync the params of the GLSL program with the current UI settings

**Kind**: instance method of [<code>Potential</code>](#Potential)  

| Param | Type | Description |
| --- | --- | --- |
| gravy | [<code>Gravy</code>](#Gravy) | The Gravy object |
| shader | [<code>this.Shader</code>](#GLU.this.Shader) | wrapper of webGL fragment shader, see [this.Shader](#GLU.this.Shader) |

<a name="Potential+getScale"></a>

### potential.getScale() ⇒ <code>number</code>
Optional. Gives the raytracer some indication of the (rough) length scale, so it can set tolerances appropriately (e.g. the epsilon for gradient computation is 1.0e-4 of this scale).Defaults to 1.0.

**Kind**: instance method of [<code>Potential</code>](#Potential)  
<a name="GLU"></a>

## GLU : <code>object</code>
Namespace for webGL utility wrappers.Functions for loading shader uniform variables are exposed to the userfor convenience.

**Kind**: global namespace  

* [GLU](#GLU) : <code>object</code>
    * [.this.Shader](#GLU.this.Shader)
        * [new this.Shader()](#new_GLU.this.Shader_new)
        * [.uniformI(name, i)](#GLU.this.Shader.uniformI)
        * [.uniformF(name, f)](#GLU.this.Shader.uniformF)
        * [.uniform2F(name, f1, f2)](#GLU.this.Shader.uniform2F)
        * [.uniform1Fv(name, fvec)](#GLU.this.Shader.uniform1Fv)
        * [.uniform2Fv(name, fvec2)](#GLU.this.Shader.uniform2Fv)
        * [.uniform3F(name, f1, f2, f3)](#GLU.this.Shader.uniform3F)
        * [.uniform3Fv(name, fvec3)](#GLU.this.Shader.uniform3Fv)
        * [.uniform4F(name, f1, f2, f3, f4)](#GLU.this.Shader.uniform4F)
        * [.uniform4Fv(name, fvec4)](#GLU.this.Shader.uniform4Fv)
        * [.uniformMatrix4fv(name, matrixArray16)](#GLU.this.Shader.uniformMatrix4fv)

<a name="GLU.this.Shader"></a>

### GLU.this.Shader
**Kind**: static class of [<code>GLU</code>](#GLU)  

* [.this.Shader](#GLU.this.Shader)
    * [new this.Shader()](#new_GLU.this.Shader_new)
    * [.uniformI(name, i)](#GLU.this.Shader.uniformI)
    * [.uniformF(name, f)](#GLU.this.Shader.uniformF)
    * [.uniform2F(name, f1, f2)](#GLU.this.Shader.uniform2F)
    * [.uniform1Fv(name, fvec)](#GLU.this.Shader.uniform1Fv)
    * [.uniform2Fv(name, fvec2)](#GLU.this.Shader.uniform2Fv)
    * [.uniform3F(name, f1, f2, f3)](#GLU.this.Shader.uniform3F)
    * [.uniform3Fv(name, fvec3)](#GLU.this.Shader.uniform3Fv)
    * [.uniform4F(name, f1, f2, f3, f4)](#GLU.this.Shader.uniform4F)
    * [.uniform4Fv(name, fvec4)](#GLU.this.Shader.uniform4Fv)
    * [.uniformMatrix4fv(name, matrixArray16)](#GLU.this.Shader.uniformMatrix4fv)

<a name="new_GLU.this.Shader_new"></a>

#### new this.Shader()
Represents a webGL vertex or fragment shader:

<a name="GLU.this.Shader.uniformI"></a>

#### this.Shader.uniformI(name, i)
Provide an integer (via uniform1i) to the currently bound shader

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| i | <code>number</code> | The integer value |

<a name="GLU.this.Shader.uniformF"></a>

#### this.Shader.uniformF(name, f)
Provide a float (via uniform1f) to the currently bound shader

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| f | <code>number</code> | The float value |

<a name="GLU.this.Shader.uniform2F"></a>

#### this.Shader.uniform2F(name, f1, f2)
Provide a vec2 uniform (via uniform2f) to the currently bound shader

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| f1 | <code>number</code> | The first float value |
| f2 | <code>number</code> | The second float value |

<a name="GLU.this.Shader.uniform1Fv"></a>

#### this.Shader.uniform1Fv(name, fvec)
Provide an array of floats (via uniform1Fv) to the currently bound shader  i.e. the shader declares e.g. `uniform float values[19];`

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| fvec | <code>Float32Array</code> | An array of floats |

<a name="GLU.this.Shader.uniform2Fv"></a>

#### this.Shader.uniform2Fv(name, fvec2)
Provide an array of vec2 (via uniform2fv) to the currently bound shader  i.e. the shader declares e.g. `uniform vec2 vectors[19];`

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| fvec2 | <code>Float32Array</code> | An array of floats, 2 per vector |

<a name="GLU.this.Shader.uniform3F"></a>

#### this.Shader.uniform3F(name, f1, f2, f3)
Provide a vec3 uniform (via uniform3f) to the currently bound shader

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| f1 | <code>number</code> | The first float value |
| f2 | <code>number</code> | The second float value |
| f3 | <code>number</code> | The third float value |

<a name="GLU.this.Shader.uniform3Fv"></a>

#### this.Shader.uniform3Fv(name, fvec3)
Provide an array of vec3 (via uniform3fv) to the currently bound shader  i.e. the shader declares e.g. `uniform vec3 vectors[19];`

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| fvec3 | <code>Float32Array</code> | An array of floats, 3 per vector |

<a name="GLU.this.Shader.uniform4F"></a>

#### this.Shader.uniform4F(name, f1, f2, f3, f4)
Provide a vec4 uniform (via uniform4F) to the currently bound shader

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| f1 | <code>number</code> | The first float value |
| f2 | <code>number</code> | The second float value |
| f3 | <code>number</code> | The third float value |
| f4 | <code>number</code> | The fourth float value |

<a name="GLU.this.Shader.uniform4Fv"></a>

#### this.Shader.uniform4Fv(name, fvec4)
Provide an array of vec4 (via uniform4fv) to the currently bound shader  i.e. the shader declares e.g. `uniform vec4 vectors[19];`

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| fvec4 | <code>Float32Array</code> | An array of floats, 4 per vector |

<a name="GLU.this.Shader.uniformMatrix4fv"></a>

#### this.Shader.uniformMatrix4fv(name, matrixArray16)
Provide a matrix (via uniformMatrix4fv) to the currently bound shader i.e. the shader declares e.g. `uniform mat4 matrix;`

**Kind**: static method of [<code>this.Shader</code>](#GLU.this.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the uniform variable |
| matrixArray16 | <code>Float32Array</code> | An array of 16 floats |


