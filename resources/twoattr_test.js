"use strict";

    

function main() {
// Get A WebGL context
let canvas = document.querySelector("#c");
let gl = canvas.getContext("webgl");
if (!gl) {
    return;
}

// Get the strings for our GLSL shaders
let program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])


// look up where the vertex data needs to go.
let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
let positionBAttributeLocation = gl.getAttribLocation(program, "b_position");
let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var positions = [
    -100, -100,
    -300, 0,
    -100,100,

    -100, 100,
    0, 300,
    100, 100,

    100, 100,
    300, 0,
    100, -100,

    100, -100,
    0, -300,
    -100, -100
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
let size = 2;          // 2 components per iteration
let type = gl.FLOAT;   // the data is 32bit floats
let normalize = false; // don't normalize the data
let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
let offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

let positionBs = [
    -150, 0,
    -150, 0,
    -150, 0,

    0, 150,
    0, 150,
    0, 150,

    150, 0,
    150, 0,
    150, 0,

    0, -150,
    0, -150,
    0, -150,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBs), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionBAttributeLocation);
// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
size = 2;          // 2 components per iteration
type = gl.FLOAT;   // the data is 32bit floats
normalize = false; // don't normalize the data
stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(positionBAttributeLocation, size, type, normalize, stride, offset);

// code above this line is initialization code.
// code below this line is rendering code.
// Tell it to use our program (pair of shaders)
gl.useProgram(program);

webglUtils.resizeCanvasToDisplaySize(gl.canvas);

// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);



// draw
let primitiveType = gl.TRIANGLES;
let beginPos = 0;
var count = 12;
gl.drawArrays(primitiveType, beginPos, count);
}

main();