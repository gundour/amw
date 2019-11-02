module.exports = {
	'env': {
		'node': true,
		'commonjs': true,
		'es6': true,
		'mocha': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'never'
		],
		'eqeqeq': [
			'error',
			'always'
		],
		"comma-spacing": [
			"error",
			{ "before": false, "after": true }
		],
		"max-len": [
			"error",
			{
				"code": 100,
				"tabWidth": 4,
				"ignoreUrls": true,
				"ignoreTemplateLiterals": true,
				"ignoreRegExpLiterals": true
			}
		],
		"max-depth": [
			"error",
			4
		],
		"max-params": [
			"error",
			4
		],
		"array-bracket-spacing": [
			"error",
			"never"
		],
		"block-spacing": [
			"error",
			"always"
		],
		"brace-style": [
			"error",
			"1tbs",
			{ "allowSingleLine": true }
		],
		"camelcase": [
			"error",
			{ properties: "never" }
		],
		"comma-dangle": [
			"error",
			{
				"arrays": "never",
				"objects": "only-multiline",
				"imports": "never",
				"exports": "never",
				"functions": "never"
			}
		],
		"eol-last": [
			"error",
			"always"
		],
		"func-call-spacing": [
			"error",
			"never"
		],
		"keyword-spacing": [
			"error",
			{ "after": true }
		],
		"prefer-const": [
			"error"
		],
		"prefer-arrow-callback": [
			"error"
		],
		"arrow-body-style": [
			"error",
			"as-needed"
		],
		"no-var": [
			"error"
		],
		"no-useless-constructor": [
			"error"
		],
		"no-multiple-empty-lines": [
			"error",
			{ "max": 1, "maxEOF": 1 }
		],
		"padded-blocks": [
			"error",
			{ "classes": "always" }
		],
		"object-curly-spacing": [
			"error",
			"always"
		],
	}
}
