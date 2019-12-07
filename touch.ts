// Add your code here
/**
 * User interaction on buttons
 */
const enum ButtonEvent {
    //% block="click"
    Click = 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */,
    //% block="long click"
    LongClick = 4 /* DAL.MICROBIT_BUTTON_EVT_LONG_CLICK */,
    //% block="up"
    Up = 2 /* DAL.MICROBIT_BUTTON_EVT_UP */,
    //% block="down"
    Down = 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */
};

namespace input {
    const CAPACITIVE_TOUCH_ID = 1200;
    const CAP_SAMPLES_2 = 3;

    class ButtonBase {
        private id: number;
        constructor(id: number) {
            this.id = id;
        }
    }

    //% fixedInstances
    export class CapacitiveButton {
        private id: number;
        private pin: AnalogInOutPin;
        private calibration = -1;
        private threshold = 3;

        constructor(id: number, pin: AnalogInOutPin) {
            this.id = id;
            this.pin = pin;
        }

        value() {
            this.init();
            return this.read();
        }

        private read() {
            let reading = 0;
            const n = 1 << CAP_SAMPLES_2;
            for (let i = 0; i < n; ++i) {
                reading += this.pin.analogRead()
                this.pin.digitalWrite(true);
                basic.pause(1);
            }
            reading = reading >> CAP_SAMPLES_2;
            return reading;
        }

        calibrate() {
            this.calibration = this.read();
            this.threshold = 3;
        }

        isTouched(): boolean {
            this.init();
            const reading = this.value();
            const state = this.calibration + this.threshold < reading;
            return state;
        }

        onEvent(event: ButtonEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }

        private init() {
            if (this.calibration < 0)
                this.calibrate();
        }
    }

    //% fixedInstance block="touch P0"
    export const touchP0 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P0, pins.P0);
    //% fixedInstance block="touch P1"
    export const touchP1 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P1, pins.P1);
    //% fixedInstance block="touch P2"
    export const touchP2 = new CapacitiveButton(CAPACITIVE_TOUCH_ID + DAL.MICROBIT_ID_IO_P2, pins.P2);
}
