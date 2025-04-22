/**
 * Trainer overlay toggle
 */
document.addEventListener('keydown', function(event) {
    if(event.key !== 'Insert') {
        return;
    }

    const overlay = document.querySelector('.trainer');
    if (!overlay) return;

    if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
    }
});

/**
 * Trainer configuration
 */
const trainer = {
    interval: 50,
    features: {

        /**
         * Speedhack feature
         */
        speedhack: () => {
            if(!Array.isArray(speed)) {
                return;
            }
            const indexes = [...speed.keys()];
            [...document.querySelectorAll('.trainer > .speedhack > .speedhack-item')].filter((element) => !indexes.includes(parseInt(element.dataset.index))).forEach((element) => element.remove());
            speed.forEach((value, index) => {
                let element = document.querySelector(`.trainer > .speedhack > .speedhack-item[data-index="${index}"]`);
                if(element === null) {
                    let cloned = document.querySelector('#speedhack-item-template').content.cloneNode(true);
                    element = cloned.querySelector('.speedhack-item');
                    element.dataset.index = index;
                    element.querySelector('.speedhack-index').textContent = index;
                    document.querySelector('.speedhack').appendChild(cloned);
                }
                const valueOverride = element.querySelector('.speedhack-value');
                if(valueOverride.value !== '') {
                    speed[index] = parseFloat(valueOverride.value);
                }
                valueOverride.placeholder = speed[index];
            });
        },

        /**
         * Powerhack
         */
        powerhack: () => {
            if(!Array.isArray(power)) {
                return;
            }
            const indexes = [...power.keys()];
            [...document.querySelectorAll('.trainer > .powerhack > .powerhack-item')].filter((element) => !indexes.includes(parseInt(element.dataset.index))).forEach((element) => element.remove());
            power.forEach((value, index) => {
                let element = document.querySelector(`.trainer > .powerhack > .powerhack-item[data-index="${index}"]`);
                if(element === null) {
                    let cloned = document.querySelector('#powerhack-item-template').content.cloneNode(true);
                    element = cloned.querySelector('.powerhack-item');
                    element.dataset.index = index;
                    element.querySelector('.powerhack-index').textContent = index;
                    document.querySelector('.powerhack').appendChild(cloned);
                }
                const valueOverride = element.querySelector('.powerhack-value');
                if(valueOverride.value !== '') {
                    power[index] = parseFloat(valueOverride.value);
                }
                valueOverride.placeholder = power[index];
            });
        },

        /**
         * Damagehack
         */
        damagehack: () => {
            if(!Array.isArray(hitmag)) {
                return;
            }
            const indexes = [...hitmag.keys()];
            [...document.querySelectorAll('.trainer > .damagehack > .damagehack-item')].filter((element) => !indexes.includes(parseInt(element.dataset.index))).forEach((element) => element.remove());
            hitmag.forEach((value, index) => {
                let element = document.querySelector(`.trainer > .damagehack > .damagehack-item[data-index="${index}"]`);
                if(element === null) {
                    let cloned = document.querySelector('#damagehack-item-template').content.cloneNode(true);
                    element = cloned.querySelector('.damagehack-item');
                    element.dataset.index = index;
                    element.querySelector('.damagehack-index').textContent = index;
                    document.querySelector('.damagehack').appendChild(cloned);
                }
                const valueOverride = element.querySelector('.damagehack-value');
                if(valueOverride.value !== '') {
                    hitmag[index] = parseFloat(valueOverride.value);
                }
                valueOverride.placeholder = hitmag[index];
            });
        },

    },
};

/**
 * Trainer loop
 */
trainer.loop = setInterval(() => {
    trainer.features.speedhack();
    trainer.features.powerhack();
    trainer.features.damagehack();
}, trainer.interval);
