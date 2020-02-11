// tests go here; this will not be compiled when this package is used as an extension.
led.plot(2, 0)
/*
basic.forever(function () {
    console.logValue("p0t", input.touchP0.threshold)
    console.logValue("p0", input.touchP0.value())
    if (input.touchP0.isTouched()) {
        led.plot(0, 0)
    } else {
        led.unplot(0, 0)
    }
})
*/
function bind(pin: input.CapacitiveButton, row: number) {
    pin.onEvent(TouchButtonEvent.Down, function () {
        for (let i = 0; i < 5; ++i)
            led.unplot(i, row)
        led.plot(0, row)
    })
    pin.onEvent(TouchButtonEvent.Up, function () {
        led.unplot(0, row)
        led.plot(1, row)
    })
    pin.onEvent(TouchButtonEvent.Click, function () {
        led.plot(2, row)
    })
    pin.onEvent(TouchButtonEvent.LongClick, function () {
        led.plot(3, row)
    })
    pin.onEvent(TouchButtonEvent.Hold, function () {
        led.plot(4, row)
    })
}

bind(input.touchP1, 1)



