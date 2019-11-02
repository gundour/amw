/** @module amw/Container */

const _ = require('lodash')
const args = require('parse-fn-args')

_.hasAnyOf = (obj, keys) => {
	const result = _.compact(_.map(keys, key => obj[key]))
	return result.length
}

class ContainerError extends Error {

	constructor(message) {
		super(message)
		this.name = 'ContainerError'
	}

}

/**
 * Container
 * @class
 * @classdesc Dependency injection container
 */
class Container {

	/**
     * Create a container.
     */
	constructor() {
		this.factories = {}
		this.dependencies = {}
		this.tags = {}
	}

	/**
	 * Register new service
	 * @example
	 * // register dependency
	 * container.register('secret', {
	 *     dependency: 'some secret'
	 * })
	 * @example
	 * // register factory with tag
	 * container.register('logger', {
	 *     factory: (secret) => {
	 *         return () => {
	 *             console.log('secret is:', secret)
	 *         }
	 *     },
	 *     tags: ['logger']
	 * })
     * @param {string} name - Service name.
     * @param {number} service - Service object
	 * @param {*} service.dependency - Whatever you want.
	 * @param {function} service.factory - factory function
	 * @param {string[]} [service.tags] - tags array
     */
	register(name, service) {
		if (_.isNil(name)) {
			throw new ContainerError('Invalid DI container arg[name], Service must have name')
		}

		if (!_.isNil(this.factories[name]) || !_.isNil(this.dependencies[name])) {
			throw new ContainerError('Invalid DI container arg[name], Service already registered')
		}

		if (_.isNil(service)) {
			throw new ContainerError('Invalid DI container arg[service], Service must be provided')
		}

		if (!_.hasAnyOf(service, ['dependency', 'factory'])) {
			throw new ContainerError('Invalid DI container arg[service], Invalid service args')
		}

		if (_.has(service, 'dependency')) {
			this._registerDependency(name, service.dependency)
		} else if (_.has(service, 'factory')) {
			this._registerFactory(name, service.factory)
		}

		if (_.has(service, 'tags')) {
			this._registerTags(service.tags, name)
		}
	}

	/**
	 * Get service by name
	 * @example
	 * // get dependency
	 * const secret = container.getService('secret')
	 * // secret = 'some-secret'
	 * @example
	 * // get factory
	 * const logger = container.getService('logger')
	 * logger()
	 * // secret is: some-secret
     * @param {string} name - Service name.
	 * @returns {*} service - Registered service
     */
	getService(name) {

		if (_.isNil(name)) {
			throw new ContainerError('Invalid DI container arg[name], Provide service name')
		}

		if (_.isNil(this.dependencies[name])) {
			if (_.isNil(this.factories[name])) {
				throw new ContainerError(`Invalid DI container arg[name], Service ${name} Not found`)
			}

			this.dependencies[name] = this._inject(this.factories[name])
		}

		return this.dependencies[name]
	}

	/**
	 * Get main service
	 * @returns {*} service - Registered service with tag 'main'
     */
	getMainService() {
		return _.first(this.getTaggedServices('main'))
	}

	/**
	 * Get services by tag
     * @param {string} tag - Service tag.
	 * @returns {*} services - array of services
     */
	getTaggedServices(tag) {
		if (_.isNil(this.tags[tag])) {
			throw new ContainerError(`Invalid DI container arg[tag], Could not find services with tag ${tag}`)
		}

		const servicesNames = this.tags[tag]
		return _.map(servicesNames, service => this.getService(service))
	}

	_registerDependency(name, dependency) {
		this.dependencies[name] = dependency
	}

	_registerFactory(name, factory) {
		if (!_.isFunction(factory)) {
			throw new ContainerError('Invalid DI container arg[factory], factory be a function')
		}

		this.factories[name] = factory
	}

	_registerTags(tags, name) {
		if (!_.isArray(tags)) {
			throw new ContainerError('Invalid DI container arg[tags], tags must be an array')
		}

		_.forEach(tags, tag => {
			if (_.has(this.tags, tag)) {
				this.tags[tag].push(name)
			} else {
				this.tags[tag] = [name]
			}
		})
	}

	_inject(factory) {
		const dependencies = _.map(args(factory), service => this.getService(service))
		return factory(...dependencies)
	}

}

module.exports = Container
module.exports.ContainerError
