/**
 * @fileoverview root controller
 */
module.exports = {
    index: function (req, res) {
        res.view({title: 'CSC Visualizing Monitor', users: sails.config['users']});
    },

    _config: {}
};
