"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

/* Vertices */
var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4(0.5,  0.5,  0.5, 1.0),
    vec4(0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4(0.5,  0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

/* TORSO */
var posTorso = [-12.0, 1.4, 0]
var torsoId = 0;
var torsoHeight = 3.5;
var torsoWidth = 6.0;
var torsoDim = 3.0;

/* HEAD */
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var headHeight = 2.5;
var headWidth = 2.5;

/* LEGS */
var leftUpperArmId = 6;
var leftLowerArmId = 7;
var rightUpperArmId = 8;
var rightLowerArmId = 9;

var leftUpperLegId = 2;
var leftLowerLegId = 3;
var rightUpperLegId = 4;
var rightLowerLegId = 5;

var upperArmHeight = 2.0;
var lowerArmHeight = 1.0;
var upperArmWidth  = 1.25;
var lowerArmWidth  = 1.0;

var upperLegHeight = 2.0;
var lowerLegHeight = 1.0;
var upperLegWidth  = 1.25;
var lowerLegWidth  = 1.0;

/* TAIL */
var tailId = 11;
var tailHeight = 0.5;
var tailWidth = 1.0;
var tailLengh = 2.0;

/* FENCE */
/* vertical */
var fenceId = 12;
var fence2Id = 13;
var fence3Id = 14;
var fence4Id = 15;
var fence5Id = 16;
var fence6Id = 17;
var fence7Id = 18;
var fence8Id = 19;
var fence9Id = 20;
var fence10Id = 21;
var fence11Id = 22;

/* horizontal */
var fence12Id = 23;
var fence13Id = 24;

var fenceVerticalWidth = 0.7;
var fenceVerticalLengh = 1.0;
var fenceVerticalHeight = 4.5;

var fenceHorizontalLengh = 17.0;
var fenceHorizontalHeightUp = 1.5;
var fenceHorizontalHeightDown = -0.75;

/* SURFACE (GRASS) */
var grassId = 25;
var grassHeight = 80.0;
var grassLengh = 60;

var sunId = 26;
var sunHeight = 5.0;

var numNodes = 27;

var theta = [0, 0, 180, 0, 180, 0, 180,  0, 180, 0, 0,-45,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -90, -90, 0, 0];

var stack = [];
var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;

var pointsArray = [];
var normalsArray = [];
var tangentsArray = [];

/* TEXTURE */
var texture_body;
var texture_body_normal_map;
var texture_head;
var texture_fence;
var texture_grass;
var texture_grass_normal_map;

var textureBody = true;
var textureHead = true;
var textureFence = true;
var textureLeg = true;
var textureGrass = true;

/* TEXTURE COORDINATES */
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
]

var texCoordBody = [
    vec2(0, 0),
    vec2(0, 0.5),
    vec2(0.5, 0.5),
    vec2(0.5, 0)
]

var texCoordLeg = [
    vec2(0, 0),
    vec2(0, 0.25),
    vec2(0.25, 0.25),
    vec2(0.25, 0)
]

var texCoordsArray = []
var texCoordsBodyArray = []
var texCoordsLegArray = []

function configureTexture (img1, imgBmp1, img2, img3, img4, imgBmp4){
    texture_body = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_body);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, img1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapBody"), 0);

    texture_body_normal_map = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_body_normal_map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, imgBmp1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapBodyNormalMap"), 1);

    // texture for the head
    texture_head = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_head);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, img2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapHead"), 2);

    //texture for the fence
    texture_fence = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_fence);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, img3);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapFence"), 3);

    //texture for grass
    texture_grass = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_grass);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, img4);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapGrass"), 4);

    texture_grass_normal_map = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_grass_normal_map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, imgBmp4);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTextureMapGrassNormalMap"), 5);
}

var eyeM = vec3(0.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var radius = 45.0;
var thetas = 10 * Math.PI / 180.0;
var phi = -40 * Math.PI / 180.0;

var near = 0.4;
var far = 2000.0;

var fovy = 45.0;
var aspect = 1.0;

var BumpMap = true;

/* LIGHT */
var lightPosition = vec4(0.0, 25.0, 25.0, 1.0);
var lightAmbient = vec4(0.6, 0.6, 0.6, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(0.2, 0.2, 0.2, 1.0);

/* MATERIAL */
var materialAmbient = vec4(0.9, 0.9, 0.9, 1.0);
var materialDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var materialSpecular = vec4(0.3, 0.3, 0.3, 1.0);
var materialShininess = 1000.0;

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    var f = mat4();
    var g = mat4();
    var s = mat4();

    switch(Id) {
        // SHEEP
        case torsoId:
            m = translate(posTorso[0], posTorso[1], posTorso[2]);
            m = mult(m, rotate(theta[head1Id], vec3(0, 0, 1)))
            m = mult(m, rotate(theta[torsoId], vec3(0, 1, 0)))
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(3.5, torsoHeight/2 + headHeight - 1, 0.0);
            m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperLegId, null);
            break;

        case leftUpperArmId:
            m = translate(1.5, -0.5, -0.89);
            m = mult(m, rotate(theta[leftUpperArmId], vec3(0, 0, 1)));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:
            m = translate(1.5, -0.5, 0.89);
            m = mult(m, rotate(theta[rightUpperArmId], vec3(0, 0, 1)));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, tailId, rightLowerArmId);
            break;

        case leftUpperLegId:
            m = translate(-2.0, -0.5, -0.89);
            m = mult(m, rotate(theta[leftUpperLegId], vec3(0, 0, 1)));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:
            m = translate(-2.0, -0.5, 0.89);
            m = mult(m, rotate(theta[rightUpperLegId], vec3(0, 0, 1)));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, leftUpperArmId, rightLowerLegId);
            break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], vec3(0, 0, 1)));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], vec3(0, 0, 1)));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], vec3(0, 0, 1)));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], vec3(0, 0, 1)));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

        case tailId:
            m = translate(-3.0, tailHeight + 0.3 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[tailId], vec3(0, 0, 1)));
            figure[tailId] = createNode(m, tail, null, null);
            break;

        // FENCE
        case fenceId:
            f = translate(0.0, -0.49*fenceVerticalHeight, -7.5);
            f = mult(f, rotate(theta[fenceId], vec3(1, 0, 0)));
            figure[fenceId] = createNode( f, fenceVertical, fence2Id, null );
            break;

        case fence2Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, -6.0);
            f = mult(f, rotate(theta[fence2Id], vec3(1, 0, 0)));
            figure[fence2Id] = createNode( f, fenceVertical2, fence3Id, null );
            break;

        case fence3Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, -4.5);
            f = mult(f, rotate(theta[fence3Id], vec3(1, 0, 0)));
            figure[fence3Id] = createNode( f, fenceVertical3, fence4Id, null );
            break;

        case fence4Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, -3.0);
            f = mult(f, rotate(theta[fence4Id], vec3(1, 0, 0)));
            figure[fence4Id] = createNode( f, fenceVertical4, fence5Id, null );
            break;

        case fence5Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, -1.5);
            f = mult(f, rotate(theta[fence5Id], vec3(1, 0, 0)));
            figure[fence5Id] = createNode( f, fenceVertical5, fence6Id, null );
            break;

        case fence6Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 0.0);
            f = mult(f, rotate(theta[fence6Id], vec3(1, 0, 0)));
            figure[fence6Id] = createNode( f, fenceVertical6, fence7Id, null );
            break;

        case fence7Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 1.5);
            f = mult(f, rotate(theta[fence7Id], vec3(1, 0, 0)));
            figure[fence7Id] = createNode( f, fenceVertical7, fence8Id, null );
            break;

        case fence8Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 3.0);
            f = mult(f, rotate(theta[fence8Id], vec3(1, 0, 0)));
            figure[fence8Id] = createNode( f, fenceVertical8, fence9Id, null );
            break;

        case fence9Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 4.5);
            f = mult(f, rotate(theta[fence9Id], vec3(1, 0, 0)));
            figure[fence9Id] = createNode( f, fenceVertical9, fence10Id, null );
            break;

        case fence10Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 6.0);
            f = mult(f, rotate(theta[fence10Id], vec3(1, 0, 0)));
            figure[fence10Id] = createNode( f, fenceVertical10, fence11Id, null );
            break;

        case fence11Id:
            f = translate(0.0, -0.49*fenceVerticalHeight, 7.5);
            f = mult(f, rotate(theta[fence11Id], vec3(1, 0, 0)));
            figure[fence11Id] = createNode( f, fenceVertical11, fence12Id, null );
            break;

        case fence12Id:
            f = translate(2.25, fenceHorizontalHeightUp, 0.0);
            f = mult(f, rotate(theta[fence12Id], vec3(0, 0, 1)));
            figure[fence12Id] = createNode( f, fenceHorizontal, fence13Id, null );
            break;

        case fence13Id:
            f = translate(2.25, fenceHorizontalHeightDown, 0.0);
            f = mult(f, rotate(theta[fence13Id], vec3(0, 0, 1)));
            figure[fence13Id] = createNode( f, fenceHorizontal1, null, null );
            break;

        case grassId:
            g = translate(0.0, 0.0, 0.0);
            g = mult(f, rotate(theta[grassId], vec3(1, 0, 0)));
            figure[grassId] = createNode( g, grass, null, null );
            break;

        case sunId:
            s = translate(0.0, 0.0, 0.0);
            s = mult(f, rotate(theta[sunId], vec3(1, 0, 0)));
            figure[sunId] = createNode( s, sun, null, null );
            break;
    }
}

var m = mat4();
function traverse(Id) {
   if(Id == null) return;
   stack.push(m);
   m = mult(m, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    m = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

var movLoc;

function torso() {
    textureBody = true;
    textureLeg = false;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.35*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoDim));
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function head() {
    textureBody = true;
    textureLeg = false;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i = 0; i<6; i++) {
        if(i==1) continue;
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }

    textureBody = false;
    textureLeg = false;
    textureHead = true;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
}
function leftUpperArm() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftLowerArm() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightUpperArm() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightLowerArm() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftUpperLeg() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftLowerLeg() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightUpperLeg() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightLowerLeg() {
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function tail(){
    textureBody = false;
    textureLeg = true;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * tailHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tailLengh, tailHeight, tailWidth) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function fenceVertical(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical2(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical3(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical4(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical5(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical6(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical7(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical8(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical9(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical10(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceVertical11(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalHeight, fenceVerticalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceHorizontal(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalWidth-0.2, fenceHorizontalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function fenceHorizontal1(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = true;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, 0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(fenceVerticalWidth, fenceVerticalWidth-0.2, fenceHorizontalLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function grass(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = false;
    textureGrass = true;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(0.0, -0.5 * fenceVerticalHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(grassHeight, 0.01, grassLengh) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++)
        if(i == 2) {
            gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
        }
}

function sun(){
    textureBody = false;
    textureLeg = false;
    textureHead = false;
    textureFence = false;
    textureGrass = false;
    gl.uniform1f( gl.getUniformLocation(program, "textureBody"), textureBody );
    gl.uniform1f( gl.getUniformLocation(program, "textureHead"), textureHead );
    gl.uniform1f( gl.getUniformLocation(program, "textureFence"), textureFence );
    gl.uniform1f( gl.getUniformLocation(program, "textureLeg"), textureLeg );
    gl.uniform1f( gl.getUniformLocation(program, "textureGrass"), textureGrass );
    instanceMatrix = mult(m, translate(lightPosition[0], lightPosition[1], lightPosition[2]) );
    instanceMatrix = mult(instanceMatrix, scale(sunHeight, sunHeight, sunHeight) )
    gl.uniformMatrix4fv(movLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}


function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = normalize(cross(t1, t2));
    normal = vec3( normal[0], normal[1], normal[2] );
    var tangent = vec3( t1[0], t1[1], t1[2] );
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[0]);
     texCoordsBodyArray.push(texCoordBody[0]);
     texCoordsLegArray.push(texCoordLeg[0]);
     tangentsArray.push(tangent);

     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[1]);
     texCoordsBodyArray.push(texCoordBody[1]);
     texCoordsLegArray.push(texCoordLeg[1]);
     tangentsArray.push(tangent);

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[2]);
     texCoordsBodyArray.push(texCoordBody[2]);
     texCoordsLegArray.push(texCoordLeg[2]);
     tangentsArray.push(tangent);

     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[3]);
     texCoordsBodyArray.push(texCoordBody[3]);
     texCoordsLegArray.push(texCoordLeg[3]);
     tangentsArray.push(tangent);
}

function cube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

var isRunning = false;
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.7, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program);
    gl.enable(gl.DEPTH_TEST);

    instanceMatrix = mat4();

    modelViewMatrix = lookAt(eyeM, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    movLoc = gl.getUniformLocation(program, "uMov");

    /* TEXTURE IMAGES */
    var img1 = document.getElementById("tex_body");
    var imgBmp1 = document.getElementById("tex_body_normal_map");
    var img2 = document.getElementById("tex_head");
    var img3 = document.getElementById("tex_fence");
    var img4 = document.getElementById("tex_grass");
    var imgBmp4 = document.getElementById("tex_grass_normal_map");


    /* CONFIGURE AND ACTIVATION OF THE TEXTURES */
    configureTexture(img1, imgBmp1, img2, img3, img4, imgBmp4);// normals,img2, img3, img4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_body);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture_body_normal_map);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture_head);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture_fence);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture_grass);

    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture_grass_normal_map);

    cube();

    /* POSITION */
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    /* texture_body sheep */
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    /* TEXTURE */
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var tBufferB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsBodyArray), gl.STATIC_DRAW);

    var texCoordBodyLoc = gl.getAttribLocation(program, "aTexCoordBody");
    gl.vertexAttribPointer(texCoordBodyLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordBodyLoc);

    var tBufferL = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferL);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsLegArray), gl.STATIC_DRAW);

    var texCoordLegLoc = gl.getAttribLocation(program, "aTexCoordLeg");
    gl.vertexAttribPointer(texCoordLegLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLegLoc);

    /* tangent buffer */
    var aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tangentsArray), gl.STATIC_DRAW);

    var tangentLoc = gl.getAttribLocation(program, "aTangent");
    gl.vertexAttribPointer(tangentLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLoc);

    /* BUTTONS */
    document.getElementById("StartAnimation").onclick = function(event){
        if (isRunning == true)
            return;
        setInterval(function(){ go_jump();}, 50)
        isRunning = true;
    };
    document.getElementById("ResetAnimation").onclick = function(event){
        reset();
    };

    /* CHECKBOX */
    document.getElementById("BumpMap").onclick = function () {
        BumpMap = !BumpMap;
        gl.uniform1f(gl.getUniformLocation(program, "uBumpMapFlag"), BumpMap);
    };

    /* SLIDER */
    document.getElementById("zFarSlider").onchange = function (event) {
        far = parseFloat(event.target.value);
    };
    document.getElementById("zNearSlider").onchange = function (event) {
        near = parseFloat(event.target.value);
    };
    document.getElementById("radiusSlider").onchange = function (event) {
        radius = parseFloat(event.target.value);
    };
    document.getElementById("thetaSlider").onchange = function (event) {
        thetas = parseFloat(event.target.value * Math.PI / 180.0);
    };
    document.getElementById("phiSlider").onchange = function (event) {
        phi = parseFloat(event.target.value * Math.PI / 180.0);
    };
    document.getElementById("aspectSlider").onchange = function (event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function (event) {
        fovy = parseFloat(event.target.value);
    };

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);
    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "uBumpMapFlag"), BumpMap);

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}

var state2 = 0;

function walk(){
    switch (state2) {
        case 0: {
            if (theta[rightUpperArmId] <= 140 && theta[leftUpperLegId] <= 140 && theta[rightUpperLegId] >= 210 && theta[leftUpperArmId] >= 210) {
                state2++;
                break;
            }
            theta[rightUpperArmId] -= 10;
            initNodes(rightUpperArmId);

            theta[rightUpperLegId] += 10;
            initNodes(rightUpperLegId);

            theta[leftUpperLegId] -= 10;
            initNodes(leftUpperLegId);

            theta[leftUpperArmId] += 10;
            initNodes(leftUpperArmId);

            break;
        }
        case 1: {
            if (theta[rightUpperArmId] >= 210 && theta[leftUpperLegId] >= 210 && theta[rightUpperLegId] <= 140 && theta[leftUpperArmId] <= 140) {
                state2 = 0;
                break;
            }
            theta[rightUpperArmId] += 10;
            initNodes(rightUpperArmId);

            theta[rightUpperLegId] -= 10;
            initNodes(rightUpperLegId);

            theta[leftUpperLegId] += 10;
            initNodes(leftUpperLegId);

            theta[leftUpperArmId] -= 10;
            initNodes(leftUpperArmId);

            break;
        }
    }
}

var state = 0;
var count = 0;
var a = Math.PI-0.2;

function go_jump(){

    switch(state) {
        case 0: {
            if (posTorso[0] >= -8.0) {
                state++;
                break;
            }

            walk();
            posTorso[0] += 0.25;
            initNodes(torsoId);
            break;
        }
        case 1: {
            if(a < 0.2) {
                posTorso[1] = 1.4;
                state++;
                break;
            }

            if (!(theta[rightUpperArmId] <= 110 && theta[leftUpperLegId] <= 110 && theta[rightUpperLegId] >= 250 && theta[leftUpperArmId] >= 250)) {
                count ++;

                theta[rightUpperArmId] -= 10;
                initNodes(rightUpperArmId);

                theta[rightUpperLegId] += 10;
                initNodes(rightUpperLegId);

                theta[leftUpperLegId] -= 10;
                initNodes(leftUpperLegId);

                theta[leftUpperArmId] += 10;
                initNodes(leftUpperArmId);
            }

            a -= 0.12;
            posTorso[0] = 8.0*Math.cos(a);
            posTorso[1] = 8.0*Math.sin(a);
            initNodes(torsoId);
            break;
        }
        case 2: {
            if (posTorso[0] >= 12.0) {
                state++;
                break;
            }
            if (count > 0) {
                count--;
                theta[rightUpperArmId] += 10;
                initNodes(rightUpperArmId);

                theta[rightUpperLegId] -= 10;
                initNodes(rightUpperLegId);

                theta[leftUpperLegId] += 10;
                initNodes(leftUpperLegId);

                theta[leftUpperArmId] -= 10;
                initNodes(leftUpperArmId);
            }
            walk();
            posTorso[0] += 0.25;
            initNodes(torsoId);
            break;
        }
        case 3: {
            if (theta[torsoId] >= 180.0) {
                state++;
                break;
            }

            walk();
            theta[torsoId] += 10;
            initNodes(torsoId);
            break;
        }
        case 4: {
            if (posTorso[0] <= 8.0) {
                state++;
                break;
            }

            walk();
            posTorso[0] -= 0.25;
            initNodes(torsoId);
            break;
        }
        case 5: {
            if(a > Math.PI-0.2) {
                posTorso[1] = 1.4;
                state++;
                break;
            }

            if (!(theta[rightUpperArmId] <= 110 && theta[leftUpperLegId] <= 110 && theta[rightUpperLegId] >= 250 && theta[leftUpperArmId] >= 250)) {
                count ++;

                theta[rightUpperArmId] -= 10;
                initNodes(rightUpperArmId);

                theta[rightUpperLegId] += 10;
                initNodes(rightUpperLegId);

                theta[leftUpperLegId] -= 10;
                initNodes(leftUpperLegId);

                theta[leftUpperArmId] += 10;
                initNodes(leftUpperArmId);
            }

            a += 0.12;
            posTorso[0] = 8*Math.cos(a);
            posTorso[1] = 8*Math.sin(a);
            initNodes(torsoId);
            break;
        }
        case 6: {
            if (posTorso[0] <= -12.0) {
                state++;
                break;
            }
            if (count > 0) {
                count--;
                theta[rightUpperArmId] += 10;
                initNodes(rightUpperArmId);

                theta[rightUpperLegId] -= 10;
                initNodes(rightUpperLegId);

                theta[leftUpperLegId] += 10;
                initNodes(leftUpperLegId);

                theta[leftUpperArmId] -= 10;
                initNodes(leftUpperArmId);
            }
            walk();
            posTorso[0] -= 0.25;
            initNodes(torsoId);
            break;
        }
        case 7: {
            if (theta[torsoId] <= 0.0) {
                state = 0;
                break;
            }

            walk();
            theta[torsoId] -= 10;
            initNodes(torsoId);
            break;
        }
    }
}

function reset(){
    window.location.reload();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    eyeM = vec3(radius * Math.sin(phi), radius * Math.sin(thetas), radius * Math.cos(phi));
    modelViewMatrix = lookAt(eyeM, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    var nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
    gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));

    traverse(torsoId);
    traverse(fenceId);
    traverse(grassId);
    traverse(sunId);

    requestAnimationFrame(render);
}
