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

// =============== Functions ===============

// --------------- Helpers ---------------

function checkInput(name, value) {
	const element = document.querySelector(`input[name=${name}][value=${value}]`);
	if (element) {
		element.checked = true;
	}
}
