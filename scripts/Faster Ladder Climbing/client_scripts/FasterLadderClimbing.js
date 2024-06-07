PlayerEvents.tick((event) => {
    const { player } = event
    const { xRot, zza } = player

    if (!player.onClimbable() || player.isCrouching()) return

    const speed = 0.4
    const movement = Math.abs(xRot / 90) * speed

    if (xRot > 0 && zza == 0) {
        player.move('self', new Vec3d(0, -movement, 0))
    } else if (xRot < 0 && zza > 0) {
        player.move('self', new Vec3d(0, movement, 0))
    }
})
