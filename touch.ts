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

    const MICROBIT_BUTTON_STATE_INITIALIZED = 0x0f
    const MICROBIT_BUTTON_STATE_CALIBRATION_REQUIRED = 0x10
    const MICROBIT_BUTTON_STATE_CALIBRATION_INPROGRESS = 0x20

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
        private status: number;
        private sigma: number;
        private downStartTime: number;

        constructor(id: number, pin: AnalogInOutPin) {
            this.id = id;
            this.pin = pin;
            this.sigma = 0;
            this.status = 0;
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
            if (!this.status) {
                this.status |= MICROBIT_BUTTON_STATE_INITIALIZED;
                control.inBackground(() => this.idleWorker());
            }

            // calibrate if needed
            if (this.status & MICROBIT_BUTTON_STATE_CALIBRATION_REQUIRED) {
                this.status &= ~MICROBIT_BUTTON_STATE_CALIBRATION_REQUIRED;
                this.status |= MICROBIT_BUTTON_STATE_CALIBRATION_INPROGRESS;
                const reading = this.read();
                this.calibration = reading;
                this.threshold = 3;
                this.status &= ~MICROBIT_BUTTON_STATE_CALIBRATION_INPROGRESS;
            }
        }

        private idleWorker() {
            while (true) {
                // don't interfere with calibration
                if (!(this.status & MICROBIT_BUTTON_STATE_CALIBRATION_INPROGRESS))
                    this.periodicCallback();
                basic.pause(20)
            }
        }

        private periodicCallback() {
            //
            // If the pin is pulled low (touched), increment our culumative counter.
            // otherwise, decrement it. We're essentially building a lazy follower here.
            // This makes the output debounced for buttons, and desensitizes touch sensors
            // (particularly in environments where there is mains noise!)
            //
            this.read();
            if (this.isActive()) {
                if (this.sigma < DAL.MICROBIT_BUTTON_SIGMA_MAX)
                    this.sigma++;
            }
            else {
                if (this.sigma > DAL.MICROBIT_BUTTON_SIGMA_MIN)
                    this.sigma--;
            }

            // Check to see if we have off->on state change.
            if (this.sigma > DAL.MICROBIT_BUTTON_SIGMA_THRESH_HI
                && !(this.status & DAL.MICROBIT_BUTTON_STATE)) {
                // Record we have a state change, and raise an event.
                this.status |= DAL.MICROBIT_BUTTON_STATE;
                control.raiseEvent(this.id, DAL.MICROBIT_BUTTON_EVT_DOWN);

                //Record the time the button was pressed.
                this.downStartTime = input.runningTime();
            }

            // Check to see if we have on->off state change.
            if (this.sigma < DAL.MICROBIT_BUTTON_SIGMA_THRESH_LO
                && (this.status & DAL.MICROBIT_BUTTON_STATE)) {
                this.status &= ~DAL.MICROBIT_BUTTON_STATE;
                control.raiseEvent(this.id, DAL.MICROBIT_BUTTON_EVT_UP);

                //determine if this is a long click or a normal click and send event
                if ((input.runningTime() - this.downStartTime) >= DAL.MICROBIT_BUTTON_LONG_CLICK_TIME)
                    control.raiseEvent(this.id, DAL.MICROBIT_BUTTON_EVT_LONG_CLICK);
                else
                    control.raiseEvent(this.id, DAL.MICROBIT_BUTTON_EVT_CLICK);
            }

            //if button is pressed and the hold triggered event state is not triggered AND we are greater than the button debounce value
            if ((this.status & DAL.MICROBIT_BUTTON_STATE)
                && !(this.status & DAL.MICROBIT_BUTTON_STATE_HOLD_TRIGGERED)
                && (input.runningTime() - this.downStartTime) >= DAL.MICROBIT_BUTTON_HOLD_TIME) {
                //set the hold triggered event flag
                this.status |= DAL.MICROBIT_BUTTON_STATE_HOLD_TRIGGERED;

                //fire hold event
                control.raiseEvent(this.id, DAL.MICROBIT_BUTTON_EVT_HOLD);
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
            this.status |= MICROBIT_BUTTON_STATE_CALIBRATION_REQUIRED;
            this.init();
        }

        /**
         * Determines if the button is being pressed
         */
        //% blockId=touchistouched block="is %button touched"
        isTouched(): boolean {
            this.init();
            return this.isActive();
        }

        private isActive(): boolean {
            return this.calibration + this.threshold < this.lastReading;
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
