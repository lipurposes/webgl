"use strict";

function main() {
    let image = new Image();
    image.src = "resources/bg.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
        render(image);
    };
}

let matrixLocation;
let texCoordYAdd
let gl;

function render(image) {
    // Get A WebGL context
    let canvas = document.querySelector("#c");
    gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Get the strings for our GLSL shaders
    let program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])

    // look up where the vertex data needs to go.
    let positionLocation = gl.getAttribLocation(program, "a_position");
    let texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    matrixLocation = gl.getUniformLocation(program, "u_matrix");
    texCoordYAdd = gl.getUniformLocation(program, "u_texCoordYAdd");

    gl.useProgram(program);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    let posBuff = setBuffData();
    bindAttribLocation(posBuff, positionLocation, texCoordLocation);

    let texture = createAndSetupTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    draw(0)
}


function setBuffData() {
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        -128, -256, 0, 0,
        128, 256, 1, 1,
        -128, 256, 0, 1,

        -128, -256, 0, 0,
        128, -256, 1, 0,
        128, 256, 1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function bindAttribLocation(buff, attrLocation, texLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.enableVertexAttribArray(attrLocation);
    let size = 2;          
    let type = gl.FLOAT;   
    let normalize = false; 
    let stride = 4 * 4;      
    let offset = 0;        
    gl.vertexAttribPointer(attrLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texLocation);
    offset = 2 * 4;
    gl.vertexAttribPointer(texLocation, size, type, normalize, stride, offset);
}

function createAndSetupTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    // 设置材质，这样我们可以对任意大小的图像进行像素操作
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    return texture;
  }

function setKernel(kernelLocation, kernelWeightLocation){
    let edgeDetectKernel = [
        -2, -1,  0,
       -1,  1,  1,
        0,  1,  2
    ];
    gl.uniform1fv(kernelLocation, edgeDetectKernel);
    gl.uniform1f(kernelWeightLocation, 1.0);
}
let yPos = 0
let timeBefore = 0
function draw(dt) {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let matrix = make2DProjectionCenter0(gl.canvas.clientWidth/2, gl.canvas.clientHeight/2);
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    if(dt - timeBefore > 100){
        yPos = yPos + 0.03
        timeBefore = dt
    }
    gl.uniform1f(texCoordYAdd, yPos);

    // draw
    let primitiveType = gl.TRIANGLES;
    let beginPos = 0;
    var count = 6;
    gl.drawArrays(primitiveType, beginPos, count);
    requestAnimationFrame(draw);
}

main();