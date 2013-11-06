SERVER_URI = document.location.protocol + '//' + document.domain + ':' + document.location.port;
socket = io.connect(SERVER_URI);

$(document).ready(function() {
    var sampleDomains = ['karix.jp', 'hagix.jp', 'hagihara.com', 'karikawa.com', 'csc.jp', 'hoge.com'];
    var sampleResult = [];

    $.each(sampleDomains, function(index, domain) {
        sampleResult = $.merge(sampleResult, [
            {domain: domain, path: '/k/10'},
            {domain: domain, path: '/k/12'},
            {domain: domain, path: '/k/admin/app/flow?app=1'},
            {domain: domain, path: '/k/admin/app/general?app=11'},
            {domain: domain, path: '/k/m/10'},
            {domain: domain, path: '/k/#/space/1/21'}
        ]);
    });

    var sampleHekaData = {items: sampleResult};

    // hekaからのリクエストのモック TODO:あとで消す
    var mockF = function() {
        socket.post('/path', sampleHekaData);
    };
    setInterval(mockF, 5000);

    // 新しくデータが来たらbroadcastされるのでここで受け取る
    socket.on('/updatestatus', function(result) {
        $.each(result.items, function(index, item) {
            var status = getStatusElementByDomain(index);
            if (status.length == 1) {
                var reqBox = $('.req-item-csc', status);
                $.each(item, function(i, p) {
                    var newReqLineEl = $('<div/>').text(p.path);
                    reqBox.prepend(newReqLineEl);
                });

            }
        });
    });


    $('.domain-csc').each(function(index, el) {
        $(el).click(handleDomainClick);
    });

    /**
     * @param {Event} evt
     */
    function handleDomainClick(evt) {
        var el = $(evt.currentTarget);
        showStatusItem(el.data('domain'));
    }

    /**
     * domainのステータスを右ペインに生成する
     * @param {string} domain
     */
    function showStatusItem(domain) {
        if (isAlreadyRender(domain)) {
            return;
        }
        var statusEjs = new EJS({url: '/linker/js/ejs/status.ejs'});
        var statusHtml = statusEjs.render({name: domain});
        var rContainer = $('#right-container');
        rContainer.append($(statusHtml));
    }

    function isAlreadyRender(domain) {
        return getStatusElementByDomain(domain).length > 0;
    }

    /**
     * domainのstatusElを返す
     * idにドットを含んでるとややこしい記法になるよ
     * @param {string} domain
     * @return {Array}
     */
    function getStatusElementByDomain(domain) {
        return $("div[id='domain-"+domain+"-csc']");
    }
});