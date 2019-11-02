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
