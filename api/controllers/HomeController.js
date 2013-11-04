/**
 * @fileoverview root controller
 */
module.exports = {
    index: function (req, res) {
        // TODO: 参加者のリストをどっかに保存しといてそこから配列にぶっこむ
        var users = [
            {name: 'user1'},
            {name: 'user2'}
        ];
        res.view({users: users});
    },

    _config: {}
};
