SERVER_URI = document.location.protocol + '//' + document.domain;
MAX_REQ_LINE = 20; // request lineの最大表示行数

$(document).ready(function() {
    /**
     */
    function init() {
        setClickHandler();
        var socket = initWSocket();
        setUpdateHandler(socket);
        $('button.ws-reconnect-csc').click(function(){
            socket.disconnect();
            socket = initWSocket();
            socket.socket.connect();
            setUpdateHandler(socket);
        });

        createStatusItems();

        var domainParam = getUrlHashes()['d'];
        if (domainParam) {
            showStatusItem(domainParam, true);
            var el = getStatusElementByDomain(domainParam)
            var label = $('.domain-label-opened-csc', el);
            label.show();
        }

        $('button.auto-expand-csc').click(function(evt){
            var el = $(evt.currentTarget);
            if(el.hasClass('active')){
                el.removeClass('active');
            } else {
                el.addClass('active');
            }
        })
        var heatmap = new HeatMap();
        $('.heatmap-csc')[0].__heatmap__ = heatmap;
    }

    autoExpand = function() {
        return $('button.auto-expand-csc').hasClass('active');
    }

    /**
     * 左ペインのdomain一覧をclickしたとき
     */
    function setClickHandler() {
        $('.domain-csc').each(function(index, el) {
            $(el).click(handleDomainClick);
        });

        $('.list-expand-csc').each(function(index, el) {
            $(el).click(expandAllDomain);
        });
    }

    /**
     * Web Socket の初期化を行い、接続状態を通知するようにする
     */
    function initWSocket() {
        socket = io.connect(SERVER_URI);

        $connectLabel = $('.ws-state-connect-csc');
        $disconnectLabel = $('.ws-state-disconnect-csc');
        connected = function() {
            $connectLabel.show();
            $disconnectLabel.hide();
        }
        disconnected = function() {
            $connectLabel.hide();
            $disconnectLabel.show();
        }

        socket.on('connect', function(){
            connected();
        });
        socket.on('disconnect', function(){
            disconnected();
        });
        socket.on('error', function(){
            disconnected();
        });

        return socket;
    }

    /**
     * 新しくデータが来たらbroadcastされるのでここで受け取っていろいろ処理する
     */
    function setUpdateHandler(socket) {
        socket.on('/updatestatus', function(result) {
            if(autoExpand()) {
                $.each(result.items, function(domain){
                    openDomainStatus(domain);
                })
            }
            addRequestLine(result.items);
        });

        socket.on('/updategraph', function(result) {
            updateGraphs(result);
        });

        socket.on('/updateheat', function(result) {
            $('.heatmap-csc')[0].__heatmap__.update(result);
        });
    }

    /**
     * @param {Event} evt
     */
    function handleDomainClick(evt) {
        var el = $(evt.currentTarget);
        openDomainStatus(el.data('domain'));
    }

    function expandAllDomain() {
        $('.domain-csc').each(function(index, el) {
            openDomainStatus($(el).data('domain'));
        });
    }

    function openDomainStatus(domain) {
        showStatusItem(domain, true);
        var label = $('#list-' + domain + '-csc .domain-label-opened-csc');
        label.show();
    }

    /**
     * 閉じるボタンを押した時
     * @param {Event} evt
     */
    function handleCloseClick(evt) {
        var parentEl = $(evt.currentTarget).parent();
        if (parentEl) {
            parentEl.fadeOut(200);
        }
        var listItem = getListItemByDomain(parentEl.data('domain'));
        $('.domain-label-opened-csc', listItem).hide();
    }

    function createStatusItems() {
        $('.domain-csc').each(function(index, el) {
            createStatusItem($(el).data('domain'));
        });
    }

    /**
     * domainのステータスを右ペインに生成する
     * @param {string} domain
     */
    function createStatusItem(domain) {
        if (isAlreadyRender(domain) || !isChallenger(domain)) {
            return;
        }
        var statusEjs = new EJS({url: '/linker/js/ejs/status.ejs'});
        var statusHtml = statusEjs.render({name: domain});
        var rContainer = $('#right-container-csc');
        var statusEl = $(statusHtml);
        statusEl.hide();
        rContainer.append(statusEl);

        var closeButton = $('.status-close-csc', statusEl);
        closeButton.click(handleCloseClick);

        var graph = new StatGraph(domain);
        graph.render();
        statusEl[0].__graph__ = graph;
    }

    function showStatusItem(domain, visible) {
        var el = getStatusElementByDomain(domain);
        visible ? $(el).show() : $(el).hide();
    }

    function isAlreadyRender(domain) {
        return getStatusElementByDomain(domain).length > 0;
    }

    /**
     * 指定domainが参加者のものならtrue
     * @param {string} domain
     */
    function isChallenger(domain) {
        return getListItemByDomain(domain).length > 0;
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

    function getUrlHashes() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
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
                    var firstLine = reqBox.children().first();

                    if (firstLine && !firstLine.hasClass('even-csc')) {
                        newReqLineEl.addClass('even-csc');
                    }
                    reqBox.prepend(newReqLineEl);
                    if (reqBox.children().length > MAX_REQ_LINE) {
                        reqBox.children().last().remove();
                    }
                });
                updateTimestamp(status, index);
            }

            // 更新が来たらupdateラベルを貼り付け
            var listItem = getListItemByDomain(index);
            var updateLabel = $('.domain-label-update-csc', listItem);
            updateLabel.show();
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
    }

    /**
     * 統計情報を元にグラフをアップデートする
     */
    function updateGraphs(result) {
        var dt = new Date(Date.parse(result.timestamp));

        $.each(result.data, function(index, item) {
            var status = getStatusElementByDomain(index);
            if (status.length < 1) {
                return;
            }

            status[0].__graph__.update(dt, item);
        });
    }

    /**
     * グラフを描画するためのクラス
     */
    var StatGraph = function(domain) {
        this._domain = domain;
        this._data = {
            access: [],
            meanRequestSize: [],
            meanResponseTime: [],
        };
        this._width = 270;
        this._height = 210;
        this._tick_interval = 5 * 1000; // 10[sec]
        this._time_window = 180 * 1000; // 10[min]
        this._paths = {};
    }

    /**
     * グラフを描画する
     */
    StatGraph.prototype.render = function() {
        var el = getStatusElementByDomain(this._domain);
        var graph = el.find('.graph-item-csc');
        this._svg = d3.select("div[id='domain-"+this._domain+"-csc'] .graph-item-csc").append('svg')
            .attr('width', this._width)
            .attr('height', this._height)

        this._svg.append('rect')
            .attr('width', this._width)
            .attr('height', this._height)
            .attr('class', 'graph-bg')

        var access = 'access'
        this._paths[access] = this._svg.append('g')
          .append('path')
            .datum(this._data[access])
            .attr('class', 'line line-access')

        var size = 'meanRequestSize'
        this._paths[size] = this._svg.append('g')
          .append('path')
            .datum(this._data[size])
            .attr('class', 'line line-size')

        var time = 'meanResponseTime';
        this._paths[time] = this._svg.append('g')
          .append('path')
            .datum(this._data[time])
            .attr('class', 'line line-time')

        this.tick('access', [-5, 50]);
        this.tick('meanRequestSize', [-10000, 100000]);
        this.tick('meanResponseTime', [-0.5, 5]);
    }

    /**
     * グラフの内容をアップデート
     */
    StatGraph.prototype.update = function(date, items) {
        $.each(items, function(key, value) {
            this._data[key].push({date: date, value: value})
        }.bind(this));
    }

    /**
     * _ticker_interval ごとにグラフを更新する
     */
    StatGraph.prototype.tick = function(type, yscale) {
        var now = new Date();
        var hourBefore = new Date(now.getTime() - this._time_window);
        var max_height = this._height;

        var x = d3.time.scale()
            .domain([hourBefore, now])
            .range([0, this._width]);

        var y = d3.scale.linear()
            .domain(yscale)
            .range([this._height, 0]);

        var line = d3.svg.line()
            .x(function(d, i) {
                return x(d.date);
            })
            .y(function(d, i) {
                var h = y(d.value);
                if(h < 0) {
                    h = 5;
                }
                return h;
            });

        var translate = -x(new Date(hourBefore.getTime() + this._tick_interval));
        // redraw the line, and slide it to the left
        this._paths[type]
            .attr('d', line)
            .attr('transform', null)
            .transition()
                .duration(this._tick_interval)
                .ease('linear')
                .attr('transform', 'translate(' + translate + ',0)')
                .each('end', this.tick.bind(this, type, yscale));

        var oldLimit = new Date(hourBefore.getTime() - this._tick_interval);
        for(var i=0; i < this._data[type].length; i++) {
            if(this._data[type][0] < oldLimit) {
                l.shift()
            } else {
                break;
            }
        }
    }

    /**
     * HeatMap 描画クラス
     */
    var HeatMap = function() {
        var c = d3.scale.linear()
            .domain([0, 8])
            .range(['#1e90ff', '#dc143c'])
        var colors = $.map(Array(9), function(v, i){
            return c(i);
        })
        this._colorScale = d3.scale.quantile()
            .domain([0, 30])
            .range(colors);
        var colorScale = this._colorScale;

        var gridSize = 35;
        var legendElementWidth = 55;

        var domains = [];
        $('.domain-csc').each(function(index, el) {
            domains.push($(el).data('domain'));
        });
        var initialData = $.map(domains, function(d){
            return {domain: d, accessCount: 0};
        })
        var cols = 14;
        var rows = Math.ceil((initialData.length / cols));

        this._svg = d3.select('.heatmap-csc').append('svg')
            .attr('width', 570)
            .attr('height', 570)
            .append('g')
            .attr('transform', 'translate(10,10)')

        this._heatmap = this._svg.selectAll('.heat-domain')
            .data(initialData, function(d){
                return d.domain;
            })

        var domain = this._heatmap.enter()
            .append('g')
            .attr('class', 'heat-domain')
            .attr('transform', function(d, i){
                var x = (i % cols) * gridSize;
                var y = Math.floor(i / cols) * gridSize;
                return 'translate(' + x + ',' + y + ')';
            })

        this._rect = domain
            .append('rect')
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('width', gridSize)
            .attr('height', gridSize)
            .style('fill', function(d){
                return colorScale(d.accessCount)
            })
            .on('click', function(d){
                openDomainStatus(d.domain);
            })

        domain
            .append('text')
            .attr('class', 'heatmap-tooltip')
            .text(function(d){return d.domain;})

        this._legend = this._svg.selectAll('.legend')
            .data([0].concat(colorScale.quantiles()), function(d) { return d; })
            .enter()
            .append('g')
            .attr('class', 'legend')

        this._legend.append('rect')
            .attr('x', function(d, i) { return legendElementWidth * i; })
            .attr('y', gridSize * (rows + 1))
            .attr('width', legendElementWidth)
            .attr('height', gridSize / 2)
            .style('fill', function(d, i) { return colors[i]; });

        this._legend.append('text')
            .attr('class', 'mono')
            .text(function(d) { return '≥ ' + Math.round(d); })
            .attr('x', function(d, i) { return legendElementWidth * i; })
            .attr('y', gridSize * (rows + 2));
    }

    HeatMap.prototype.update = function(items) {
        var colorScale = this._colorScale;
        this._rect.data(items, function(d){
            return d.domain;
        })
            .transition()
                .duration(1000)
                .style('fill', function(d){
                    return colorScale(d.accessCount)
                })
    }

    init();
});
