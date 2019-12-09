// tests go here; this will not be compiled when this package is used as an extension.
basic.forever(function () {
    console.logValue("p0", input.touchP0.value())
    if (input.touchP0.isTouched()) {
        led.plot(0, 0)
    } else {
        led.unplot(0, 0)
    }
})
basic.forever(function () {
    console.logValue("p2", input.touchP2.value())
    if (input.touchP2.isTouched()) {
        led.plot(4, 0)
    } else {
        led.unplot(4, 0)
    }
})