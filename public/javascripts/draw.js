var path;
var room = window.location.pathname.split("/")[2];
var socket = io();
var path_to_send = {};
var external_paths = {};
var timer_is_active = false;
var send_paths_timer;
var mouseTimer = 0;
var mouseHeld;
var paper_object_count = 1;
var active_color = '#00000';
var tools = {
    "active_tool": "drawing",
    "strokeWidth": 2
};
var uid = (function() {
    var S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}());


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function onMouseDown(event) {
    console.log("sd");

    var active_color = document.getElementById("chosen-value").value;
    if (document.getElementById("tools").value != "{}") {
        tools = JSON.parse(document.getElementById("tools").value);
    }
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
    if (tools.active_tool == "drawing") {
        path.strokeWidth = tools.pencilstrokeWidth;
        path.strokeColor = active_color;
    } else if (tools.active_tool == "erasing") {
        path.strokeColor = $('#canvasContainer').css("background-color");
        active_color = $('#canvasContainer').css("background-color");
        path.strokeWidth = tools.eraserstrokeWidth;
        //tools.strokeWidth = tools.strokeWidth;
    }
    path.add(event.point);
    path.name = uid + ":" + (++paper_object_count);
    view.draw();
    path_to_send = {
        name: path.name,
        rgba: active_color,
        start: event.point,
        tools: tools,
        path: []
    };
}

function onMouseDrag(event) {
    mouseTimer = 0;
    clearInterval(mouseHeld);
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

function clearCanvas() {
    // Remove all but the active layer
    if (project.layers.length > 1) {
        var activeLayerID = project.activeLayer._id;
        for (var i = 0; i < project.layers.length; i++) {
            if (project.layers[i]._id != activeLayerID) {
                project.layers[i].remove();
                i--;
            }
        }
    }
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
    console.log(sessionId);
    var path = external_paths[sessionId];
    if (!path) {
        external_paths[sessionId] = new Path();
        path = external_paths[sessionId];
        var start_point = new Point(points.start.x, points.start.y);
        //var color = ;
        path.add(start_point);
        path.strokeColor = points.rgba;
        if (tools.active_tool == "drawing") {
            path.strokeWidth = points.tools.pencilstrokeWidth;
        } else if (tools.active_tool == "erasing") {
            path.strokeWidth = points.tools.eraserstrokeWidth;
        }
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

socket.emit('subscribe', room);


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

$("#send").click(function() {
    socket.emit('chat', $("#message").val(), room);
    $("#message").val('');
    return false;
});
socket.on('chat', function(msg) {
    var date = new Date($.now());
    var time = date.getHours() + ":" + date.getMinutes();
    $('#chatbox').append($('<hr><div class="row"><div class="col-lg-12"><div class="media"><a class="pull-left" href="#">' +
        '<img class="media-object img-circle" src="/icon/user.png" alt=""></a><div class="media-body">' +
        '<h4 class="media-heading">User<span class="small pull-right">' + time + '</span></h4><p style=" word-wrap: break-word; width:200px">' + msg +
        '</p></div></div></div></div>'));
    m = document.getElementById('chatbox');
    m.scrollTop = m.offsetHeight;
});
