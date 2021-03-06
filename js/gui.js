
/** @constructor 
* Interface to the dat.GUI UI.
*/
var GUI = function(visible = true) 
{
	// Create dat gui
	this.gui = new dat.GUI();
	this.gui.domElement.id = 'gui';
	var gui = this.gui;
	this.visible = visible;
	
	this.createMatterSettings();
	this.createRaytracerSettings();
	if (!visible)
		this.gui.__proto__.constructor.toggleHide();
}

function updateDisplay(gui) 
{
    for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }
    for (var f in gui.__folders) {
        updateDisplay(gui.__folders[f]);
    }
}

/**
* Call to explicitly force the GUI to synchronize with the
* current parameter values, if they have been changed programmatically.
*/
GUI.prototype.sync = function()
{
	updateDisplay(this.gui);
}

GUI.prototype.toggleHide = function()
{
	this.visible = !this.visible;
}

function hexToRgb(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

GUI.prototype.createRaytracerSettings = function()
{
	this.rendererFolder = this.gui.addFolder('Raytracer');
	this.raytracerSettings = {};
	var raytracer = gravy.getRaytracer();
	var camera = gravy.getCamera();

	this.rendererFolder.add(raytracer, 'maxNumSteps', 4, 4096).onChange( function(value) { raytracer.maxNumSteps = Math.floor(value); raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'raySize', 4, 1024).onChange( function(value) { raytracer.raySize = Math.floor(value); raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'marchDistance', 0.0, 1000.0).onChange( function(value) { raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'sourceDist', 0.0, 100.0).onChange( function(value) { raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'sourceRadius', 0.0, 1.0).onChange( function(value) { raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'sourceBeamAngle', 0.0, 180.0).onChange( function(value) { raytracer.reset(true); } );
	this.rendererFolder.add(raytracer, 'exposure', -10.0, 10.0);
	this.rendererFolder.add(raytracer, 'gamma', 0.0, 3.0);
	this.rendererFolder.add(raytracer, 'timeScale', 0.0, 100.0);
	this.rendererFolder.add(raytracer, 'timePeriodSecs', 0.0, 10.0);
	this.rendererFolder.add(raytracer, 'includeShapiroDelay').onChange( function(value) { raytracer.reset(true); } );

	this.rendererFolder.colorA = [raytracer.colorA[0]*255.0, raytracer.colorA[1]*255.0, raytracer.colorA[2]*255.0];
	let itemA = this.rendererFolder.addColor(this.rendererFolder, 'colorA');
	itemA.onChange( function(c) {
								if (typeof c==='string' || c instanceof String)
								{
									var color = hexToRgb(c);
									raytracer.colorA[0] = color.r/255.0;
									raytracer.colorA[1] = color.g/255.0;
									raytracer.colorA[2] = color.b/255.0;
								}
								else
								{
									raytracer.colorA[0] = c[0]/255.0;
									raytracer.colorA[1] = c[1]/255.0;
									raytracer.colorA[2] = c[2]/255.0;
								}
							} );

	this.rendererFolder.colorB = [raytracer.colorB[0]*255.0, raytracer.colorB[1]*255.0, raytracer.colorB[2]*255.0];
	let itemB = this.rendererFolder.addColor(this.rendererFolder, 'colorB');
	itemB.onChange( function(c) {
								if (typeof c==='string' || c instanceof String)
								{
									var color = hexToRgb(c);
									raytracer.colorB[0] = color.r/255.0;
									raytracer.colorB[1] = color.g/255.0;
									raytracer.colorB[2] = color.b/255.0;
								}
								else
								{
									raytracer.colorB[0] = c[0] / 255.0;
									raytracer.colorB[1] = c[1] / 255.0;
									raytracer.colorB[2] = c[2] / 255.0;
								}
							} );

	this.gui.remember(this.raytracerSettings);
	this.rendererFolder.close();
}

GUI.prototype.createMatterSettings = function()
{
	var potentialObj = gravy.getPotential();
	if (typeof potentialObj.initGui !== "undefined") 
	{
		this.userFolder = this.gui.addFolder('Matter');
		potentialObj.initGui(this);
		this.userFolder.open();
		this.gui.remember(this.sceneSettings);
	}
}

/** 
 * Add a dat.GUI UI slider to control a float parameter.
 * The scene parameters need to be organized into an Object as
 * key-value pairs, for supply to this function.
 * @param {Object} parameters - the parameters object for the scene, with a key-value pair (where value is number) for the float parameter name
 * @param {Object} param - the slider range for this parameter, in the form `{name: 'foo', min: 0.0, max: 100.0, step: 1.0, recompile: true}` (step is optional, recompile is optional [default is false])
 * @param {Object} folder - optionally, pass the dat.GUI folder to add the parameter to (defaults to the main scene folder)
 * @returns {Object} the created dat.GUI slider item
 * @example
 *		Scene.prototype.initGui = function(gui)            
 *		{
 *			gui.addSlider(this.parameters, c);
 *			gui.addSlider(this.parameters, {name: 'foo2', min: 0.0, max: 1.0});
 *			gui.addSlider(this.parameters, {name: 'bar', min: 0.0, max: 3.0, recompile: true});
 *		}
 */
GUI.prototype.addSlider = function(parameters, param, folder=undefined)
{
	let _f = this.userFolder;
	if (typeof folder !== 'undefined') _f = folder;
	var name = param.name;
	var min  = param.min;
	var max  = param.max;
	var step = param.step;
	var recompile = param.recompile;
	var no_recompile = true;
	if (!(recompile==null || recompile==undefined)) no_recompile = !recompile;
	var item;
	if (step==null || step==undefined) { item = _f.add(parameters, name, min, max, step); }
	else                               { item = _f.add(parameters, name, min, max);       }
	item.onChange( function(value) { gravy.reset(no_recompile); gravy.camera.enabled = false; } );
	item.onFinishChange( function(value) { gravy.camera.enabled = true; } );
	return item;
}

/** 
 * Add a dat.GUI UI color picker to control a 3-element array parameter (where the RGB color channels are mapped into [0,1] float range)
 * @param {Object} parameters - the parameters object for the scene, with a key-value pair (where value is a 3-element array) for the color parameter name
 * @param {Object} name - the color parameter name
 * @param {Object} folder - optionally, pass a scale factor to apply to the RGB color components to calculate the result (defaults to 1.0)
 * @param {Object} folder - optionally, pass the dat.GUI folder to add the parameter to (defaults to the main scene folder)
 * @returns {Object} the created dat.GUI color picker item
*/
GUI.prototype.addColor = function(parameters, name, scale=1.0, folder=undefined)
{
	let _f = this.userFolder;
	if (typeof folder !== 'undefined') _f = folder;
	_f[name] = [parameters[name][0]*255.0, parameters[name][1]*255.0, parameters[name][2]*255.0];
	var item = _f.addColor(_f, name);
	item.onChange( function(color) {
								if (typeof color==='string' || color instanceof String)
								{
									var C = hexToRgb(color);
									parameters[name][0] = scale * C.r / 255.0;
									parameters[name][1] = scale * C.g / 255.0;
									parameters[name][2] = scale * C.b / 255.0;
								}
								else
								{
									parameters[name][0] = scale * color[0] / 255.0;
									parameters[name][1] = scale * color[1] / 255.0;
									parameters[name][2] = scale * color[2] / 255.0;
								}
								gravy.reset(true);
							} );
	return item;
}

// (deprecated)
GUI.prototype.addParameter = function(parameters, param)
{
	this.addSlider(parameters, param);
}

/**
* Access to internal dat.GUI object
* @returns {dat.GUI}
*/
GUI.prototype.getGUI = function()
{
	return this.gui;
}

/**
* Access to dat.GUI object folder object containing user UI parameters
* @returns {dat.GUI}
*/
GUI.prototype.getUserFolder = function()
{
	return this.userFolder;
}



