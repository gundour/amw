/** @module amw/Wire */

const _ = require('lodash')
const Container = require('./Container')

class WireError extends Error {

	constructor(message) {
		super(message)
		this.name = 'WireError'
	}

}

/**
 * Wire
 * @class
 * @classdesc Wire modules provided by DI file, and append configuration
 * provided by config file
 */
class Wire {

	/**
     * Create wire instance.
	 * @param {string} diPath - DI file full path
     * @param {string} [configPath] - config file full path
     */
	constructor(diPath, configPath) {
		if (_.isNil(diPath)) {
			throw new WireError('Invalid arg[diPath], must provide di file path')
		}

		if (!_.isString(diPath)) {
			throw new WireError('Invalid arg[diPath], di file path must be a string')
		}

		if (!_.isNil(configPath) && !_.isString(configPath)) {
			throw new WireError('Invalid arg[configPath], config file path must be a string')
		}

		this.container = new Container()
		this.services = diPath
		this.config = configPath
	}

	/**
     * Connect services.
	 * @returns {Object} container - instance of Container
     */
	connect() {
		this._readDiFile()
		this._readConfigFile()
		this._completeConfig()
		this._registerConfigService()
		this._registerServices()

		return this.container
	}

	_readDiFile() {
		try {
			this.services = require(this.services)
		} catch (error) {
			throw new WireError('Invalid arg[diPath], could not find di module')
		}
	}

	_readConfigFile() {
		if (_.isNil(this.config)) {
			return this.config = {}
		}

		try {
			this.config = require(this.config)
		} catch (error) {
			throw new WireError('Invalid arg[configPath], could not find config module')
		}
	}

	_completeConfig() {
		const services = _.keysIn(this.services)
		_.forEach(services, service => {
			if (_.isNil(this.config[service])) {
				this.config[service] = {}
			}
		})
	}

	_registerConfigService() {
		this.container.register('config', {
			dependency: this.config
		})
	}

	_registerServices() {
		_.forIn(this.services, (service, name) => {
			this.container.register(name, service)
		})
	}

}

module.exports = Wire
module.exports.WireError = WireError
