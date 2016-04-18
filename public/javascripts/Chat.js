var socket1 = io();
var room = window.location.pathname.split("/")[2];
$("#send").click(function() {
    socket1.emit('chat', $("#message").val(),room);
    $("#message").val('');
    return false;
});
socket1.on('chat', function(msg) {
    var date = new Date($.now());
    var time = date.getHours() + ":" + date.getMinutes();
    $('#chatbox').append($('<hr><div class="row"><div class="col-lg-12"><div class="media"><a class="pull-left" href="#">' +
        '<img class="media-object img-circle" src="/icon/user.png" alt=""></a><div class="media-body">' +
        '<h4 class="media-heading">User<span class="small pull-right">' + time + '</span></h4><p style=" word-wrap: break-word; width:200px">' + msg +
        '</p></div></div></div></div>'));
    m = document.getElementById('chatbox');
    m.scrollTop = m.offsetHeight;
});
