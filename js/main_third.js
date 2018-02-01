// zmienne globalne
var gl_canvas;
var gl_ctx;  
var _position;
var _triangleVertexBuffer; 
var _triangleFacesBuffer;
var _color;
//zmienne od Matrixa
var _PosMatrix; 
var _MovMatrix; 
var _ViewMatrix; 
var _matrixProjection; 
var _matrixMovement; 
var _matrixView;  

var rotationSpeed = 0.0005; 
var zoomRatio = -6;
var X, Y, Z;

var wasInvoked = false;
var elementsCount = 0;

var depth = 3;
var perturb = 5;
// funkcja główna 
function runWebGL () {
    getRotation();
   gl_canvas = document.getElementById("glcanvas");    
   gl_ctx = gl_getContext(gl_canvas);    
    gl_initShaders();    
    gl_initBuffers();
    gl_setMatrix();   
    gl_draw();
 }  

 // osie obrotu

function getRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
 }

// pobranie kontekstu WebGL

function gl_getContext (canvas) {    
    try {      
        var ctx = canvas.getContext("webgl");
        ctx.viewportWidth = canvas.width;      
        ctx.viewportHeight = canvas.height;    

    } catch (e) {}    
    if (!ctx) {      
        document.write('Nieudana inicjalizacja kontekstu WebGL.')    
    }    
    return ctx;

}
// shadery
function gl_initShaders () {
    var vertexShader = "\n\
    attribute vec3 position;\n\
    uniform mat4 PosMatrix;\n\
    uniform mat4 MovMatrix;\n\
    uniform mat4 ViewMatrix; \n\
    attribute vec3 color;\n\
    varying vec3 vColor;\n\
    void main(void) {\n\
       gl_Position = PosMatrix * ViewMatrix * MovMatrix * vec4(position, 1.);\n\
       vColor = color;\n\
    }";   
 

    var fragmentShader = "\n\
    precision mediump float;\n\
    varying vec3 vColor;\n\
    void main(void) {\n\
       gl_FragColor = vec4(vColor, 1.);\n\
    }";
 
  
    var getShader = function(source, type, typeString) {
        var shader = gl_ctx.createShader(type);
        gl_ctx.shaderSource(shader, source);
        gl_ctx.compileShader(shader);
         if (!gl_ctx.getShaderParameter(shader, gl_ctx.COMPILE_STATUS)) {
           alert('error in' + typeString);
           return false;
        }
        return shader;
     };
  
     var shader_vertex = getShader(vertexShader, gl_ctx.VERTEX_SHADER, "VERTEX");
     var shader_fragment = getShader(fragmentShader, gl_ctx.FRAGMENT_SHADER, "FRAGMENT");
     var shaderProgram = gl_ctx.createProgram();

     gl_ctx.attachShader(shaderProgram, shader_vertex);
     gl_ctx.attachShader(shaderProgram, shader_fragment);

     gl_ctx.linkProgram(shaderProgram);
  
     _PosMatrix = gl_ctx.getUniformLocation(shaderProgram, "PosMatrix");
     _MovMatrix = gl_ctx.getUniformLocation(shaderProgram, "MovMatrix");
     _ViewMatrix = gl_ctx.getUniformLocation(shaderProgram, "ViewMatrix");
  
     _position = gl_ctx.getAttribLocation(shaderProgram, "position");
     _color = gl_ctx.getAttribLocation(shaderProgram, "color");
     gl_ctx.enableVertexAttribArray(_position);
     gl_ctx.enableVertexAttribArray(_color);
     gl_ctx.useProgram(shaderProgram);
 }

function pyramid(vertices, faces, depth, left, right, z,y)
{
    var length = (right - left);

    if(depth == 1)
    {
        var firstIndex1 = vertices.length / 6;
        //LEFT
        vertices.push(left + ( (Math.random() - 0.5) * length / perturb));
        vertices.push(y + ( (Math.random() - 0.5) * length / perturb));
        vertices.push(z+ ( (Math.random() - 0.5) * length / perturb));

        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(Math.random());

        //RIGHT
        vertices.push(right+ ( (Math.random() - 0.5) * length / perturb));
        vertices.push(y+ ( (Math.random() - 0.5) * length / perturb));
        vertices.push(z+ ( (Math.random() - 0.5) * length / perturb));

        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(Math.random());

        //DEPTH
        vertices.push( left + (length / 2) + ( (Math.random() - 0.5) * length / perturb));
        vertices.push(y)+ ( (Math.random() - 0.5) * length / perturb);
        vertices.push(z + Math.sqrt(3) / 2 * length + ( (Math.random() - 0.5) * length / perturb));

        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(Math.random());

        //TOP
        vertices.push(left + (length / 2) + ( (Math.random() - 0.5) * length / perturb));
        vertices.push(y + Math.sqrt(6) / 3 * length + ( (Math.random() - 0.5) * length / perturb));
        vertices.push(z + 1/3 * Math.sqrt(3) / 2* length + ( (Math.random() - 0.5) * length / perturb));

        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(Math.random());

        

                    faces.push(firstIndex1);
                    faces.push(firstIndex1 + 1);
                    faces.push(firstIndex1 + 3);

                    faces.push(firstIndex1 + 1);
                    faces.push(firstIndex1 + 2);
                    faces.push(firstIndex1 + 3);

                    faces.push(firstIndex1 + 2);
                    faces.push(firstIndex1 );
                    faces.push(firstIndex1  + 3);

                    faces.push(firstIndex1 + 0);
                    faces.push(firstIndex1 + 1);
                    faces.push(firstIndex1 + 2);
    }
    else{
        //LEFT
        pyramid(vertices, faces, depth - 1, left, left + (length / 2), z, y);
        //RIGHT
        pyramid(vertices, faces, depth - 1, left + (length / 2) ,right, z, y);
        //DEPTH
        pyramid(vertices, faces, depth - 1, left + (length / 4), right - (length / 4), z + (Math.sqrt(3) / 2 * length / 2), y);
        //TOP
        pyramid(vertices, faces, depth - 1, left + (length / 4), right - (length / 4), z + (1 / 3 * Math.sqrt(3) / 2 * length / 2) , y + (Math.sqrt(6) / 3 * length / 2));
    }

}

 // bufory
function gl_initBuffers () {    
    /*var triangleVertices = [
       -1, 0, 0,
        0, 1, 0,

        1, 0, 0,
        1, 0, 0,

        0, 0, 1*Math.sqrt(3),
        0, 0, 1,

        0, 2*Math.sqrt(6)/3, 1/3*Math.sqrt(3), 
        1, 1, 1,
     ];

     var triangleFaces = [
        0, 1, 3,
        1, 2, 3,
        2, 0, 3,
        0, 1, 2
     ];*/

    
     depth = parseInt($("#depth").val());
     perturb = parseInt($("#pertubation").val());

      var triangleVertices = [];
      var triangleFaces = [];
      pyramid(triangleVertices, triangleFaces, depth, -2, 2, 0, -1);
      elementsCount = triangleFaces.length;
  
    _triangleVertexBuffer = gl_ctx.createBuffer();    
    gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);    
    gl_ctx.bufferData(gl_ctx.ARRAY_BUFFER,                      
                      new   Float32Array(triangleVertices), 
                      gl_ctx.STATIC_DRAW);     
  

                     
    _triangleFacesBuffer = gl_ctx.createBuffer();    
    gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);
    gl_ctx.bufferData(gl_ctx.ELEMENT_ARRAY_BUFFER,                      
                      new Uint16Array(triangleFaces),                      
                      gl_ctx.STATIC_DRAW); 
  }

  // Macierz 
function gl_setMatrix () {    
    _matrixProjection = MATRIX.getProjection(40,  gl_canvas.width/gl_canvas.height, 1, 100);    
    _matrixMovement = MATRIX.getIdentityMatrix();    
    _matrixView = MATRIX.getIdentityMatrix();    
    MATRIX.translateZ(_matrixView, zoomRatio);
 }

  // rysowanie 
function gl_draw() {
    gl_ctx.clearColor(0.0, 0.0, 0.0, 0.0);
   gl_ctx.enable(gl_ctx.DEPTH_TEST);
   gl_ctx.depthFunc(gl_ctx.LEQUAL);
   gl_ctx.clearDepth(1.0);

   var timeOld = 0;
    var animate = function (time) {
      var dAngle = rotationSpeed * (time - timeOld);
      if (X) {
         MATRIX.rotateX(_matrixMovement, dAngle);
      }
      if (Y) {
         MATRIX.rotateY(_matrixMovement, dAngle);
      }
      if (Z) {
         MATRIX.rotateZ(_matrixMovement, dAngle);
      }
      timeOld = time;

      gl_ctx.viewport(0.0, 0.0, gl_canvas.width, gl_canvas.height);
      gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT | gl_ctx.DEPTH_BUFFER_BIT);  

      gl_ctx.uniformMatrix4fv(_PosMatrix, false, _matrixProjection);
      gl_ctx.uniformMatrix4fv(_MovMatrix, false, _matrixMovement);
      gl_ctx.uniformMatrix4fv(_ViewMatrix, false, _matrixView);

      gl_ctx.vertexAttribPointer(_position, 3, gl_ctx.FLOAT, false, 4*(3+3), 0);
      gl_ctx.vertexAttribPointer(_color, 3, gl_ctx.FLOAT, false, 4*(3+3), 3*4);

      gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);
      gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);
      gl_ctx.drawElements(gl_ctx.TRIANGLES, elementsCount  , gl_ctx.UNSIGNED_SHORT, 0);
      gl_ctx.flush();

      window.requestAnimationFrame(animate);

   };
    if(wasInvoked == false)
    {
        animate(0);
        wasInvoked = true;
    }
}