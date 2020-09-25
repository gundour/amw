![npm](https://img.shields.io/npm/v/amw?style=plastic)

# AMW - Another Module Wiring

Smart module wiring using dependency injection container

This library can be used as a framework for your modern javascript projects.

## Installation

```sh
npm install amw
```

## Importing

```javascript
// Using Node.js `require()`
const {Wire} = require('amw');
```

## Overview

### Define dependencies

First, we need to define the dependencies we want in our app. create a file `di.js` and here is our
dependencies for the app.

```js
// di.js
const message = config => message => {
 if (config.pre_message) {
  return `${config.pre_message} ${message}`
 }
 return `${message}`
}

class MathOps {

 add(num1, num2) {
  return num1 + num2
 }

 sub(num1, num2) {
  return num1 - num2
 }

}

module.exports = {
 'message': {
  factory: config => message(config.message)
 },

 'mathOps': {
  factory: () => new MathOps()
 },

 'main': {
  factory: (mathOps, message) => () => {
   const result = mathOps.sub(mathOps.add(5, 4), 3)

   return message(result)
  },
  tags: ['main']
 }
}
```

each dependency should have a unique name, here we have 3 dependencies `message`, `mathOps` and `main`.

each dependency shall have the following attributes

1- `factory`:
a factory function that should return a `function` or an object `instance`, and this way we can ensure
only single instance per application for each dependency.

the factory arguments can be our defined services like the case of the main factory function as it
expects both `mathOps` and `message` services as arguments.

there is another argument that we can access which is the `config` argument, and that is the configuration
exported by our `config.js` file. check the [Define Config](#defile-config) section.

2- `tags`:
an array of tags, we can use to group services under the same tag for fast access, the `main` tag is
reserved for the main service only.

### Define Config

The config file is where we can keep our configuration for all our services in the same place.
in this file we need to export an object of service configuration.

```js
// config.js
module.exports = {
 message: {
  pre_message: 'result is:'
 }
}
```

here we just have configuration for the message service, and we use it in the message factory function.

### Wiring services

Next we need to wire all those services and start our application, we shall do that in `main.js` file

```js
// main.js
const {Wire} = require('amw');
const DI_FILE_LOCATION = ''; // location of di.js file
const CONFIG_FILE_LOCATION = ''; // location of config.js file

// define new wire instance
const wireInstance = new Wire(DI_FILE_LOCATION, CONFIG_FILE_LOCATION)

// connect dependencies defined in di.js
const container = wire.connect()

// get the main service
const main = container.getMainService()

// call the main function
main()
```

next run

```sh
$ node main.js
// result is: 6
```

the `connect` function returns a `container` object that we used to get the main service and call it.
the `container` has other useful functions.

## Container

The container contains all services defined in `di.js`, and it is used internally to register the services
defined when we called `wire.connect()`, but it can also be used externally for service registration.

### Methods

#### container.register(name, service)

Register new service

**Kind**: instance method of [<code>Container</code>](#module_amw/Container..Container)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Service name. |
| service | <code>number</code> | Service object |
| service.dependency | <code>\*</code> | Whatever you want. |
| service.factory | <code>function</code> | factory function |
| [service.tags] | <code>Array.&lt;string&gt;</code> | tags array |

**Example**

```js
// register dependency
container.register('secret', {
    dependency: 'some secret'
})
```

**Example**

```js
// register factory with tag
container.register('logger', {
    factory: (secret) => {
        return () => {
            console.log('secret is:', secret)
        }
    },
    tags: ['logger']
})
```

#### container.getService(name) ⇒ <code>\*</code>

Get service by name

**Kind**: instance method of [<code>Container</code>](#module_amw/Container..Container)
**Returns**: <code>\*</code> - service - Registered service

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Service name. |

**Example**

```js
// get dependency
const secret = container.getService('secret')
// secret = 'some-secret'
```

**Example**

```js
// get factory
const logger = container.getService('logger')
logger()
// secret is: some-secret
```

#### container.getMainService() ⇒ <code>\*</code>

Get main service

**Kind**: instance method of [<code>Container</code>](#module_amw/Container..Container)
**Returns**: <code>\*</code> - service - Registered service with tag 'main'

#### container.getTaggedServices(tag) ⇒ <code>\*</code>

Get services by tag

**Kind**: instance method of [<code>Container</code>](#module_amw/Container..Container)
**Returns**: <code>\*</code> - services - array of services

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>string</code> | Service tag. |

## More info

If you are interested to learn more cool design patterns in node.js I recommend this book
[Node.js Design Patterns](https://www.packtpub.com/product/node-js-design-patterns-second-edition/9781785885587)
by Mario Casciaro and Luciano Mammino.
