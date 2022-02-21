//jshint esversion:6

'use strict';

class Workout {
    constructor(coords, distance, duration) {
        this._coords = coords; // [latitude,longitude]
        this._distance = distance; // in km
        this._duration = duration; // in min
        this._date = new Date();
        this._id = (Date.now() + '').slice(-10);
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this._type[0].toUpperCase()}${this._type.slice(1)} on ${months[this._date.getMonth()]} ${this._date.getDate()}`;
    }

    get id() {
        return this._id;
    }

    get date() {
        return this._date;
    }

    get coords() {
        return this._coords;
    }

    get distance() {
        return this._distance;
    }

    get duration() {
        return this._duration;
    }

    get type() {
        return this._type;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this._type = 'running';
        this._cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    get cadence() {
        return this._cadence;
    }

    calcPace() {
        // min/km
        this._pace = this._duration / this._distance;
        return this._pace;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this._type = 'cycling';
        this._elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    get elevationGain() {
        return this._elevationGain;
    }

    calcSpeed() {
        this._speed = this._distance / (this._duration / 60);
        return this._speed;
    }
}

////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    constructor() {
        this._workouts = [];
        this._map = L.map('map');
        this._mapMark = undefined;
        this._mapZoomLevel = 13;
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click',this._moveToView.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not fetch location!!!');
                }
            );
        }
    }

    _loadMap(pos) {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        this._map.setView(coords, this._mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this._map);

        this._map.on('click', this._showForm.bind(this));
    }

    _moveToView(e) {
        const workoutEL = e.target.closest('.workout');
        
        if(!workoutEL) return;

        const workout = this._workouts.find(work => work.id === workoutEL.dataset.id);

        this._map.setView(workout.coords,this._mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            }
        });
    }

    _showForm(mapEvent) {
        const { latlng } = mapEvent;
        this._mapMark = [latlng.lat, latlng.lng];
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        //prettier-ignore
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid',1000);
    }

    _toggleElevationField() {
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    _renderMapMarker(workout) {
        L.marker(workout.coords)
            .addTo(this._map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                }).setContent(`${workout.type === 'running'? ' 🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            )
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'running'? ' 🏃‍♂️' : '🚴‍♀️'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
        `;

        if(workout.type === 'running')
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.calcPace().toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
            </li>
            `;

        if(workout.type === 'cycling')
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.calcSpeed().toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            </li>
            `;
        
        form.insertAdjacentHTML('afterend',html);
    }

    _newWorkout(e) {
        const isValid = (...inputs) =>
            inputs.every(input => Number.isFinite(+input));
        const isPositive = (...inputs) => inputs.every(input => input > 0);
        e.preventDefault();

        //Get data from the form

        const type = inputType.value;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        let workout;

        if (type === 'running') {
            const cadence = inputCadence.value;
            //Validate Data
            if (
                !isValid(distance, duration, cadence) ||
                !isPositive(distance, duration, cadence)
            )
                return alert('Only postive inputs are supported');

            //Create Running Object

            workout = new Running(this._mapMark, distance, duration, cadence);
        }

        if (type === 'cycling') {
            const elevation = inputElevation.value;
            //Validate Data
            if (
                !isValid(distance, duration, elevation) ||
                !isPositive(distance, duration)
            )
                return alert('Only postive inputs are supported');

            //Create Cycling object

            workout = new Cycling(this._mapMark, distance, duration, elevation);
        }

        //Add object to the workout array
        this._workouts.push(workout);

        //Render workout on the map
        this._renderMapMarker(workout);

        //Render Workout on the list
        this._renderWorkout(workout);

        //hide the form
        this._hideForm();
    }
}

const app = new App();
