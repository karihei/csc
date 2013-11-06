// heka から叩かれるAPI
module.exports = {

   index: function (req, res) {
       // API から渡ってきたPathとかdomainとかを含めた配列
       // [{domain:'a.com',path:'/k'}, {domain:'a.com', path:'/k'}...]
       // みたいな感じで来るからdomainごとにデータをまとめる
       var items = req.param('items');
       var obj = {};
       $.each(items, function(index, item) {
           var value = {path: item.path};
           if (!obj[item.domain]) {
               obj[item.domain] = [value];
           } else {
               obj[item.domain].push(value);
           }
       });

       req.socket.emit('/updatestatus', {items: obj});
   },
    _config: {}
};
