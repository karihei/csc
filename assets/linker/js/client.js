SERVER_URI = 'http://' + document.domain + ':1337';
socket = io.connect(SERVER_URI);

$(document).ready(function() {
    socket.get('/dev/getuser', {}, function(user) {
        var statusEjs = new EJS({url: '/linker/js/ejs/status.ejs'});
        var statusHtml = statusEjs.render({name: user.name});
        var rContainer = $('#right-container');
        rContainer.append($(statusHtml));
    });
});