let $BlockEntity = Java.loadClass('net.minecraft.world.level.block.entity.BlockEntity')

JadeEvents.onCommonRegistration((event) => {
    const manaMethods = ["currentMana", "maxMana", "mana", "manaToGet"];
    
    event.blockDataProvider("kubejs:numerical_mana", $BlockEntity).setCallback((tag, accessor) => {
        const { blockEntity } = accessor;

        manaMethods.forEach((key) => {
            if (blockEntity[key] != null) {
                tag.putInt(key, blockEntity[key]);
            }
        });
    });
});