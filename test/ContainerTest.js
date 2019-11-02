const expect = require('./expect')

const Container = require('../index').Container
const ContainerError = require('../lib/Container').ContainerError

const freeDependencies = container => {
	container.factories = {}
	container.dependencies = {}
	container.tags = {}
}

describe('container', () => {
	let container

	before(() => {
		container = new Container()
	})

	beforeEach(() => {
		freeDependencies(container)
	})

	afterEach(() => {
		freeDependencies(container)
	})

	describe('constructor', () => {
		it('should return new instance from Container class', () => {
			expect(container).to.be.instanceOf(Container)
		})
	})

	describe('register', () => {
		it('should register new dependency', () => {
			container.register('secret', { dependency: 'some-secret' })

			expect(container.dependencies).to.deep.equal({ secret: 'some-secret' })
		})

		it('should register new dependency ignoring invalid data', () => {
			container.register('secret', {
				dependency: 'some-secret',
				service: 'something'
			})

			expect(container.dependencies).to.deep.equal({ secret: 'some-secret' })
		})

		it('should register new factory', () => {
			container.register('logger', { factory: () => { console.log('factory') } })

			expect(container.factories).to.haveOwnProperty('logger')
			expect(typeof container.factories.logger).to.equal('function')
		})

		it('should register new factory with tag', () => {
			container.register('logger', {
				factory: () => { console.log('factory') },
				tags: ['test']
			})

			container.register('secret', {
				dependency: 'some-secret',
				tags: ['test']
			})

			expect(container.tags).to.deep.equal({
				test: ['logger', 'secret']
			})
		})

		it('should throw ContainerError at registering service with no name', () => {
			const fn = () => container.register(null, { dependency: 'some-secret' })

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[name], Service must have name')
		})

		it('should throw ContainerError at registering service that is already registered', () => {
			container.register('service', { dependency: 'some-secret' })
			const fn = () => container.register('service', { dependency: 'some-secret' })

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[name], Service already registered')
		})

		it('should throw ContainerError at registering service with no service', () => {
			const fn = () => container.register('service')

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[service], Service must be provided')
		})

		it('should throw ContainerError at registering invalid service args', () => {
			const fn = () => container.register('service', { service: 'some-secret' })

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[service], Invalid service args')
		})

		it('should throw ContainerError at registering service with invalid factory', () => {
			const fn = () => container.register('service', { factory: {} })

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[factory], factory be a function')
		})

		it('should throw ContainerError at registering service with invalid tags', () => {
			const fn = () => container.register('service', {
				dependency: {},
				tags: 'tag'
			})

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[tags], tags must be an array')
		})
	})

	describe('getService', () => {
		it('should get dependency', () => {
			container.register('secret', { dependency: 'some-secret' })
			const secret = container.getService('secret')

			expect(secret).to.equal('some-secret')
		})

		it('should get factory', () => {
			container.register('message', { factory: () => 'factory' })
			const message = container.getService('message')

			expect(message).to.equal('factory')
		})

		it('should get factory with injection', () => {
			container.register('secret', { dependency: 'some-secret' })
			container.register('message', { factory: secret => secret })

			const message = container.getService('message')

			expect(message).to.equal('some-secret')
		})

		it('should throw ContainerError at getting service with no name', () => {
			const fn = () => container.getService()

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[name], Provide service name')
		})

		it('should throw ContainerError at getting service that is not registered', () => {
			const fn = () => container.getService('some-service')

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[name], Service some-service Not found')
		})

		it('should throw ContainerError at injecting service that is not registered', () => {
			container.register('message', { factory: secret => secret })

			const fn = () => container.getService('message')

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[name], Service secret Not found')
		})
	})

	describe('getMainService', () => {
		it('should get main service', () => {
			container.register('message', {
				factory: () => 'factory',
				tags: ['main']
			})
			const main = container.getMainService()

			expect(main).to.equal('factory')
		})

		it('should throw ContainerError at getting main service that is not registered', () => {
			const fn = () => container.getMainService()

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[tag], Could not find services with tag main')
		})
	})

	describe('getTaggedServices', () => {
		it('should get services tagged test', () => {
			container.register('message', {
				factory: () => 'factory',
				tags: ['test']
			})

			container.register('message2', {
				factory: () => 'factory2',
				tags: ['test']
			})

			const taggedServices = container.getTaggedServices('test')

			expect(taggedServices).to.be.an('array')
				.that.deep.equal(['factory', 'factory2'])
		})

		it('should throw ContainerError at getting tagged service that is not registered', () => {
			const fn = () => container.getTaggedServices('test')

			expect(fn).to.throw(ContainerError)
				.and.have.property('message')
				.that.equals('Invalid DI container arg[tag], Could not find services with tag test')
		})
	})
})
