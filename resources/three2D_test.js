"use strict";

let translation = [0, 0];
let colorUniformLocation;
let matrixUniformLocation;
let gl;

function main() {
    // Get A WebGL context
    let canvas = document.querySelector("#c");
    gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Get the strings for our GLSL shaders
    let program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])

    // look up where the vertex data needs to go.
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    colorUniformLocation = gl.getUniformLocation(program, "u_color");
    matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

    let posBuff = setBuffData();
    bindAttribLocation(posBuff, positionAttributeLocation);
    
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    setPosLocation();

    gl.useProgram(program);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    draw(0)
}


function setBuffData() {
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
        -100, -100,
        -300, 0,
        -100, 100,

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
    return positionBuffer;
}

function bindAttribLocation(buff, attrLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.enableVertexAttribArray(attrLocation);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 2;          // 2 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(attrLocation, size, type, normalize, stride, offset);
}

function setPosLocation() {
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width/2,  min : -gl.canvas.width/2});
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height/2, min : -gl.canvas.height/2});

    function updatePosition(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            draw(0);
        };
    }
}

function draw(dt) {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let angle = dt / 10 % 360;
    let drgee = degToRad(angle);

    let matrix = makeRotation(drgee);
    matrix = matrixMultiply(matrix, makeTranslation(translation[0], translation[1]));
    let projectMatrix = make2DProjectionCenter0(gl.canvas.clientWidth/2, gl.canvas.clientHeight/2);
    matrix = matrixMultiply(matrix, projectMatrix);
    
    let color = [Math.random(), Math.random(), Math.random()];
    gl.uniform3fv(colorUniformLocation, color);
    gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

    // draw
    let primitiveType = gl.TRIANGLES;
    let beginPos = 0;
    var count = 12;
    gl.drawArrays(primitiveType, beginPos, count);
    requestAnimationFrame(draw);
}

main();