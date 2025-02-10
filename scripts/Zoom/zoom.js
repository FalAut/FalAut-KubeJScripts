const $KeyMapping = Java.loadClass('net.minecraft.client.KeyMapping');
const $GLFWkey = Java.loadClass('org.lwjgl.glfw.GLFW');

const Zoom = {
    MIN_FOV: 5, // minimum fov value, too small or too large values may cause issues
    SENSITIVITY: 5, // sensitivity of the scroll wheel
    SMOOTHING: 0.1, // smoothing factor for transition
    target: 50, // target zoom value, default is 50
    current: 0, // current zoom value
    active: false, // active state of the zoom
};

// register zoom keystrokes
const zoomKey = new $KeyMapping('key.kubejs.zoom', $GLFWkey.GLFW_KEY_Z, 'key.categories.gameplay');

ForgeModEvents.onEvent('net.minecraftforge.client.event.RegisterKeyMappingsEvent', (event) => {
    event.register(zoomKey);
});

// activating zoom when the player presses or holds the zoomKey.
ForgeEvents.onEvent('net.minecraftforge.client.event.InputEvent$Key', (event) => {
    // not activating zoom when the player is in the GUI or is using the spyglass
    if (Client.screen || Client.player.isScoping()) return;

    if (event.getKey() == zoomKey.getKey().getValue()) {
        // 0=release, 1=press, 2=hold
        Zoom.active = event.getAction() != 0;
    }
});

// zoom scroll wheel handler
ForgeEvents.onEvent('net.minecraftforge.client.event.InputEvent$MouseScrollingEvent', (event) => {
    if (!Zoom.active) return;

    const baseFov = Client.options.fov().get();
    const newTarget = Zoom.target + event.getScrollDelta() * Zoom.SENSITIVITY;
    // limit the zoom value range
    Zoom.target = JavaMath.clamp(newTarget, 0, baseFov - Zoom.MIN_FOV);

    event.setCanceled(true);
});

// set zoom
// maybe should set a cache here
ForgeEvents.onEvent('net.minecraftforge.client.event.ViewportEvent$ComputeFov', (event) => {
    // smooth switching
    if (Zoom.active) {
        Zoom.current += (Zoom.target - Zoom.current) * Zoom.SMOOTHING;
    } else {
        Zoom.current += (0 - Zoom.current) * Zoom.SMOOTHING;
    }

    event.setFOV(event.getFOV() - Zoom.current);
});
