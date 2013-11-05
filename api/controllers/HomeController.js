/**
 * @fileoverview root controller
 */
module.exports = {
    index: function (req, res) {
        res.view({users: sails.config['users']});
    },

    _config: {}
};
