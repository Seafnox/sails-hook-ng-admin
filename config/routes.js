module.exports.routes = {
  'get /myadmin/:model/:id': 'Admin.show',
  'put /myadmin/:model/:id': 'Admin.update',
  'post /myadmin/:model/:id': 'Admin.update',
  'delete /myadmin/:model/:id': 'Admin.destroy',
  'get /myadmin/:model': 'Admin.read',
  'post /myadmin/:model': 'Admin.create',
  'get /myadmin': 'Admin.index',
};
