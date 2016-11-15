var _ = require('lodash');
var util = require('util');


var defaultConfig = {
  adminPath: '/admin',
  locals: {
    title: 'NGAdmin',
    _: _,
    sails: null,
  },
};

module.exports = function (sails) {
  return {
    initialize: function(cb) {
      sails.log('sails-hook-ng-admin:initialize');

      sails.config.admin = _.merge(defaultConfig, sails.config.admin);

      sails.log('config: '+ JSON.stringify(sails.config.admin));

      return cb();
    },
    routes: {
      after: require('./config/routes')(sails.config.admin)
    }
  };
};

function prepareExtendedAttrs() {
  //This adds the validation function cms as [model].type = cms = function(){}
  //This is to prevent
  for (var key in sails.models) {
    if (sails.models.hasOwnProperty(key)) {
      if(!sails.models[key].types) sails.models[key].types = {};
      sails.models[key].types.admin = function(){
        return true;
      };
    }
  }
}
