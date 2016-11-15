module.exports.admin = {
  label: "AdminPanel",
  allowSpesialFieldsOnEdit: false, // not implemented yet
  dashboard: [
    'location',
    'user',
    'item',
    'mob',
    'plant',
    'unittype',
    'awaiting'
  ],
  denyModels: [ // only in lower case // be very careful!!!
  ],

  models: {
    'model': {
      listView: false,
    },
    'awaiting': {
      dashboardView: {
        label: "Locations",
        denyAttributes: [
          'createdBy',
          'owner',
          'createdAt'
        ]
      }
    },
    'location': {
      dashboardView: {
        label: "Locations",
        denyAttributes: [
          'createdBy',
          'owner',
          'createdAt',
          'description'
        ]
      }
    },
    'user': {
      dashboardView: {
        label: "Last updated users",
        sortBy: "updatedAt",
        sortDir: "DESC",
        allowAttributes: [
          'id',
          'username',
          'email',
          'name',
          'middleName',
          'surName',
          'isAdmin',
          'updatedAt'
        ]
      }
    },
    'item': {
      dashboardView: {
        label: "Last updated items",
        sortBy: "updatedAt",
        sortDir: "DESC",
        allowAttributes: [
          'id',
          'image',
          'name',
          'wearPosition',
          'updatedAt'
        ]
      }
    },
    'unit': {
      dashboardView: {
        label: "Mobs",
        allowAttributes: [
          'id',
          'image',
          'name',
          'positionX',
          'positionY',
          'location',
          'owner'
        ]
      }
    },
    'plant': {
      dashboardView: {
        label: "Plants",
        allowAttributes: [
          'id',
          'name',
          'positionX',
          'positionY',
          'location',
          'owner'
        ]
      }
    },
    'unittype': {
      dashboardView: {
        label: "Unit types",
        allowAttributes: [
          'id',
          'name',
          'onlyMob',
          'parent'
        ]
      }
    },



    /*

    user: {
      group:false, // not implemented yet
      listView: {
        denyAttributes: [
          "name",
          "email",
          "password"
        ],

      },
      showView: {
        label: "Show users",
        allowAttributes: [
          "name",
          "email"
        ],
      },
      creationView: false,
      dashboardView: { // false by default
        label: "Last active users",
        sortBy: "createdAt",
        sortDir: "DESC",
        showCount: 10
        allowAttributes: [
          "name",
          "email"
        ]
      }
    }
     */
  },


}
