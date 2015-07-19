"use strict";

var gl;
var program;

function initGl()
{
	var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
	{
		alert("WebGL is not available");
	}
	
	gl.viewport(0,0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
}

function initProgram()
{
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

window.onload = function init()
{
	initGl();
	initProgram();
    drawScene();
};

function getSetting(element)
{
	var element = document.getElementById(element);
	return parseInt(element.value);
}

function drawScene()
{
    var subdivisions = getSetting("subdivision");
    var rotation = getSetting("rotation");
    var factor = getSetting("factor");

	// Define triangle vertices based on center (0,0).
	var vertices = [vec2(-0.5, -1 * Math.sqrt(3) / 6),
					vec2(0, Math.sqrt(3) / 3),
					vec2(0.5, -1 * Math.sqrt(3) / 6)];

    var points = [];
    divideTriangle(points, vertices[0], vertices[1], vertices[2], subdivisions);
	
	// Pass rotation setting to shader.
	var shaderRotation = gl.getUniformLocation(program, "rotation");
	gl.uniform1f(shaderRotation, rotation);
    
	// Pass factor setting to shader.
	var shaderFactor = gl.getUniformLocation(program, "factor");
	gl.uniform1f(shaderFactor, factor);
	
	// Pass points to buffer.
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	// Rneder the scene
	render(points);
}

function render(points)
{
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	if(document.getElementById("render_wire").checked)
	{
		for (var i = 0; i < points.length; i += 3)
		{
			gl.drawArrays(gl.LINE_LOOP, i, 3);
		}
	}
	else
	{
		gl.drawArrays(gl.TRIANGLES, 0, points.length);
	}
}

function triangle(points, a, b, c)
{
    points.push(a, b, c);
}

function divideTriangle(points, a, b, c, count)
{
    // check for end of recursion
    if (count === 0)
	{
        triangle(points, a, b, c);
    }
    else
	{
        //bisect the sides
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles
        divideTriangle(points, a, ab, ac, count);
        divideTriangle(points, c, ac, bc, count);
        divideTriangle(points, b, bc, ab, count);
        divideTriangle(points, ab, bc, ac, count);
    }
}

function onRotate(val)
{
	var element = document.getElementById("rotation_output");
	element.value = val;
	drawScene();
}

function onSubdivide(val)
{
	var element = document.getElementById("subdivide_output");
	element.value = val;
	drawScene();
}

function onFactor(val)
{
	var element = document.getElementById("factor_output");
	element.value = val;
	drawScene();
}

function onRender(val)
{
	drawScene();
}
