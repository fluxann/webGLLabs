'use strict';
import Model from "./model.js";
import TrackballRotator from "./Utils/trackball-rotator.js";

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.


let lightConfig = {
    position: [5.0, 0.0, 0.0],
    angle: 0,
    radius: 10,
    speed: 0.005,
}; 


// Constructor
function ShaderProgram(name, program) {
    this.name = name;
    this.prog = program;
    this.Use = function() {
        gl.useProgram(this.prog);
    }
}


function draw() {
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let viewerPosition = [0.0, 10.0, 10.0]; // Viewer position


    const rotate = m4.axisRotation([0.707, 0.707, 0], 0.7);
    const translate = m4.translation(0, 0, -5);

    let modelViewMatrix = spaceball.getViewMatrix();    
    modelViewMatrix = m4.multiply(rotate, modelViewMatrix);
    modelViewMatrix = m4.multiply(translate, modelViewMatrix);

    let projectionMatrix = m4.perspective(Math.PI / 4, 1, 0.1, 100);
    let modelViewProjectionMatrix = m4.multiply(projectionMatrix, modelViewMatrix);
    let normalMatrix = [
        modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
        modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
        modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
    ];

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjectionMatrix);
    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix3fv(shProgram.iNormalMatrix, false, normalMatrix);
    
    gl.uniform3fv(shProgram.iColor, [1.0, 0.0, 1.0]);
    gl.uniform3fv(shProgram.iLightPosition, lightConfig.position);
    gl.uniform3fv(shProgram.iViewerPosition, viewerPosition);
    gl.uniform1i(shProgram.iNormalTexture, 1);
    gl.uniform1i(shProgram.iSpecularTexture, 2);

    surface.Draw();
}


function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Phong', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTangent = gl.getAttribLocation(prog, "tangent");
    shProgram.iAttribTex = gl.getAttribLocation(prog, "tex");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iModelViewMatrix = gl.getUniformLocation(prog, "ModelViewMatrix");
    shProgram.iNormalMatrix = gl.getUniformLocation(prog, "NormalMatrix");
    shProgram.iLightPosition = gl.getUniformLocation(prog, "lightPosition");
    shProgram.iColor = gl.getUniformLocation(prog, 'iColor');
    shProgram.iDiffuseTexture = gl.getUniformLocation(prog, "diffuseTexture");
    shProgram.iSpecularTexture = gl.getUniformLocation(prog, "specularTexture");
    shProgram.iNormalTexture = gl.getUniformLocation(prog, "normalTexture");
    shProgram.iViewerPosition = gl.getUniformLocation(prog, "viewerPosition");

    surface = new Model(gl, shProgram);
    surface.CreateSurfaceData();

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program  */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vShader);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    
    let fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }

    let prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


function updateLightPosition() {
    lightConfig.angle += lightConfig.speed;
    lightConfig.position[0] = lightConfig.radius * Math.cos(lightConfig.angle);
    lightConfig.position[1] = lightConfig.radius * Math.sin(lightConfig.angle);
    //lightConfig.angle -= lightConfig.speed;
}

function update(){
    surface.CreateSurfaceData();
    updateLightPosition();
    draw();
    requestAnimationFrame(update)
}

/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    draw();
}

document.getElementById('vGranularity').addEventListener('change', update);
document.getElementById('uGranularity').addEventListener('change', update);

document.addEventListener("DOMContentLoaded", init);
document.addEventListener('draw', draw);