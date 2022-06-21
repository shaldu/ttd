export class Helpers {
    static clamp(number, min, max) {
        return Math.max(min, Math.min(number, max));
    }
}