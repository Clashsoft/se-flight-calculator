// =============== Classes ===============

class Field {
	constructor(name, defaultValue) {
		this.name = name;
		this._value = localStorage.getItem(name) || defaultValue;
		this.changeHandlers = [];
	}

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = value;
		localStorage.setItem(this.name, value);
	}

	addChangeHandler(changeHandler) {
		this.changeHandlers.push(changeHandler);
	}

	_onChange(input) {
		const oldValue = this._value;
		const newValue = input.value;
		this.value = newValue;

		for (let changeHandler of this.changeHandlers) {
			changeHandler.call(this, input, oldValue, newValue);
		}
	}
}

class InputField extends Field {
	constructor(name, defaultValue, input) {
		super(name, defaultValue);
		this.input = input;
		input.value = this._value;

		const field = this;

		input.onchange = () => field._onChange(input);
	}

	get value() {
		return super.value;
	}

	set value(value) {
		super.value = value;
		this.input.value = value;
	}
}

class RadioField extends Field {
	constructor(name, defaultValue) {
		super(name, defaultValue);
		checkInput(this.name, this._value);
		this.inputs = document.querySelectorAll(`input[name=${this.name}]`);

		const field = this;

		for (let input of this.inputs) {
			input.onchange = () => {
				if (input.checked) {
					field._onChange(input);
				}
			};
		}
	}

	get value() {
		return super.value;
	}

	set value(value) {
		super.value = value;
		checkInput(this.name, value);
	}
}

// =============== Constants ===============

const routeType = new RadioField('routeType', 'coordinates');
const distance = new InputField('distance', 0, document.getElementById('distanceField'));
const startX = new InputField('startXCoordinate', 0, document.getElementById('startXCoordinateInput'));
const startY = new InputField('startYCoordinate', 0, document.getElementById('startYCoordinateInput'));
const startZ = new InputField('startZCoordinate', 0, document.getElementById('startZCoordinateInput'));
const destX = new InputField('destXCoordinate', 0, document.getElementById('destXCoordinateInput'));
const destY = new InputField('destYCoordinate', 0, document.getElementById('destYCoordinateInput'));
const destZ = new InputField('destZCoordinate', 0, document.getElementById('destZCoordinateInput'));

// =============== Initialization ===============

init();

function init() {
	routeType.addChangeHandler((field, oldValue, newValue) => {
		let coordinates = newValue === 'coordinates';
		distance.input.readOnly = coordinates;
		startX.input.readOnly = !coordinates;
		startY.input.readOnly = !coordinates;
		startZ.input.readOnly = !coordinates;
		destX.input.readOnly = !coordinates;
		destY.input.readOnly = !coordinates;
		destZ.input.readOnly = !coordinates;
	});

	bind(routeType, startX, startY, startZ, destX, destY, destZ, (r, x1, y1, z1, x2, y2, z2) => {
		if (r === 'coordinates') {
			distance.value = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
		}
	});
}

// =============== Functions ===============

// --------------- Helpers ---------------

function bind(...args) {
	const fn = args.pop();
	for (let f of args) {
		f.addChangeHandler((field, oldValue, newValue) => {
			fn.call(this, ...args.map(f => f.value));
		});
	}
}

function checkInput(name, value) {
	const element = document.querySelector(`input[name=${name}][value=${value}]`);
	if (element) {
		element.checked = true;
	}
}
