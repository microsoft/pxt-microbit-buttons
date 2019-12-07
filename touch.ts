// Add your code here
/**
 * User interaction on buttons
 */
const enum TouchButtonEvent {
    //% block="click"
    Click = 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */,
    //% block="long click"
    LongClick = 4 /* DAL.MICROBIT_BUTTON_EVT_LONG_CLICK */,
    //% block="up"
    Up = 2 /* DAL.MICROBIT_BUTTON_EVT_UP */,
    //% block="down"
    Down = 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */
};

/**
 * Capacitive button support in micro:bit
 */
namespace touch {
    const CAPACITIVE_TOUCH_ID = 1200;
    const CAP_SAMPLES_2 = 3;

    /**
     * A self capacitive button mounted on micro:bit pins.
     */
    //% fixedInstances
    export class CapacitiveButton {
        private id: number;
        private pin: AnalogInOutPin;
        private calibration: number;
        private threshold: number;
        private lastReading: number;

        constructor(id: number, pin: AnalogInOutPin) {
            this.id = id;
            this.pin = pin;
            this.lastReading = -1;
            this.calibration = -1;
        }

        private read() {
            let reading = 0;
            const n = 1 << CAP_SAMPLES_2;
            for (let i = 0; i < n; ++i) {
                reading += this.pin.analogRead()
                this.pin.digitalWrite(true);
                basic.pause(1);
            }
            this.lastReading = reading >> CAP_SAMPLES_2;
            return this.lastReading;
        }

        private init() {
            const startWorker = this.lastReading < 0;
            // calibrate if needed
            if (this.calibration < 0) {
                const reading = this.read();
                this.calibration = reading;
                this.threshold = 3;
            }
            if (startWorker) {
                // never initialized
                // TODO: onIdle
                control.inBackground(() => this.idleWorker());
            }
        }

        private idleWorker() {
            while (true) {
                // don't interfere with calibration
                if (this.calibration >= 0)
                    this.read();
                basic.pause(20)
            }
        }

        /**
         * Gets the value of the capacitive pin
         */
        //% blockId=touchvalue block="%button value"
        value() {
            this.init();
            return this.lastReading;
        }

        /**
         * Calibrate
         */
        //% blockId=touchcalibrate block="%button calibrate"
        calibrate() {
            this.calibration = -1;
            this.init();
        }

        /**
         * Determines if the button is being pressed
         */
        //% blockId=touchistouched block="is %button touched"
        isTouched(): boolean {
            this.init();
            const state = this.calibration + this.threshold
                < this.lastReading;
            return state;
        }

        /**
         * Registers an button event
         */
        //% blockId=touchonevent block="on %button $event"
        onEvent(event: TouchButtonEvent, handler: () => void) {
            this.init();
            control.onEvent(this.id, event, handler);
        }
    }

    //% fixedInstance block="P0"
    export const pinP0 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P0, pins.P0);
    //% fixedInstance block="P1"
    export const pinP1 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P1, pins.P1);
    //% fixedInstance block="P2"
    export const pinP2 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P2, pins.P2);
}
