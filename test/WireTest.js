const _ = require('lodash')
const expect = require('./expect')

const Wire = require('../index').Wire
const Container = require('../index').Container
const WireError = require('../lib/Wire').WireError

describe('Wire', () => {
	let wire
	const diFileLocation = __dirname + '/examples/di.js'
	const configFileLocation = __dirname + '/examples/config.js'

	before(() => {
		wire = new Wire(diFileLocation, configFileLocation)
	})

	describe('constructor', () => {
		it('should create new Wire instance', () => {
			expect(wire).to.be.instanceOf(Wire)
		})

		it('should throw WireError when DI file is not provided', () => {
			const fn = () => new Wire(null, configFileLocation)

			expect(fn).to.throw(WireError)
				.and.have.property('message')
				.that.equals('Invalid arg[diPath], must provide di file path')
		})

		it('should throw WireError when DI file is not string', () => {
			const fn = () => new Wire({}, configFileLocation)

			expect(fn).to.throw(WireError)
				.and.have.property('message')
				.that.equals('Invalid arg[diPath], di file path must be a string')
		})

		it('should throw WireError when config file is not string', () => {
			const fn = () => new Wire(diFileLocation, {})

			expect(fn).to.throw(WireError)
				.and.have.property('message')
				.that.equals('Invalid arg[configPath], config file path must be a string')
		})
	})

	describe('connect', () => {
		it('should connect all services', () => {
			const container = wire.connect()

			expect(container).to.be.instanceOf(Container)
			expect(container.factories).to.have.all.keys('message', 'mathOps', 'main')
			expect(container.dependencies).to.have.all.keys('config')
			expect(container.tags).to.have.all.keys('main')

			_.forIn(container.factories, val => {
				expect(typeof val).to.equal('function')
			})

			expect(container.dependencies.config).to.deep.equal({
				message: {
					pre_message: 'result is:'
				},
				mathOps: {},
				main: {}
			})

			expect(container.tags).to.deep.equal({ main: ['main'] })

			const main = container.getMainService()
			expect(main()).to.equal('result is: 6')
		})

		it('should connect all services with default config', () => {
			const anotherWire = new Wire(diFileLocation)
			const container = anotherWire.connect()

			expect(container).to.be.instanceOf(Container)

			expect(container.dependencies.config).to.deep.equal({
				message: {},
				mathOps: {},
				main: {}
			})

			const main = container.getMainService()
			expect(main()).to.equal('6')

		})

		it('should throw WireError when DI file path is invalid', () => {
			const anotherWire = new Wire('./test/di.js', configFileLocation)

			const fn = () => anotherWire.connect()

			expect(fn).to.throw(WireError)
				.and.have.property('message')
				.that.equals('Invalid arg[diPath], could not find di module')
		})

		it('should throw WireError when config file path is invalid', () => {
			const anotherWire = new Wire(diFileLocation, './test/config.js')

			const fn = () => anotherWire.connect()

			expect(fn).to.throw(WireError)
				.and.have.property('message')
				.that.equals('Invalid arg[configPath], could not find config module')
		})
	})
})
