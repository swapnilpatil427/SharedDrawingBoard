
// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger than this

var myPath;

// Returns an object specifying a semi-random color
// The color will always have a red value of 0
// and will be semi-transparent (the alpha value)
function randomColor() {

  return {
    red: 0,
    green: Math.random(),
    blue: Math.random(),
    alpha: ( Math.random() * 0.25 ) + 0.05
  };

}

function onMouseDown(event) {
    myPath = new Path();
    myPath.strokeColor = '#00000';
    myPath.strokeWidth = 1;
    myPath.add(event.point);
    view.draw();
}

function onMouseDrag(event) {
    var step = event.delta / 2;
    step.angle += 90;
    var top = event.middlePoint
    var bottom = event.middlePoint;
    myPath.fullySelected = true;
    myPath.add(top);
    myPath.insert(0, bottom);
    view.draw();
}

function onMouseUp(event) {
    myPath.add(event.point);
    myPath.selected = false;
	myPath.smooth();
}

function drawCircle( x, y, radius, color ) {

  // Render the circle with Paper.js
  var circle = new Path.Circle( new Point( x, y ), radius );
  circle.fillColor = new RgbColor( color.red, color.green, color.blue, color.alpha );

  // Refresh the view, so we always get an update, even if the tab is not in focus
  view.draw();
}


// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitCircle( x, y, radius, color ) {

  // Each Socket.IO connection has a unique session id
  var sessionId = io.socket.sessionid;

  // An object to describe the circle's draw data
  var data = {
    x: x,
    y: y,
    radius: radius,
    color: color
  };

  // send a 'drawCircle' event with data and sessionId to the server
  io.emit( 'drawCircle', data, sessionId )

  // Lets have a look at the data we're sending
  console.log( data )

}


// Listen for 'drawCircle' events
// created by other users
io.on( 'drawCircle', function( data ) {

  console.log( 'drawCircle event recieved:', data );

  // Draw the circle using the data sent
  // from another user
  drawCircle( data.x, data.y, data.radius, data.color );

})
