

module.exports.routes = function (config) {
  sails.log('sails-hook-ng-admin:preparing routes');

  var adminPath = config.adminPath;
  var routes = {};

  routes['get '+adminPath+'/:model/:id'] = 'Admin.show';
  routes['put '+adminPath+'/:model/:id'] = 'Admin.update';
  routes['post '+adminPath+'/:model/:id'] = 'Admin.update';
  routes['delete '+adminPath+'/:model/:id'] = 'Admin.destroy';
  routes['get '+adminPath+'/:model'] = 'Admin.read';
  routes['post '+adminPath+'/:model'] = 'Admin.create';
  routes['get '+adminPath] = 'Admin.index';

  return routes;
};
