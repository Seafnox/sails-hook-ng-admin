// declare a new module called 'ngAdmin', and make it require the `ng-admin` module as a dependency
var ngAdmin = angular.module('ngAdmin', ['ng-admin']);
var ngModels = {};
// declare a function to run when the module bootstraps (during the 'config' phase)
ngAdmin.config(['NgAdminConfigurationProvider', function (nga) {
  // create an admin application
  var admin = nga.application('NG Admin').baseApiUrl(
    window.location.protocol+"//"+window.location.host+window.location.pathname+"/"
  );

  for (var modelName in models) {
    if (!models.hasOwnProperty(modelName)) {
      continue;
    }
    ngModels[modelName] = nga.entity(modelName);
  }
  var ngDashboard = nga.dashboard();
  for (var modelName in models) {
    if (!models.hasOwnProperty(modelName)) {
      continue;
    }
    var model = models[modelName];
    var ngModel = ngModels[modelName];
    try {
      prepareNgViews(nga, ngModel, model);
      prepareNgDashboardUnit(nga, ngDashboard, ngModel, model)
    } catch(err) {
      console.error("Oops " + err.stack);
    }

    // add the user entity to the admin application

    admin.addEntity(ngModel);
  }
  admin.dashboard(ngDashboard);

  // attach the admin application to the DOM and execute it
  nga.configure(admin);
}]);

ngAdmin.config(['RestangularProvider', function(RestangularProvider) {
  RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
    var model = models[what];
    if (operation == 'getList') {
      for(var i = 0; i < data.length; i++) {
        prepareObject(model, data[i]);
      }
    } else {
      prepareObject(model, data);
    }
    return data;
  });
}]);

function prepareObject(model, entity) {
  for (var key in entity) {
    if (!entity.hasOwnProperty(key)) {
      continue;
    }
    var attribute = model.attributes[key];
    if (!attribute) {
      continue;
    }
    switch (attribute.type) {
      case 'reference':
        if (!!entity[key] && typeof entity[key] == 'object') {
          entity[key] = entity[key].id;
        }
        break;
      case 'referenced_list':
      case 'reference_many':
        if (entity[key] instanceof Array) {
          for(var i = 0; i < entity[key].length; i++) {
            if (!!entity[key] && typeof entity[key][i] == 'object') {
              entity[key][i] = entity[key][i].id;
            }
          }
        } else {
          entity[key] = undefined;
        }
        break;
    }
  }
}

function prepareNgDashboardUnit(nga, ngDashboard, ngModel, model) {
  //dashboard
  if (typeof model.dashboardView == 'object' && !(model.dashboardView instanceof Array)) {
    var collection = nga.collection(ngModel).perPage(10);
    prepareNgView(nga, collection, model.dashboardView, model.attributes);
    if (!!model.dashboardView.label) {
      collection.title(model.dashboardView.label);
    }
    if (!!model.dashboardView.showCount) {
      collection.perPage(model.dashboardView.showCount);
    }
    if (!!model.dashboardView.sortBy) {
      collection.sortField(model.dashboardView.sortBy);
    }
    if (!!model.dashboardView.sortDir) {
      collection.sortDir(model.dashboardView.sortDir);
    }

    ngDashboard.addCollection(collection);
  }

}

function prepareNgViews(nga, ngModel, model) {
  //listView
  if (typeof model.listView == 'object' && !(model.listView instanceof Array)) {
    prepareNgView(nga, ngModel.listView(), model.listView, model.attributes);
    ngModel.listView().listActions(['edit', 'show', 'delete']);
  }
  //creationView
  //editionView
  if (typeof model.creationView == 'object' && !(model.creationView instanceof Array)) {
    prepareNgView(nga, ngModel.creationView(), model.creationView, model.attributes);
    prepareNgView(nga, ngModel.editionView(), model.creationView, model.attributes);
  }
  //showView
  //deletionView
  if (typeof model.showView == 'object' && !(model.showView instanceof Array)) {
    prepareNgView(nga, ngModel.showView(), model.showView, model.attributes);
    prepareNgView(nga, ngModel.deletionView(), model.showView, model.attributes);
  }
}

function prepareNgView(nga, ngView, view, modelAttributes) {
  var ngFields = [];
  if (!!view.label) {
    ngView.title(view.label);
  }

  for(var i = 0; i < view.attributes.length; i++) {
    var attributeName = view.attributes[i];
    ngFields.push(prepareNgField(nga, modelAttributes[attributeName]));
  }
  // set the fields of the user entity list view
  ngView.fields(ngFields);
}

function prepareNgField(nga, attribute) {
  var ngaField = nga.field(attribute.name, attribute.type);
  // special actions
  switch(attribute.type) {
    case 'string': break;
    case 'text': break;
    case 'wysiwyg': break;
    case 'password': break;
    case 'email': break;
    case 'date': break;
    case 'datetime': break;
    case 'number': break;
    case 'float': break;
    case 'boolean': break;
    case 'choice': break;
    case 'choices': break;
    case 'json': break;
    case 'file': break;
    case 'reference':
      //ngaField = nga.field(attribute.name + ".id", attribute.type);
      if (!ngModels[attribute.model]) {
        throw new Error(attribute.model + " is not defined");
      }
      ngaField
        .targetEntity(ngModels[attribute.model])
        .targetField(nga.field(attribute.viewField));
      break;

    case 'referenced_list':
      if (!ngModels[attribute.model]) {
        throw new Error(attribute.model + " is not defined");
      }
      ngaField
        .targetEntity(ngModels[attribute.model])
        .targetReferenceField(nga.field(attribute.viewField))
        .targetFields([ // which fields to display in the datagrid
          nga.field('id').label('ID')
        ]);
      break;

    case 'reference_many':
      if (!ngModels[attribute.model]) {
        throw new Error(attribute.model + " is not defined");
      }
      ngaField
        .targetEntity(ngModels[attribute.model])
        .targetField(nga.field("id"))
        .isDetailLink(false)
        .remoteComplete(true)
        .singleApiCall(function (ids) {
          return { 'ids[]': ids };
        })
        .perPage(10);
      break;

    case 'embedded_list': break;
    case 'reference_many': break;
  }
  return ngaField;
}
