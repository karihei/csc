SERVER_URI = document.location.protocol + '//' + document.domain + ':' + document.location.port;
socket = io.connect(SERVER_URI);

$(document).ready(function() {
    init();

    /**
     */
    function init() {
        setClickHandler();
        setUpdateHandler();
    }

    /**
     * 左ペインのdomain一覧をclickしたとき
     */
    function setClickHandler() {
        $('.domain-csc').each(function(index, el) {
            $(el).click(handleDomainClick);
        });
    }

    /**
     * 新しくデータが来たらbroadcastされるのでここで受け取っていろいろ処理する
     */
    function setUpdateHandler() {
        socket.on('/updatestatus', function(result) {
            addRequestLine(result.items);
        });
    }

    /**
     * @param {Event} evt
     */
    function handleDomainClick(evt) {
        var el = $(evt.currentTarget);
        showStatusItem(el.data('domain'));
        var label = $('.domain-label-csc', el);
        label.show();
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
        var rContainer = $('#right-container-csc');
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

    /**
     * 左ペインのdomain一覧から対象domainのElementを返す
     */
    function getListItemByDomain(domain) {
        return $("li[id='list-"+domain+"-csc']");
    }

    /**
     * 飛んできたリクエストを各domainのreq-lineに追加する。
     */
    function addRequestLine(items) {
        $.each(items, function(index, item) {
            var status = getStatusElementByDomain(index);
            if (status.length == 1) {
                var reqBox = $('.req-item-csc', status);
                $('.req-empty-csc', status).remove();

                $.each(item, function(i, p) {
                    var newReqLineEl = $('<div/>').text(p.path).addClass('req-line-csc');
                    if (reqBox.children().length % 2 == 0) {
                        newReqLineEl.addClass('even-csc');
                    }
                    reqBox.prepend(newReqLineEl);
                });
                updateTimestamp(status, index);
            }
        });
    }

    /**
     * timestampを更新する。ついでにiconをピカーンとさせる。
     * @param {Element} el
     * @param {string} domain
      */
    function updateTimestamp(el, domain) {
        var datetime = new Date($.now()).toLocaleString();
        $('.status-datetime-value-csc', el).text(datetime);
        var icon = $('.status-datetime-icon-csc', el);
        icon.show().fadeOut(1000, 'swing');

/*
var listItem = getListItemByDomain(domain);
        var domainLabel = $('.domain-label-csc', listItem);
        domainLabel.removeClass('label-info').addClass('label-warning').text('Updated').delay(1000, function(){
            debugger;
            domainLabel.removeClass('label-warning').addClass('label-info').text('Opened');
        });*/

    }
});