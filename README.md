# Gravy

A webGL visualization of gravitationally lensed light paths in three dimensions. Click below for live demos, and author your own via the API.

<a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/pointmass.html"><img src="./docs/screenshots/pointmass_thumb.png" width="440"/></a><a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/1mass.html"><img src="./docs/screenshots/1mass_thumb.png" width="440"/></a>
<a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/2mass.html"><img src="./docs/screenshots/2mass_thumb.png" width="440"/></a><a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/4mass.html"><img src="./docs/screenshots/4mass_thumb.png" width="440"/></a>
<a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/noise.html"><img src="./docs/screenshots/noise_thumb.png" width="440"/></a><a href="https://cdn.rawgit.com/portsmouth/gravy/v1.0.1/exampleScenes/disk.html"><img src="./docs/screenshots/disk_thumb.png" width="440"/></a>

UI controls:
 - left mouse to rotate, alt-mouse to pan
 - AWSD to fly
 - F to frame camera on initial position and orientation
 - P to capture a screenshot of the current render in a new browser window
 - R to reset to initial state
 - O to serialize scene code to the JavaScript console
 - H to hide/show the sidebar UI
 - F11 to enter/exit fullscreen mode


In the presence of a sufficiently strong gravitational field (produced by large amounts of matter, e.g. stars, galaxies, and dark matter), space is curved and causes light rays to be deflected towards matter. This produces a focusing effect which is known as gravitational lensing, where luminous objects behind a distribution of mass appear to be distorted. 

Gravy simulates this effect, in order to show the paths which the light follows. A large number of simulated rays are emitted a light source, and the curved path of each drawn. When enough paths have been drawn, the resulting image converges to a visualization of the amount of light energy everywhere in space in the steady state.

The simulation makes the assumption that the gravitational field is not so strong that the full effects of general relativity need to be taken into account. In this approximation, the effect is exactly analogous to refraction, with the refractive index of space driven by the local gravitational potential. The approximation breaks down sufficiently close to large masses however.

 In fact in classic lensing systems in astronomy (galactic lensing or microlensing) the angular deflection is actually very small (on the order of arcminutes at most). In the examples shown here, the lensing is much stronger, producing large angular deflections, even causing the light to bend into loops. Strictly speaking a full general relativistic simulation is needed in this scenario, but the simulation can at least be considered a first order approximation.

There is a single light source, a disk with a variable beam angle, directed along the negative x-axis.
The mass distribution is specified in the form of the 3d gravitational potential, via GLSL code.



# API Reference

Note that authoring a demo requires nothing more than the external javascript link
```html
<script src="https://rawgit.com/portsmouth/gravy/v1.0.1/js/compiled/gravy.min.js"></script>
```
So demos can be hosted anywhere, e.g. in your own GitHub repo and served via RawGit.

<dl>
<dt><a href="docs/API.md/#Gravy">Gravy</a></dt>
<dd></dd>
<dt><a href="docs/API.md/#Potential">Potential</a></dt>
<dd></dd>
<dt><a href="docs/API.md/#Renderer">Renderer</a></dt>
<dd></dd>
</dl>
