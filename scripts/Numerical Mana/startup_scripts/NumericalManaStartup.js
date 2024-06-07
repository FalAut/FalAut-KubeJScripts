let $BlockEntity = Java.loadClass('net.minecraft.world.level.block.entity.BlockEntity')

JadeEvents.onCommonRegistration((event) => {
    event.blockDataProvider('kubejs:numerical_mana', $BlockEntity).setCallback((tag, accessor) => {
        const { blockEntity } = accessor

        ;['currentMana', 'maxMana', 'mana', 'manaToGet'].forEach((key) => {
            if (blockEntity[key] != null) {
                tag.putInt(key, blockEntity[key])
            }
        })
    })
})
