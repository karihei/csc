/**
 * HeatController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

   index: function (req, res) {
       // API
       // $B$+$iEO$C$F$-$?(Bdomain$B$4$H$NE}7W>pJs$r4^$a$?%*%V%8%'%/%H(B
       // [{'domain': 'a.com', accessRate: 10.2}, ...}}
       // $B$_$?$$$J46$8$GMh$k!#(B
       sails.config['sockets'].broadcast('/updateheat', req.body);
       res.send(); // return 204
   },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HeatController)
   */
  _config: {}

  
};
