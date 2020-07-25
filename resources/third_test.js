"use strict";

function main() {
    let image = new Image();
    image.src = "resources/pretty.png";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
        render(image);
    };
}

let matrixLocation;
let isLuminanceLocation;
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
    let textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    let kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
    isLuminanceLocation = gl.getUniformLocation(program, "u_isLuminance");
    let kernelLocation = gl.getUniformLocation(program, "u_kernel");

    gl.useProgram(program);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    let posBuff = setBuffData();
    bindAttribLocation(posBuff, positionLocation, texCoordLocation);
    setKernel(kernelLocation, kernelWeightLocation);
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    let texture = createAndSetupTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    draw(0)
}


function setBuffData() {
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        -100, -100, 1, 0,
        -300, 0,  0.5, 1,
        -100, 100, 0, 0,

        -100, 100, 0, 0,
        0, 300, 0.5, 1,
        100, 100, 1, 0,

        100, 100, 0, 0,
        300, 0, 0.5, 1,
        100, -100, 1, 0,

        100, -100, 0, 0,
        0, -300, 0.5, 1,
        -100, -100, 1, 0
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

let isLumin = 0;
function draw(dt) {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let matrix = make2DProjectionCenter0(gl.canvas.clientWidth/2, gl.canvas.clientHeight/2);
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    if(dt % 1000 > 500){
        isLumin = 1 - isLumin;
    }
    gl.uniform1i(isLuminanceLocation, isLumin);

    // draw
    let primitiveType = gl.TRIANGLES;
    let beginPos = 0;
    var count = 12;
    gl.drawArrays(primitiveType, beginPos, count);
    requestAnimationFrame(draw);
}

main();