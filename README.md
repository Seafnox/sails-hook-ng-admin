# Sails admin panel

[![Join the chat at https://gitter.im/seafnox/sails-hook-ng-adminpanel](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/seafnox/sails-hook-ng-adminpanel?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
>Beaware: This hook is still in a very early stage and not in a very active development.

## Why

The objective of this sails hook is to provide an easy way to create a simple adminpanel for your model's collections.
The hook reads the models schema to build simple CRUD operations and UI adminpanel.

## Installation
Install using `npm i sails-hook-ng-adminpanel` and then navigate to `http://localhost:1337/admin`

## Routes
This hooks introduces a couple of routes to your application.
- `http://localhost:1337/admin` or home
- `http://localhost:1337/admin/:model` A list of items
- `http://localhost:1337/admin/:model/create` The form to create a new item
- `http://localhost:1337/admin/:model/edit/:modelId` The form to edit an item

## Options
I want this hook to work as plug and play. However if you want more control over the adminpanel I want to be able to provide those configurations to set things up.
I decided not to make a `config/adminpanel.js` file yet since I think the model declaration could serve better for grain control configuraitons.

Having for example a model Book. We can start to modify how its `/admin/:model` list view renders.
In this case we have overrided the model.name with a label *Libro* and removed the createdAt and updatedAt fields.
