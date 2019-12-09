// tests go here; this will not be compiled when this package is used as an extension.
led.plot(2, 0)
basic.forever(function () {
    if (input.touchP0.isTouched()) {
        led.plot(0, 0)
    } else {
        led.unplot(0, 0)
    }
    if (input.touchP2.isTouched()) {
        led.plot(4, 0)
    } else {
        led.unplot(4, 0)
    }
})
input.touchP0.onEvent(TouchButtonEvent.Down, function () {
    for (let i = 0; i < 5; ++i)
        led.unplot(i, 1)
    led.plot(0, 1)
})
input.touchP0.onEvent(TouchButtonEvent.Up, function () {
    led.plot(1, 1)
})
input.touchP0.onEvent(TouchButtonEvent.Click, function () {
    led.plot(2, 1)
})
input.touchP0.onEvent(TouchButtonEvent.LongClick, function () {
    led.plot(3, 1)
})
input.touchP0.onEvent(TouchButtonEvent.Hold, function () {
    led.plot(4, 1)
})
