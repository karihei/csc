SERVER_URI = 'http://' + document.domain + ':1337';
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

    var sampleHekaData = {results: sampleResult};

    // hekaからのリクエストのモック TODO:あとで消す
    socket.post('/path', sampleHekaData);

    // 新しくデータが来たらbroadcastされるのでここで受け取る
    socket.on('/updatestatus', function(result) {

    });


    $('.domain-csc').each(function(index, el) {
        $(el).click(handleDomainClick);
    });

    /**
     * @param {Event} evt
     */
    function handleDomainClick(evt) {
        showStatusItem($(evt.currentTarget).text());
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
        return $('#'+domain+'-csc').length > 0;
    }
});