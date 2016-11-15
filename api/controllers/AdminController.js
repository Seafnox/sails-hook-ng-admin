/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
  index: function (req, res) {
    sails.log("++++++++++++++LIST+++++++++++++++");
    var config = sails.config.admin;

    var models = {};
    for (var modelName in sails.models) {
      if (! sails.models.hasOwnProperty(modelName)) {
        continue;
      }
      var sailsModel = sails.models[modelName];
      if (!sailsModel.hasOwnProperty("_attributes")) {
        continue;
      }
      if (!!config.denyModels && config.denyModels.indexOf(modelName) != -1) {
        continue;
      }

      if (typeof config.models[modelName] != 'undefined') {
        if (!config.models[modelName]) {
          continue;
        }
      }
      var configModel = {};
      if (typeof config.models[modelName] == 'object' && !(config.models[modelName] instanceof Array)) {
        configModel = config.models[modelName];
      }

      var model = prepareModel(modelName, configModel, sailsModel._attributes);

      models[model.name] = model;

    }
    return res.view({
      models: models
    });
  },
  create: function(req,res) {
    sails.log("++++++++++++++CREATE+++++++++++++++");
    var model = getModel(req);
    var unit = req.body;
    var promiseUnit;
    if (model.name == 'image') {
      promiseUnit = Image.upload(req, unit.name, {name: unit.subDir}, unit.thumbs);
    } else {
      promiseUnit = model.create(unit);
    }
    promiseUnit.populateAll()
      .then(function (resultUnit) {
        return res.json(result);
      })
      .catch(function (err) {
        // TODO err.stack not for production
        var message = req.params.model + " cannot be created | ";
        return res.serverError(message + err.toString());
      });
  },
  read: function(req, res) {
    /*
     _page: integer
     _perPage: integer
     _sortDir: ['DESC', 'ASC']
     _sortField: string
     */
    sails.log("++++++++++++++++READ+++++++++++++++++");
    var page = req.query._page || 1;
    var perPage = req.query._perPage || 29;
    var sortTo = req.query._sortDir || 'DESC';
    var sortField = req.query._sortField || 'id';
    var sort = {};
    sort = sortField + " " + sortTo;

    var filters = req.query._filters;
    if (typeof filters == 'string') {
      filters = JSON.parse(filters);
    }
    sails.log("Filters", typeof filters, JSON.stringify(filters));
    var whereCase = {};
    if (!!filters) {
      for(var key in filters) {
        if (filters.hasOwnProperty(key)) {
          if (key == 'ids[]') {
            sails.log("Filter ids[]", filters['ids[]'].length);
            whereCase.id = filters['ids[]'];
            perPage = perPage > filters['ids[]'].length ? perPage : filters['ids[]'].length;
            continue;
          }
          whereCase[key] = filters[key];
        }
      }
    }

    var criteria = {};
    criteria.where = whereCase;
    criteria.sort = sort;

    var paginate = {page: page, limit: perPage};

    var model = getModel(req);

    sails.log("getModel " + req.params.model + " by criteria " + JSON.stringify(criteria) + " with paginate " + JSON.stringify(paginate));

    if (!model) {
      // TODO err.stack not for production
      return res.serverError(req.params.model + " cannot be reached");
    }

    model.count(criteria).exec(function(err, itemCount) {
      if (!!err) {
        // TODO err.stack not for production
        return res.serverError(req.params.model + " count cannot be reached: " + err.toString());
      }

      //model.find(criteria).paginate(paginate).populateAll().exec(function(err, objects) {
      model.find(criteria).paginate(paginate).populateAll().exec(function(err, objects) {

        if (!!err) {
          // TODO err.stack not for production
          return res.serverError(req.params.model + " cannot be reached: " + err.toString());
        }

        if (!(objects instanceof Array)) {
          return res.forbidden('You are not permitted to perform this page.');
        }

        sails.log.debug("Objects count", objects.length);

        res.set('Content-Page', page);
        res.set('Content-Perpage', perPage);

        res.set('X-Total-Count', itemCount);
        res.set('Content-Count', itemCount);

        res.set('Content-Result', objects.length);

        res.set('Content-Range', (paginate.page*paginate.limit + 1) + "-" + (paginate.page*paginate.limit + objects.length) );

        res.set('Content-Model', req.params.model);
        return res.json(objects);
      });
    });

  },
  show: function(req, res) {
    sails.log("++++++++++++++SHOW+++++++++++++++");
    var id = req.params.id;
    var model = getModel(req);
    sails.log("get object ", id, " from " + req.params.model);
    model.findOne({id: id}).populateAll().exec(function(err, currentObject) {

      if (!!err) {
        // TODO err.stack not for production
        var message = req.params.model + " cannot be reached | ";
        sails.log.error(message, err.toString());
        return res.serverError(message + err.toString());
      }

      if (!currentObject) {
        var message = 'You are not permitted to perform this page.';
        sails.log.error(message, JSON.stringify(currentObject));
        return res.forbidden(message);
      }
      return res.json(currentObject);
    });
  },
  update: function(req, res) {
    sails.log("++++++++++++++UPDATE+++++++++++++++");
    var model = getModel(req);
    var id = req.params.id;
    var unit = req.body;
    sails.log("update object " + req.params.id + " from " + req.params.model);
    // TODO аПбаОаВаЕбаИбб аАбббаИаБббб аИ аВбаНаЕббаИ аКаОаЛаЛаЕаКбаИаИ, аОбаВаЕбаАббаИаЕ аЗаА баВбаЗаАаНаНбаЕ аОаБбаЕаКбб
    sails.log("update params", JSON.stringify(unit));
    if (model.name == 'image') {
      return res.serverError("Image now is not supported");
    }
    model.update({id : id}, unit)
      .then(function(resultUnits) {
        sails.log("updateUnits", resultUnits.length);
        return res.json(resultUnits[0]);
      })
      .catch(function (err) {
        // TODO err.stack not for production
        var message = req.params.model + " cannot be created | ";
        sails.log.error(message, err.toString());
        return res.serverError(message + err.toString());
      });
  },
  destroy: function( req, res) {
    var model = getModel(req);
    var id = req.params.id;
    model.destroy({id : id}).exec(function (err, result) {

      if (!!err) {
        // TODO err.stack not for production
        var message = req.params.model + " cannot be created | ";
        sails.log.error(message, err.toString());
        return res.serverError(message + err.toString());
      }

      return res.json(result)

    });
  }
};

function getModel(req) {
  var model = req.params.model;
  return sails.models[model];
}

function prepareModel(modelName, configModel, sailsAttributes) {
  var model = {};

  model.name = modelName;
  model.label = sails.__(configModel.label || model.name);

  model.attributes = {};
  var sailsAttributeList = [];
  for (var attributeName in sailsAttributes) {
    if (!sailsAttributes.hasOwnProperty(attributeName)) {
      continue;
    }
    var sailsAttributeInfo = sailsAttributes[attributeName];
    var attributeInfo = getAttributeInfo(sailsAttributeInfo);
    attributeInfo.name = attributeName;
    model.attributes[attributeName] = attributeInfo;
    sailsAttributeList.push(attributeName);
  }

  return prepareViews(model, configModel, sailsAttributeList);
}

function prepareViews(model, configModel, sailsAttributeList) {
  var currentConfigView;

  currentConfigView = prepareConfigView(configModel.listView);
  if (currentConfigView) {
    model.listView = prepareView(currentConfigView, sailsAttributeList);
  }

  currentConfigView = prepareConfigView(configModel.showView);
  if (currentConfigView) {
    model.showView = prepareView(currentConfigView, sailsAttributeList);
  }

  currentConfigView = prepareConfigView(configModel.creationView);
  if (currentConfigView) {
    if ( currentConfigView.hasOwnProperty("denyAttributes")
      && currentConfigView.denyAttributes instanceof Array) {
      currentConfigView.denyAttributes.push('id');
      currentConfigView.denyAttributes.push('updatedAt');
      currentConfigView.denyAttributes.push('createdAt');
      currentConfigView.denyAttributes.push('createdBy');
    }
    model.creationView = prepareView(currentConfigView, sailsAttributeList);
  }

  if (!!configModel.dashboardView) {
    currentConfigView = prepareConfigView(configModel.dashboardView);
    if (currentConfigView) {
      model.dashboardView = prepareView(currentConfigView, sailsAttributeList);
      model.dashboardView.showCount = currentConfigView.showCount;
      model.dashboardView.sortBy = currentConfigView.sortBy;
      model.dashboardView.sortDir = currentConfigView.sortDir;
    }
  }

  return model;
}

function prepareConfigView(configView) {
  var thisConfigView = configView;
  if (typeof thisConfigView == 'undefined' || !!thisConfigView) {
    if (typeof thisConfigView != 'object') {
      thisConfigView = {};
    }
    if (!thisConfigView.denyAttributes && !thisConfigView.allowAttributes) {
      thisConfigView.denyAttributes= [];
    }
    return thisConfigView;
  }
  return false;
}

function prepareView(configView, sailsAttributeList) {
  var modelView = {
    attributes: []
  };
  if (!!configView.label) {
    modelView.label = sails.__(configView.label);
  }

  for (var i = 0; i < sailsAttributeList.length; i++) {
    var attributeName = sailsAttributeList[i];
    if (configView.hasOwnProperty("allowAttributes") && configView.allowAttributes instanceof Array) {
      if (configView.allowAttributes.indexOf(attributeName) != -1) {
        modelView.attributes.push(attributeName);
      }
    } else if (configView.hasOwnProperty("denyAttributes") && configView.denyAttributes instanceof Array) {
      if (configView.denyAttributes.indexOf(attributeName) == -1) {
        modelView.attributes.push(attributeName);
      }
    } else {
      var err = new Error("config does not have allow or deny fields");
      sails.log.error(err.toString());
      throw err;
    }
  }

  return modelView;
}

function getAttributeInfo(sailsAttributeInfo) {
  var info = {};
  var type = sailsAttributeInfo.type;
  switch(type) {
    case 'alphanumeric':
    case 'alphanumericdashed':
    case 'string':
      info.type='string'; break;

    case 'email': info.type='email'; break;
    case 'text': info.type='wysiwyg'; break;
    case 'integer': info.type='number'; break;
    case 'float': info.type='float'; break;
    case 'date': info.type='date'; break;
    case 'datetime': info.type='datetime'; break;

    case 'boolean':
    case 'binary':
      info.type='boolean'; break;

    case 'array': info.type='embedded_list'; break;

    case 'object':
    case 'json':
      info.type='json'; break;

    case 'mediumtext': info.type='wysiwyg'; break;
    case 'longtext': info.type='wysiwyg'; break;
    case 'objectid': info.type=''; break;
    default:
      if (!sailsAttributeInfo.model && !sailsAttributeInfo.collection) {
        sails.log.error("Undefined attribute info: " + JSON.stringify(sailsAttributeInfo));
      }

      if (sailsAttributeInfo.model) {
        info.type='reference';
        info.model = sailsAttributeInfo.model;
        info.viewField = 'id';
        break;
      }
      if (sailsAttributeInfo.collection) {
        // TODO have bug with dominant view i guess
        // There is reference_many for dominant but must to see
        info.type='reference_many';
        info.model = sailsAttributeInfo.collection;
        info.viewField = sailsAttributeInfo.via;
        break;
      }
      info.type=''; break;
  }

  return info;
}
