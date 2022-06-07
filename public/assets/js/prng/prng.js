export default class PRNG {

    constructor(seed) {
        this.seed = seed;
        this.hashedSeed = seed => seed.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)
        this.hseed = this.hashedSeed(seed.toString())
    }

    getRandomFloat() {
        return Math.sin(this.hseed++);
    }

    random() {
        return Math.sin(this.hseed++);
    }

    getRandomBool() {
        return this.getRandomFloat() < 0.5;
    }


    getRandomBoolWithWeightPercentage(weight) {
        return this.getRandomFloat() < (weight / 100);
    }

    randomInRange(min = -999999, max = 999999) {

        return this.getRandomFloat() * (max - min + 1) + min;
    }

    getRandomInt(min = -999999, max = 999999) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.getRandomFloat() * (max - min + 1)) + min;
    }
}