"use strict";

window.onload = function () {

    var canvas;
    var gl;

    var cylinderNumPositions= 96;
    var numPositions = 234;

    var positionsArray = [];
    var normalsArray = [];
    var texCoordsArray = [];
    var tangentsArray = [];
    var emissionsArray = [];

    var barycenterPos;
    var barycenterPositionsArray = [];

    var texSize = 64;

    // Create texture and rough surface
    var data = new Array()
    for (var i = 0; i<= texSize; i++)  data[i] = new Array();
    for (var i = 0; i<= texSize; i++) for (var j=0; j<=texSize; j++)
        data[i][j] = 0.0;
    for (var i = 0; i<= texSize/2; i++) for (var j=0; j<=texSize/2 ; j++)
        data[i][j] = Math.random();
    
    // Bump Map Normals
    var normalst = new Array()
    for (var i=0; i<texSize; i++)  normalst[i] = new Array();
    for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++)
        normalst[i][j] = new Array();
    for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++) {
        normalst[i][j][0] = data[i][j]-data[i+1][j];
        normalst[i][j][1] = data[i][j]-data[i][j+1];
        normalst[i][j][2] = 1;
    }
    
    // Scale to Texture Coordinates
    for (var i=0; i<texSize; i++) for (var j=0; j<texSize; j++) {
        var d = 0;
        for(k=0;k<3;k++) d+=normalst[i][j][k]*normalst[i][j][k];
        d = Math.sqrt(d);
        for(k=0;k<3;k++) normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
    }
    
    // Normal Texture Array
    var normals = new Uint8Array(3*texSize*texSize);
    
    for ( var i = 0; i < texSize; i++ )
        for ( var j = 0; j < texSize; j++ )
            for(var k =0; k<3; k++)
                normals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];
    
    function configureTexture(image) {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    var vertices = [

        //jar vertices
        vec4(0.0, -1.0, 0.0, 1.0),

        vec4(-0.4, -0.15, 0.0, 1.0),
        vec4(-0.2, -0.15, -0.4, 1.0),
        vec4(0.2, -0.15, -0.4, 1.0),
        vec4(0.4, -0.15, 0.0, 1.0),
        vec4(-0.4, 0.1, 0.0, 1.0),
        vec4(-0.2, 0.1, -0.4, 1.0),
        vec4(0.2, 0.1, -0.4, 1.0),
        vec4(0.4, 0.1, 0.0, 1.0),
        vec4(-0.2, 0.2, 0.0, 1.0),
        vec4(-0.2, 0.2, -0.1, 1.0),
        vec4(0.2, 0.2, -0.1, 1.0),
        vec4(0.2, 0.2, 0.0, 1.0),
        vec4(-0.2, 0.3, 0.0, 1.0),
        vec4(-0.2, 0.3, -0.1, 1.0),
        vec4(0.2, 0.3, -0.1, 1.0),
        vec4(0.2, 0.3, 0.0, 1.0), // 16

        vec4(-0.2, -0.15, 0.4, 1.0),
        vec4(0.2, -0.15, 0.4, 1.0),
        vec4(-0.2, 0.1, 0.4, 1.0),
        vec4(0.2, 0.1, 0.4, 1.0),
        vec4(-0.2, 0.2, 0.1, 1.0),
        vec4(0.2, 0.2, 0.1, 1.0),
        vec4(-0.2, 0.3, 0.1, 1.0),
        vec4(0.2, 0.3, 0.1, 1.0), // 24

        //cylinder vertices
        vec4(-0.2, 1.0, 1.0, 1.0),
        vec4(-0.1, 1.2, 1.0, 1.0),
        vec4(-0.0, 1.1, 1.0, 1.0),
        vec4(-0.0, 0.9, 1.0, 1.0),
        vec4(-0.1, 0.8, 1.0, 1.0),
        vec4(-0.3, 0.8, 1.0, 1.0), //30
        vec4(-0.4, 0.9, 1.0, 1.0), //31
        vec4(-0.4, 1.1, 1.0, 1.0),
        vec4(-0.3, 1.2, 1.0, 1.0), //33

        vec4(-0.2, 1.0, -1.0, 1.0),
        vec4(-0.1, 1.2, -1.0, 1.0),
        vec4(-0.0, 1.1, -1.0, 1.0), //36
        vec4(-0.0, 0.9, -1.0, 1.0),
        vec4(-0.2, 0.8, -1.0, 1.0),
        vec4(-0.3, 0.8, -1.0, 1.0),
        vec4(-0.4, 0.9, -1.0, 1.0),
        vec4(-0.4, 1.1, -1.0, 1.0),
        vec4(-0.3, 1.2, -1.0, 1.0),
    ];

    // texture coordinate
    var texCoord = [
        vec2(0, 0),
        vec2(0, 0.5),
        vec2(0.5, 0.5),
        vec2(0.5, 0),

        vec2(0.6, 0.6),
        vec2(0.6, 1),
        vec2(1, 1),
        vec2(1, 0.6),
    ]

    // TRIANGOLE FUNCTION FOR CYLINDER NEON LIGHT
    function tri_cylinder(a, b, c) {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = normalize(cross(t1, t2));
        normal = vec3(normal);
        var tangent = vec3(t1[0], t1[1], t1[2]);

        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[4]);
        emissionsArray.push(vec3(3.0, 3.0, 3.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[b]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[5]);
        emissionsArray.push(vec3(3.0, 3.0, 3.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[6]);
        emissionsArray.push(vec3(3.0, 3.0, 3.0));
        tangentsArray.push(tangent);
    }

    // TRIANGLE FUNCTION FO JAR
    function tri_jar(a, b, c) {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = normalize(cross(t1, t2));
        normal = vec3(normal);
        var tangent = vec3(t1[0], t1[1], t1[2]);

        barycenterPositionsArray.push( vec3(vertices[a][0], vertices[a][1], vertices[a][2]) );
        barycenterPositionsArray.push( vec3(vertices[b][0], vertices[b][1], vertices[b][2]) );
        barycenterPositionsArray.push( vec3(vertices[c][0], vertices[c][1], vertices[c][2]) );

        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[0]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[b]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[1]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[2]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
    }

    // QUAD FUNCTION FOR JAR
    function quad_jar(a, b, c, d) {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = normalize(cross(t1, t2));
        normal = vec3(normal);
        var tangent = vec3(t1[0], t1[1], t1[2]);

        barycenterPositionsArray.push( vec3(vertices[a][0], vertices[a][1], vertices[a][2]) );
        barycenterPositionsArray.push( vec3(vertices[b][0], vertices[b][1], vertices[b][2]) );
        barycenterPositionsArray.push( vec3(vertices[c][0], vertices[c][1], vertices[c][2]) );
        barycenterPositionsArray.push( vec3(vertices[d][0], vertices[d][1], vertices[d][2]) );

        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[0]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[b]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[1]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[2]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[0]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[2]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
        positionsArray.push(vertices[d]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[3]);
        emissionsArray.push(vec3(1.0, 1.0, 1.0));
        tangentsArray.push(tangent);
    }

    // BUILD JAR
    function colorJar() {
        tri_jar(0, 3, 4);
        tri_jar(0, 2, 3);
        tri_jar(0, 1, 2);
        quad_jar(1, 5, 6, 2);
        quad_jar(2, 6, 7, 3);
        quad_jar(3, 7, 8, 4);

        quad_jar(5, 9, 10, 6);
        quad_jar(6, 10, 11, 7);
        quad_jar(12, 8, 7, 11);

        quad_jar(14, 10, 9, 13);
        quad_jar(10, 14, 15, 11);
        quad_jar(11, 15, 16, 12);

        tri_jar(0, 4, 18);
        tri_jar(0, 18, 17);
        tri_jar(0, 17, 1);
        quad_jar(17, 19, 5, 1);
        quad_jar(18, 20, 19, 17);
        quad_jar(4, 8, 20, 18);

        quad_jar(9, 5, 19, 21);
        quad_jar(20, 22, 21, 19);
        quad_jar(8, 12, 22, 20);

        quad_jar(21, 23, 13, 9);
        quad_jar(22, 24, 23, 21);
        quad_jar(24, 22, 12, 16);

        tri_jar(13, 23, 14);
        tri_jar(14, 23, 15);
        tri_jar(15, 23, 24);
        tri_jar(15, 24, 16);

    }

    // BUILD CYLINDER
    function colorcylinder() {
        tri_cylinder(25, 27, 26);
        tri_cylinder(25, 28, 27);
        tri_cylinder(25, 29, 28);
        tri_cylinder(25, 30, 29);
        tri_cylinder(25, 31, 30);
        tri_cylinder(25, 32, 31);
        tri_cylinder(25, 33, 32);
        tri_cylinder(25, 26, 33);

        tri_cylinder(34, 35, 36);
        tri_cylinder(34, 36, 37);
        tri_cylinder(34, 37, 38);
        tri_cylinder(34, 38, 39);
        tri_cylinder(34, 39, 40);
        tri_cylinder(34, 40, 41);
        tri_cylinder(34, 41, 42);
        tri_cylinder(34, 42, 35);

        tri_cylinder(32, 33, 42);
        tri_cylinder(32, 42, 41);
        tri_cylinder(31, 32, 41);
        tri_cylinder(31, 41, 40);
        tri_cylinder(30, 31, 40);
        tri_cylinder(30, 40, 39);

        tri_cylinder(27, 36, 26);
        tri_cylinder(26, 36, 35);
        tri_cylinder(27, 37, 36);
        tri_cylinder(27, 28, 37);
        tri_cylinder(28, 29, 38);
        tri_cylinder(28, 38, 37);

        tri_cylinder(33, 26, 42);
        tri_cylinder(42, 26, 35);
        tri_cylinder(30, 39, 29);
        tri_cylinder(39, 38, 29);
    }

    // SETTING OF SOME USEFUL VARIABLE
    var dX = 0.3;
    var dY = -0.2;
    var dZ = 0.0;

    var eye;
    var at = vec3(0.0, 0.5, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    var radius = 4.0;
    var theta = 10 * Math.PI / 180.0;
    var phi = -145 * Math.PI / 180.0;

    var near = 0.3;
    var far = 10.0;

    var fovy = 45.0;
    var aspect = 1.0;

    var turn_on_light = false;
    var vertex_fragment = false;

    // First light
    var lightPosition_one = vec4(-0.2, 1.0, 0.5, 1.0);
    var lightAmbient_one = vec4(0.2, 0.0, 0.2, 1.0);
    var lightDiffuse_one = vec4(0.9, 0.9, 0.9, 1.0);
    var lightSpecular_one = vec4(0.5, 0.5, 0.5, 1.0);

    // Second light
    var lightPosition_two = vec4(-0.2, 1.0, 0.0, 1.0);
    var lightAmbient_two = vec4(0.2, 0.0, 0.2, 1.0);
    var lightDiffuse_two = vec4(0.9, 0.9, 0.9, 1.0);
    var lightSpecular_two = vec4(0.5, 0.5, 0.5, 1.0);

    // Third light
    var lightPosition_three = vec4(-0.2, 1.0, -0.5, 1.0);
    var lightAmbient_three = vec4(0.2, 0.0, 0.2, 1.0);
    var lightDiffuse_three = vec4(0.9, 0.9, 0.9, 1.0);
    var lightSpecular_three = vec4(0.5, 0.5, 0.5, 1.0);

    // Material settings
    var materialAmbient = vec4(0.8, 0.3, 0.4, 1.0);
    var materialDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
    var materialSpecular = vec4(0.2, 0.2, 0.2, 1.0);
    var materialShininess = 1.0;

    var modelViewMatrix, projectionMatrix;
    var program;

    var xAxis = 0;
    var yAxis = 1;
    var zAxis = 2;
    var axis = 0;
    var theta1 = vec3(0, 0, 0);

    var flag = false;
    var enableTexture = false;

    colorcylinder();
    colorJar();

    // Barycenter computation
    barycenterPos = vec3(0.0, 0.0, 0.0);
    var numPos = 0;

    for(var i = 0; i < barycenterPositionsArray.length; i++){
        barycenterPos = add(barycenterPos, barycenterPositionsArray[i]);
        numPos++;
    }
    barycenterPos = vec3(barycenterPos[0]/numPos, barycenterPos[1]/numPos, barycenterPos[2]/numPos)

    init();

    render();

    function init() {
        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        if (vertex_fragment == true) {
            program = initShaders(gl, "vertex-shader_per-fragment", "fragment-shader_per-fragment");
            gl.useProgram(program);
        } else {
            program = initShaders(gl, "vertex-shader_per-vertex", "fragment-shader_per-vertex");
            gl.useProgram(program);
        }

        configureTexture(normals);

        document.getElementById("ButtonX").onclick = function () { axis = xAxis; };
        document.getElementById("ButtonY").onclick = function () { axis = yAxis; };
        document.getElementById("ButtonZ").onclick = function () { axis = zAxis; };
        document.getElementById("ButtonT").onclick = function () { flag = !flag; };
        document.getElementById("EnableTexture").onclick = function () {
            enableTexture = !enableTexture;
            gl.uniform1f(gl.getUniformLocation(program, "uTextureFlag"), enableTexture);
        };

        document.getElementById("directionX").onchange = function (event) {
            dX = parseFloat(event.target.value);
        };
        document.getElementById("directionY").onchange = function (event) {
            dY = parseFloat(event.target.value);
        };
        document.getElementById("directionZ").onchange = function (event) {
            dZ = parseFloat(event.target.value);
        };

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
            theta = parseFloat(event.target.value * Math.PI / 180.0);
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

        document.getElementById("Light").onclick = function () {
            turn_on_light = !turn_on_light;
            gl.uniform1i(gl.getUniformLocation(program, "uLightFlag"), turn_on_light);
        };

        document.getElementById("VertexFragment").onclick = function () {
            vertex_fragment = !vertex_fragment;
            init();
        };

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

        var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLoc);

        var aBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(tangentsArray), gl.STATIC_DRAW);

        var tangentLoc = gl.getAttribLocation(program, "aTangent");
        gl.vertexAttribPointer(tangentLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tangentLoc);

        var eBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, eBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(emissionsArray), gl.STATIC_DRAW);

        var emissionLoc = gl.getAttribLocation(program, "aEmission");
        gl.vertexAttribPointer(emissionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(emissionLoc);

        var ambientProduct_one = mult(lightAmbient_one, materialAmbient);
        var diffuseProduct_one = mult(lightDiffuse_one, materialDiffuse);
        var specularProduct_one = mult(lightSpecular_one, materialSpecular);

        var ambientProduct_two = mult(lightAmbient_two, materialAmbient);
        var diffuseProduct_two = mult(lightDiffuse_two, materialDiffuse);
        var specularProduct_two = mult(lightSpecular_two, materialSpecular);

        var ambientProduct_three = mult(lightAmbient_three, materialAmbient);
        var diffuseProduct_three = mult(lightDiffuse_three, materialDiffuse);
        var specularProduct_three = mult(lightSpecular_three, materialSpecular);

        gl.uniform1f(gl.getUniformLocation(program, "uTextureFlag"), enableTexture);
        gl.uniform1i(gl.getUniformLocation(program, "uLightFlag"), turn_on_light);
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition_one"), lightPosition_one);
        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct_one"), ambientProduct_one);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct_one"), diffuseProduct_one);
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct_one"), specularProduct_one);
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition_two"), lightPosition_two);
        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct_two"), ambientProduct_two);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct_two"), diffuseProduct_two);
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct_two"), specularProduct_two);
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition_three"), lightPosition_three);
        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct_three"), ambientProduct_three);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct_three"), diffuseProduct_three);
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct_three"), specularProduct_three);
        gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (flag) theta1[axis] += 2.0;

        eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), radius*Math.cos(phi));
        projectionMatrix = perspective(fovy, aspect, near, far);
        modelViewMatrix = lookAt(eye, at, up);
        var nMatrix = normalMatrix(modelViewMatrix, true);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
        gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));

        var moveMatrix = mat4();

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMoveMatrix"), false, flatten(moveMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, cylinderNumPositions);

        moveMatrix = mult(moveMatrix, rotate(theta1[xAxis], vec3(1, 0, 0)));
        moveMatrix = mult(moveMatrix, rotate(theta1[yAxis], vec3(0, 1, 0)));
        moveMatrix = mult(moveMatrix, rotate(theta1[zAxis], vec3(0, 0, 1)));
        moveMatrix[0][3] = dX;
        moveMatrix[1][3] = dY;
        moveMatrix[2][3] = dZ;
        moveMatrix = mult(translate(barycenterPos[0], barycenterPos[1], barycenterPos[2]), moveMatrix);
        moveMatrix = mult(moveMatrix, translate(-barycenterPos[0], -barycenterPos[1], -barycenterPos[2]));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMoveMatrix"), false, flatten(moveMatrix));

        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLES, cylinderNumPositions, numPositions);

        requestAnimationFrame(render);
    }
}