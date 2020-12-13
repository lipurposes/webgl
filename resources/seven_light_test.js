"use strict";

function main() {
    let isLoaded1 = false;
    let isLoaded2 = false;
    let image = new Image();
    let image1 = new Image();
    image.src = "resources/container.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
        isLoaded1 = true;
        if (isLoaded1 && isLoaded2) {
            render(image, image1);
        }
    };
    
    image1.src = "resources/floor.jpg";
    image1.onload = function() {
        isLoaded2 = true;
        if (isLoaded1 && isLoaded2) {
            render(image, image1);
        }
    }
}

function radToDeg(r) {
    return r * 180 / Math.PI;
  }

function degToRad(d) {
return d * Math.PI / 180;
}

let gl;
let matrixLocation;

let positionLocation;
let normalLocation;
let texCoordLocation;
let moduleMatrixLocation;
let moduleInvTMatrixLocation;
let lightPosLocation;
let lightColorLocation;
let amibientColorLocation;
let shiniFactorLocation;
let shininessLocation;
let lightMatrixLocation;
let lightAngleNearLocation;
let lightAngleFarLocation;
let reverseLightDirLocation;


let translation = [0, 0, 0];
let rotation = [degToRad(0), degToRad(0), degToRad(0)];
let scale = [1, 1, 1];
let fieldOfViewRadians = degToRad(60);

let lightPos = [-2, 0, 0];
let lightColor = [0, 1, 0];
let amibientColor = [0.2, 0.2, 0.2];
let shiniFactor = 0.5;
let shininess = 32;
let lightDirection = [0, 0, -1];
let lightAngleNear = 0.9;
let lightAngleFar = 0.7;
let viewPos = [0, 0, 5];

let boxBuff;
let floorBuff;
let boxTexture;
let floorTexture;

let program
let programLight

function updateViewPosition(index) {
    return function(event, ui) {
        viewPos[index] = ui.value;
        draw();
    };
}

function updateShininess(event, ui) {
    shininess = ui.value;
    draw();
}

function updateShiniFactor(event, ui) {
    shiniFactor = ui.value;
    draw();
}

function updateLightAngleN(event, ui) {
    lightAngleNear = ui.value;
    draw();
}
function updateLightAngleF(event, ui) {
    lightAngleFar = ui.value;
    draw();
}


function updateLightDir(index) {
    return function(event, ui) {
        lightDirection[index] = ui.value;
        draw();
    };
}

function updateLight(index) {
    return function(event, ui) {
        lightPos[index] = ui.value;
        draw();
    };
}

function updateField(event, ui) {
    fieldOfViewRadians = degToRad(ui.value);
    draw();
  }

function render(image, image1) {
    // Get A WebGL context
    let canvas = document.querySelector("#c");
    gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Get the strings for our GLSL shaders
    program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])
    programLight = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d-light", "fragment-shader-2d-light"])

    // look up where the vertex data needs to go.
    positionLocation = gl.getAttribLocation(program, "a_position");
    normalLocation = gl.getAttribLocation(program, "a_normal");
    texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    matrixLocation = gl.getUniformLocation(program, "u_matrix");
    moduleMatrixLocation = gl.getUniformLocation(program, "u_ModuleMatrix");
    moduleInvTMatrixLocation = gl.getUniformLocation(program, "u_moduleInvTraMatrix");
    lightPosLocation = gl.getUniformLocation(program, "u_lightPos");
    lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
    amibientColorLocation = gl.getUniformLocation(program, "u_amibient");
    let viewPosLocation = gl.getUniformLocation(program, "u_viewPos");
    shiniFactorLocation = gl.getUniformLocation(program, "u_shiniFactor");
    shininessLocation = gl.getUniformLocation(program, "u_shininess");
    lightAngleNearLocation = gl.getUniformLocation(program, "u_lightAngleNear");
    lightAngleFarLocation = gl.getUniformLocation(program, "u_lightAngleFar");
    reverseLightDirLocation = gl.getUniformLocation(program, "u_reverseLightDir");

    let lightPositionLocation = gl.getAttribLocation(programLight, "a_position");
    let lightNormalLocation = gl.getAttribLocation(programLight, "a_normal");
    let lightTexCoordLocation = gl.getAttribLocation(programLight, "a_texCoord");
    lightMatrixLocation = gl.getUniformLocation(programLight, "u_matrix");

    gl.useProgram(program);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    boxBuff = setBuffData();
    floorBuff = setFloorData();
    
    gl.uniform3fv(lightColorLocation, lightColor);
    gl.uniform3fv(amibientColorLocation, amibientColor);
    gl.uniform3fv(viewPosLocation, [0, 0, 5]);

    let elementData = setElementsData();

    boxTexture = createAndSetupTexture(true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    floorTexture = createAndSetupTexture(true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);

    gl.useProgram(programLight);
    bindAttribLocation(boxBuff, lightPositionLocation);

    // webglLessonsUI.setupSlider("#fudgeFactor", {value: radToDeg(fieldOfViewRadians), slide: updateField, max: 180, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#shininess", {value: shininess, slide: updateShininess, max: 100, min: 1, step: 0.5, precision: 2 });
    webglLessonsUI.setupSlider("#shiniFactor", {value: shiniFactor, slide: updateShiniFactor, max: 1, min: 0, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#viewX", {value: translation[0], slide: updateViewPosition(0), max: 10, min: -10, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#viewY", {value: translation[1], slide: updateViewPosition(1), max: 10, min: -10, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#viewZ", {value: translation[2], slide: updateViewPosition(2), max: 10, min: -10, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightDirectionX", {value: lightDirection[0], slide: updateLightDir(0), max: 1, min: -1, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightDirectionY", {value: lightDirection[1], slide: updateLightDir(1), max: 1, min: -1, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightDirectionZ", {value: lightDirection[2], slide: updateLightDir(2), max: 1, min: -1, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightNAngle", {value: lightAngleNear, slide: updateLightAngleN, max: 1, min: 0.5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#lightFAngle", {value: lightAngleFar, slide: updateLightAngleF, max: 1, min: 0, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#lightX", {value: lightPos[0], slide: updateLight(0), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightY", {value: lightPos[1], slide: updateLight(1), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#lightZ", {value: lightPos[2], slide: updateLight(2), min: -5, max: 5, step: 0.01, precision: 2});
    
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
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 1, 1, 0, 0, 1, 0, 1,
        1, 0, 1, 0, 0, 1, 1, 0,
        1, 1, 1, 0, 0, 1, 1, 1,
        
        //后面
        0, 0, 0, 0, 0, -1, 1, 0,
        0, 1, 0, 0, 0, -1, 1, 1,
        1, 0, 0, 0, 0, -1, 0, 0,
        1, 1, 0, 0, 0, -1, 0, 1,

        //上面
        0, 1, 1, 0, 1, 0, 0, 0,
        1, 1, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 0, 1, 0, 1, 0,
        1, 1, 0, 0, 1, 0, 1, 1,

        //下面
        0, 0, 1, 0, -1, 0, 1, 0,
        1, 0, 1, 0, -1, 0, 0, 0,
        0, 0, 0, 0, -1, 0, 1, 1,
        1, 0, 0, 0, -1, 0, 0, 1,

        //左面
        0, 0, 0, -1, 0, 0, 0, 0,
        0, 0, 1, -1, 0, 0, 1, 0,
        0, 1, 0, -1, 0, 0, 0, 1,
        0, 1, 1, -1, 0, 0, 1, 1,

        //右面
        1, 0, 1, 1, 0, 0, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, 1, 1,
        1, 1, 1, 1, 0, 0, 0, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function setFloorData() {
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        -0.5, 0, -0.5, 0, 1, 0, 0, 1,
        -0.5, 0,  0.5, 0, 1, 0, 0, 0,
        0.5,  0, -0.5, 0, 1, 0, 1, 1,

        -0.5, 0,  0.5, 0, 1, 0, 0, 0,
        0.5,  0,  0.5, 0, 1, 0, 1, 0,
        0.5,  0, -0.5, 0, 1, 0, 1, 1,
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

function bindAttribLocation(buff, attrLocation, normalLocation, texLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.enableVertexAttribArray(attrLocation);
    let size = 3;          
    let type = gl.FLOAT;   
    let normalize = false; 
    let stride = 4 * 8;      
    let offset = 0;        
    gl.vertexAttribPointer(attrLocation, size, type, normalize, stride, offset);

    if (normalLocation) {
        gl.enableVertexAttribArray(normalLocation);
        size = 3;          
        offset = 3 * 4;        
        gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);
    }
    
    if (texLocation) {
        gl.enableVertexAttribArray(texLocation);
        size = 2;
        offset = 6 * 4;
        gl.vertexAttribPointer(texLocation, size, type, normalize, stride, offset);
    }
}

function createAndSetupTexture(isClampToEdge) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    // 设置材质，这样我们可以对任意大小的图像进行像素操作
    if (isClampToEdge) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);  //图片必须为2的幂次方
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 
    return texture;
}

function draw(dt) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    
    gl.uniform1f(shininessLocation, shininess);
    gl.uniform1f(shiniFactorLocation, shiniFactor);
    gl.uniform3fv(lightPosLocation, lightPos);
    gl.uniform1f(lightAngleFarLocation, lightAngleFar);
    gl.uniform1f(lightAngleNearLocation, lightAngleNear);
    bindAttribLocation(boxBuff, positionLocation, normalLocation, texCoordLocation);
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);

    let direct = subtractVectors([0, 0, 0], lightDirection);
    direct = normalize(direct);
    gl.uniform3fv(reverseLightDirLocation, direct);
    
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 10;
    let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    let lookAtMatrix = m4.lookAt(viewPos, [0, 0, 0], [0, 1, 0]);
    lookAtMatrix = m4.inverse(lookAtMatrix);
    matrix = m4.multiply(matrix, lookAtMatrix);

    let moduleMatrix = m4.identity();
    moduleMatrix = m4.translate(moduleMatrix, translation[0], translation[1], translation[2]);
    moduleMatrix = m4.xRotate(moduleMatrix, rotation[0]);
    moduleMatrix = m4.yRotate(moduleMatrix, rotation[1]);
    moduleMatrix = m4.zRotate(moduleMatrix, rotation[2]);
    moduleMatrix = m4.scale(moduleMatrix, scale[0], scale[1], scale[2]);
    moduleMatrix = m4.translate(moduleMatrix, -0.5, -0.5, -0.5);
    

    gl.uniformMatrix4fv(moduleMatrixLocation, false, moduleMatrix);
    let moduleInvT = m4.copy(moduleMatrix);
    moduleInvT = m4.inverse(moduleInvT);
    moduleInvT = m4.transpose(moduleInvT);
    gl.uniformMatrix4fv(moduleInvTMatrixLocation, false, moduleInvT);

    let lastMatrix = m4.multiply(matrix, moduleMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, lastMatrix);
    console.log(matrix);

    // draw
    let primitiveType = gl.TRIANGLES;
    let beginPos = 0;
    let count = 36;
    gl.drawElements(primitiveType, count, gl.UNSIGNED_BYTE, beginPos);

    bindAttribLocation(floorBuff, positionLocation, normalLocation, texCoordLocation);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    moduleMatrix = m4.identity();
    moduleMatrix = m4.translate(moduleMatrix, 0, -1, 0);
    moduleMatrix = m4.scale(moduleMatrix, 8, 1, 6);
    
    gl.uniformMatrix4fv(moduleMatrixLocation, false, moduleMatrix);
    moduleInvT = m4.copy(moduleMatrix);
    moduleInvT = m4.inverse(moduleInvT);
    moduleInvT = m4.transpose(moduleInvT);
    gl.uniformMatrix4fv(moduleInvTMatrixLocation, false, moduleInvT);

    lastMatrix = m4.multiply(matrix, moduleMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, lastMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(programLight);

    moduleMatrix = m4.identity();
    moduleMatrix = m4.translate(moduleMatrix, lightPos[0], lightPos[1], lightPos[2]);
    moduleMatrix = m4.scale(moduleMatrix, 0.1, 0.1, 0.1);
    moduleMatrix = m4.translate(moduleMatrix, -0.5, -0.5, -0.5);
    lastMatrix = m4.multiply(matrix, moduleMatrix);
    gl.uniformMatrix4fv(lightMatrixLocation, false, lastMatrix);
    gl.drawElements(primitiveType, count, gl.UNSIGNED_BYTE, beginPos);
}

main();