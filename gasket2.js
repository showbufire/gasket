
var canvas;
var gl;

var points = [];

window.onload = function() {
    initgl();
    $("#level").change(redraw);
    $("#angle").change(redraw);
    redraw();
}

function initgl() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
}

function redraw() {
    level = $("#level").val();
    angle = $("#angle").val() / 360 * Math.PI;
    draw(parseInt(level), angle);
}

function draw(level, angle) {
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    var vertices = [
        vec2( -.7, -.7 ),
        vec2(  0,  .7 ),
        vec2(  .7, -.7 )
    ];

    points = [];
    divideTriangle(
	vertices[0],
	vertices[1],
	vertices[2],
        level,
	angle);

    // Load the data into the GPU

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function rotate(p, angle) {
    d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    theta = angle * d
    return vec2(p[0] * Math.cos(theta) - p[1] * Math.sin(theta),
		p[0] * Math.sin(theta) + p[1] * Math.cos(theta));
}

function triangle( a, b, c, angle ) {
    points.push( rotate(a, angle), rotate(b, angle), rotate(c, angle) );
}

function divideTriangle( a, b, c, count, angle ) {

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c, angle );
    }
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count, angle);
        divideTriangle( c, ac, bc, count, angle);
        divideTriangle( b, bc, ab, count, angle);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

