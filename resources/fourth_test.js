"use strict";

function main() {
    let image = new Image();
    image.src = "resources/container.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
        render(image);
    };
}

function radToDeg(r) {
    return r * 180 / Math.PI;
  }

function degToRad(d) {
return d * Math.PI / 180;
}

let matrixLocation;
let gl;

let translation = [-0.5, -0.5, -2];
let rotation = [degToRad(0), degToRad(0), degToRad(0)];
let scale = [1, 1, 1];
let fieldOfViewRadians = degToRad(60);

function updatePosition(index) {
    return function(event, ui) {
        translation[index] = ui.value;
        draw();
    };
}

function updateRotation(index) {
    return function(event, ui) {
        var angleInDegrees = ui.value;
        var angleInRadians = angleInDegrees * Math.PI / 180;
        rotation[index] = angleInRadians;
        draw();
    };
}

function updateScale(index) {
    return function(event, ui) {
        scale[index] = ui.value;
        draw();
    };
}

function updateField(event, ui) {
    fieldOfViewRadians = degToRad(ui.value);
    draw();
  }

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

    gl.useProgram(program);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    let posBuff = setBuffData();
    bindAttribLocation(posBuff, positionLocation, texCoordLocation);

    let elementData = setElementsData();

    createAndSetupTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    webglLessonsUI.setupSlider("#fudgeFactor", {value: fieldOfViewRadians, slide: updateField, max: 180, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: 10, min: -10, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: 10, min: -10, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#z", {value: translation[2], slide: updatePosition(2), max: gl.canvas.height, min: -gl.canvas.height, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360, min: -360});
    webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360, min: -360});
    webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360, min: -360});
    webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2});
    
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);

    gl.enable(gl.DEPTH_TEST);

    draw(0)
}


function setBuffData() {
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        //前面
        0, 0, 1, 0, 0,
        0, 1, 1, 0, 1,
        1, 0, 1, 1, 0,
        1, 1, 1, 1, 1,
        
        //后面
        0, 0, 0, 1, 0,
        0, 1, 0, 1, 1,
        1, 0, 0, 0, 0,
        1, 1, 0, 0, 1,

        //上面
        0, 1, 1, 0, 0,
        1, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        1, 1, 0, 1, 1,

        //下面
        0, 0, 1, 1, 0,
        1, 0, 1, 0, 0,
        0, 0, 0, 1, 1,
        1, 0, 0, 0, 1,

        //左面
        0, 0, 0, 0, 0,
        0, 0, 1, 1, 0,
        0, 1, 0, 0, 1,
        0, 1, 1, 1, 1,

        //右面
        1, 0, 1, 0, 0,
        1, 0, 0, 1, 0,
        1, 1, 0, 1, 1,
        1, 1, 1, 0, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function setElementsData() {
    let elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);

    let positions = [
        //前面
        0, 3, 1, 0, 2, 3,
        //后面
        6, 5, 7, 6, 4, 5,
        //上面
        8, 11, 10, 8, 9, 11,
        //下面
        13, 14, 15, 13, 12, 14,
        //左面
        16, 19, 18, 16, 17, 19,
        //右面
        20, 22, 23, 20, 21, 22
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(positions), gl.STATIC_DRAW);
    return elementBuffer;
}

function bindAttribLocation(buff, attrLocation, texLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.enableVertexAttribArray(attrLocation);
    let size = 3;          
    let type = gl.FLOAT;   
    let normalize = false; 
    let stride = 4 * 5;      
    let offset = 0;        
    gl.vertexAttribPointer(attrLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texLocation);
    size = 2;
    offset = 3 * 4;
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

function draw(dt) {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    matrix = m4.identity();
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    console.log(matrix)

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    

    // draw
    let primitiveType = gl.TRIANGLES;
    let beginPos = 0;
    let count = 36;
    gl.drawElements(primitiveType, count, gl.UNSIGNED_BYTE, beginPos);
}

main();