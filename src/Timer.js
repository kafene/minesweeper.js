
/**
 * A simple timer class.
 */
export default class Timer {
    /*
     * @param {function} onTick A function called when the timer "ticks".
     * @param {number} interval The interval between timer "ticks" in milliseconds.
     */
    constructor(onTick, interval=1000) {
        if (typeof onTick !== "function") {
            throw new Error("onTick must be a function.");
        }
        if (typeof interval !== "number" || !Number.isInteger(interval)) {
            throw new Error("interval must be an integer.");
        }

        this.timerId = null;
        this.duration = 0;
        this.interval = interval;
        this.onTick = onTick;
    }

    get started() {
        return this.timerId != null;
    }

    /**
     * Start the timer.
     *
     * @return {boolean} True if the timer is started by this call, false if it was already running.
     */
    start() {
        if (this.started) {
            return false;
        }

        this.timerId = setInterval(() => {
            this.duration += 1;
            this.onTick(this);
        }, this.interval);

        return true;
    }

    /**
     * Stop the timer.
     *
     * @return {boolean} True if the timer is stopped by this call, false if it was not running.
     */
    stop() {
        if (!this.started) {
            return false;
        }

        clearInterval(this.timerId);
        this.timerId = null;

        return true;
    }

    /**
     * Reset the timer.
     * This both stops the timer and returns it to its initial state.
     */
    reset() {
        if (this.started) {
            this.stop();
        }

        this.timerId = null;
        this.duration = 0;
    }
}
