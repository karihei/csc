SERVER_URI = 'http://' + document.domain + ':8080';
socket = io.connect(SERVER_URI);

$(document).ready(function() {
    socket.emit('getuser');

    socket.on('getuser result', function(result) {
        var statusEjs = new EJS({url: '/linker/js/ejs/status.ejs'});
        var statusHtml = statusEjs.render({name: 'user1'});
        var rContainer = $('#right-container');
        rContainer.append($(statusHtml));
    });
});