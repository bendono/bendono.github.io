"use strict";

var gl;
var program;

var red = 1;
var green = 0;
var blue = 0;

var pen = 10;
var mousedown = false;

// Uniform locations
var colorLocation;

window.onload = init;

// Initialize application. 
function init()
{	
	addEventHandlers()
	initGl();
	initProgram();
}

// Add event handlers for mouse.
function addEventHandlers()
{
	$("#gl-canvas").mousemove(function(e) { render(e); } );
	$("#gl-canvas").mousedown(function(e) { mousedown = true; } );
	
	// Use body tag to cover case when mouse is released outside of the canvas.
	$("body").mouseup(function(e) { mousedown = false; } );
	//$("#gl-canvas").mouseup(function(e) { mousedown = false; } );
}

// Initialize WebGL. 
function initGl()
{
	var canvas = document.getElementById("gl-canvas");
	console.log('canvas: ', canvas);
	
	// Needed to preserve previously drawn lines.
	var options = { preserveDrawingBuffer: true };
    gl = WebGLUtils.setupWebGL(canvas, options);
	
    if (!gl)
	{
		alert("WebGL is not available");
	}
	
	console.log('gl: ', gl);
	
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
}

// Initialize program and shaders.
function initProgram()
{
	var vertexShader = getShader(gl, "vertex-shader");
	var fragmentShader = getShader(gl, "fragment-shader");
	
	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
	{
		var msg = "Error in program linking: " + gl.getProgramInfoLog(program);
		console.log(msg);
		
		gl.deleteProgram(program);
		throw msg;
	}

    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    var positionLocation = gl.getAttribLocation( program, "position" );
	console.log('Vertex position location: ', positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLocation);
	
	var resolutionLocation = gl.getUniformLocation(program, "resolution");
	console.log("Resolution location: " + resolutionLocation);
	gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
	
	colorLocation = gl.getUniformLocation(program, 'color');
	console.log('Color location: ', colorLocation);
}

// Retrieve a shader.
function getShader(gl, id)
{
	var shaderScript = document.getElementById(id);
	
	if (!shaderScript)
	{
		var msg = "Unable to load shader ID '" + id + "'.";
		console.log(msg);
		throw msg;
	}

	var shader;
	
	if (shaderScript.type == "x-shader/x-fragment")
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else if (shaderScript.type == "x-shader/x-vertex")
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}
	else
	{
		var msg = "Shader type '" + shaderScript.type + "' is unknown.";
		console.log(msg);
		return msg;
	}

	gl.shaderSource(shader, shaderScript.text);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		var msg = gl.getShaderInfoLog(shader);
		console.log(msg);
		throw msg;
	}

	return shader;
}

// Render vertices.
// e is an event argument from when mouse is moved. Used to extract (X,Y) position.
function render(e)
{
	// Only draw when the mouse is down.
    if (mousedown)
	{
		var canvasRect = canvas.getBoundingClientRect();
        var x = e.clientX - canvasRect.left;
        var y = e.clientY - canvasRect.top;
		
		// Build rectangle "line" out of two triangles .
		// Pen is the pen width.
		var v = new Float32Array([
            x,       y,
            x + pen, y,
            x,       y + pen,
            x,       y + pen,
            x + pen, y,
            x + pen, y + pen]);
			
		gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
		gl.uniform4f(colorLocation, red, green, blue, 1);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

// Callback for when Color setting changes.
function onColorChange(e)
{
	console.log("Pen color changed to " + e.value);

	// Color is a string made up of RGB values separated by a comma.
	// Split and assign colors.
	var parts = e.value.split(",");
	red = parseInt(parts[0]);
	green = parseInt(parts[1]);
	blue = parseInt(parts[2]);
}

// Callback for when Pen width setting changes.
function onPenWidth(val)
{
	console.log("Pen width change to " + val);
	pen = parseInt(val);
	
	// Update display label.
	var e = document.getElementById("penwidth_output");
	e.value = val;
}

// Callback for when the Clear button is pushed.
function onClear()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
}
