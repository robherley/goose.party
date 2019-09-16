HTMLElement.prototype.css = function(newStyles) {
	Object.assign(this.style, newStyles);
};

Array.prototype.rando = function() {
	return this[Math.floor(Math.random() * this.length)];
};

class Goose {
	constructor(speed) {
		this.height = Math.floor(
			Math.random() * Math.floor(window.innerHeight - 120)
		);
		this.speed = speed ? speed : [3, 5, 8, 10].rando();
		this.direction = ['left', 'right'].rando();
		this.outOfBounds = false;
		this.ded = false;

		this.element = document.createElement('img');
		this.element.className = 'geese';
		this.element.src = '/assets/goose.gif';
		this.element.css({
			top: this.height + 'px',
			left: this.direction === 'right' ? '0px' : window.innerWidth - 102 + 'px',
			transform: this.direction === 'right' ? 'scaleX(-1)' : ''
		});

		document.body.appendChild(this.element);
		this.element.addEventListener('mousedown', () => this.kill());
	}

	fly() {
		const { left } = this.element.style;
		const oldPos = parseInt(left);
		let newPos;
		if (this.direction === 'right') {
			newPos = oldPos + this.speed;
			const { right } = this.element.getBoundingClientRect();
			if (right > window.innerWidth) {
				this.outOfBounds = true;
				this.cleanup();
			}
		} else {
			newPos = oldPos - this.speed;
			const { left } = this.element.getBoundingClientRect();
			if (left < 0) {
				this.outOfBounds = true;
				this.cleanup();
			}
		}
		this.element.css({
			left: newPos + 'px'
		});
	}

	kill() {
		if (!this.ded) {
			this.ded = true;
			this.element.src = '/assets/explode.gif';
			setTimeout(() => this.cleanup(), 500);
		}
	}

	cleanup() {
		document.body.removeChild(this.element);
	}
}

class GeeseGame {
	constructor() {
		this.score = 0;
		this.allowedMisses = 5;
		this.flyingGeese = [new Goose(3)];
		this.onEnd = () => {};

		const scoreContainer = document.createElement('h1');
		scoreContainer.innerHTML = `Geese Slayed: <span id="score">${this.score}</span>`;
		document.body.appendChild(scoreContainer);
		const allowedMissesContainer = document.createElement('h2');
		allowedMissesContainer.innerHTML = `Misses Left: <span id="allowedMisses">${this.allowedMisses}</span>`;
		document.body.appendChild(allowedMissesContainer);

		this.elements = {
			score: document.getElementById('score'),
			allowedMisses: document.getElementById('allowedMisses')
		};
	}

	end() {
		this.flashMessage('');
		document
			.querySelectorAll('h1, h2')
			.forEach(x => document.body.removeChild(x));
		this.flyingGeese.forEach(x => x.cleanup());
		this.onEnd();
	}

	flashMessage(msg) {
		message.innerText = msg;
		setTimeout(() => (message.innerText = ''), 1500);
	}

	setElement(key, value) {
		this[key] = value;
		this.elements[key].innerText = value;
	}

	loop() {
		this.flyingGeese = this.flyingGeese.filter(goose => {
			goose.fly();
			if (goose.outOfBounds) {
				this.flashMessage('A GOOSE ESCAPED 😭');
				this.setElement('allowedMisses', this.allowedMisses - 1);
			}
			if (goose.ded) {
				this.setElement('score', this.score + 1);
			}
			return !(goose.outOfBounds || goose.ded);
		});

		// check for allowedMisses
		if (this.allowedMisses === 0) {
			this.end();
			return;
		}

		if (this.flyingGeese.length < 5) {
			const chance = Math.random();
			if (chance < 0.5) {
				// slow goose
				this.flyingGeese.push(new Goose(3));
			} else if (chance < 0.8) {
				// med goose
				this.flyingGeese.push(new Goose(5));
			} else if (chance < 0.95) {
				// fast GOOSE
				this.flyingGeese.push(new Goose(8));
			} else {
				// SUPER GOOSE
				this.flyingGeese.push(new Goose(10));
			}
		}
		requestAnimationFrame(() => this.loop());
	}
}

const start = () => {
	hunter.style.display = 'block';
	dialog.style.display = 'none';
	window.game = new GeeseGame();
	requestAnimationFrame(() => window.game.loop());
	if (!window.music.playing()) {
		window.music.play();
	}
	window.game.onEnd = () => {
		hunter.style.display = 'none';
		dialog.children[0].innerText = `GEESE SLAYED: ${window.game.score}`;
		dialog.children[1].innerText = 'Restart?';
		dialog.style.display = 'block';
	};
};

window.onload = () => {
	startBtn.addEventListener('click', start);
	window.music = new Howl({
		src: ['/assets/stars.mp3'],
		loop: true
	});
	VanillaTilt.init(hunter, {
		reverse: true,
		'full-page-listening': true,
		max: 60
	});
};
