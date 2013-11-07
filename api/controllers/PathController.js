// heka から叩かれるAPI
module.exports = {

   index: function (req, res) {
       // API から渡ってきたPathとかdomainとかを含めた配列
       // [{domain:'a.com',path:'/k'}, {domain:'a.com', path:'/k'}...]
       // みたいな感じで来るからdomainごとにデータをまとめる
       var items = req.param('items');
       var obj = {};
       for(var i=0;i<items.length;i++){
           var item = items[i];
           var value = {path: item.path};
           if (!obj[item.domain]) {
               obj[item.domain] = [value];
           } else {
               obj[item.domain].push(value);
           }
       }
       sails.config['sockets'].broadcast('/updatestatus', {items: obj});
       res.send(); // return 204
   },
    _config: {}
};
