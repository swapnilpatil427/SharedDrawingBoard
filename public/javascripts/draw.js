var path;

var socket = io();
var path_to_send = {};
var room = 'swapnil';
var external_paths = {};
var timer_is_active = false;
var send_paths_timer;
var mouseTimer = 0;
var mouseHeld;
var paper_object_count = 1;
var uid = (function() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}());

function onMouseDown(event) {
    mouseTimer = 0;
    mouseHeld = setInterval(function() {
    mouseTimer++;
        if (mouseTimer > 3) {
          mouseTimer = 0;
          clearInterval(mouseHeld);
        }
    }, 100);
    var point = event.point;
    path = new Path();
    path.strokeColor = '#00000';
    path.strokeWidth = 2;
    path.add(event.point);
    path.name = uid + ":" + (++paper_object_count);
    view.draw();
    path_to_send = {
      name: path.name,
      rgba: '#00000',
      start: event.point,
      path: []
    };
}

function onMouseDrag(event) {
    mouseTimer = 0;
    clearInterval(mouseHeld);
    var step = event.delta / 2;
    step.angle += 90;
    var top = event.middlePoint;
    var bottom = event.middlePoint;
    path.add(top);
    path.insert(0, bottom);
    path.smooth();
    view.draw();
    path_to_send.path.push({
      top: top,
      bottom: bottom
    });
    if (!timer_is_active) {
        send_paths_timer = setInterval(function() {
        socket.emit('draw:progress', room, uid, JSON.stringify(path_to_send));
        path_to_send.path = new Array();
    }, 100);
    }

    timer_is_active = true;
}


function onMouseUp(event) {
    if (event.event.button == 1 || event.event.button == 2) {
        return;
    }
    clearInterval(mouseHeld);
    path.add(event.point);
    path.closed = true;
    path.smooth();
    view.draw();
    path_to_send.end = event.point;
    socket.emit('draw:progress', room, uid, JSON.stringify(path_to_send));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));
    path_to_send.path = new Array();
    path = new Path();
    clearInterval(send_paths_timer);
    timer_is_active = false;
}

var end_external_path = function(points, sessionId) {
    var mypath = external_paths[sessionId];
    if (mypath) {
        mypath.add(new Point(points.end.x, points.end.y));
        mypath.closed = true;
        mypath.smooth();
        view.draw();
        external_paths[sessionId] = false;
    }
};

progress_external_path = function(points, sessionId) {
    var path = external_paths[sessionId];
    if (!path) {
        external_paths[sessionId] = new Path();
        path = external_paths[sessionId];
        var start_point = new Point(points.start.x, points.start.y);
        var color = new RgbColor(points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity);
        path.strokeColor = color;
        path.strokeWidth = 2;
        path.name = points.name;
        view.draw();
    }

    var paths = points.path;
    var length = paths.length;
    for (var i = 0; i < length; i++) {
        path.add(new Point(paths[i].top.x, paths[i].top.y));
        path.insert(0, new Point(paths[i].bottom.x, paths[i].bottom.y));
    }

    path.smooth();
    view.draw();
};


socket.on('draw:progress', function(sessionId, data) {
    if (sessionId !== uid && data) {
        progress_external_path(JSON.parse(data), sessionId);
    }
});

socket.on('draw:end', function(sessionId, data) {
    if (sessionId !== uid && data) {
        end_external_path(JSON.parse(data), sessionId);
    }
});
