/**
 * @fileoverview root controller
 */
module.exports = {
    index: function (req, res) {
        res.view({hello: 'hoge'});
    },

    _config: {}
};
