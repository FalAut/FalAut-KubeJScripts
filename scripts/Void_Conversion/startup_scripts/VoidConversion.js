ForgeEvents.onEvent("net.minecraftforge.event.entity.EntityLeaveLevelEvent", (event) => {
    const { entity, level } = event;
    if (level.clientSide || !entity.item || entity.item != "stone" || entity.y > level.minBuildHeight) return;

    const resultEntity = entity.block.createEntity("item");
    resultEntity.item = "obsidian";
    resultEntity.y = level.minBuildHeight - 20;
    resultEntity.spawn();
    resultEntity.setDeltaMovement(new Vec3d(0, (entity.fallDistance - 43) / 50, 0));
    resultEntity.setNoGravity(true);
    resultEntity.setGlowing(true);
});