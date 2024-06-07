let $Block = Java.loadClass('net.minecraft.world.level.block.Block')

JadeEvents.onClientRegistration((event) => {
    event.block('kubejs:numerical_mana', $Block).tooltip((tooltip, accessor) => {
        const { serverData } = accessor
        if (!serverData) return

        let currentMana = serverData.get('currentMana') || serverData.get('mana')
        let maxMana = serverData.get('maxMana') || serverData.get('manaToGet')

        if (currentMana) {
            tooltip.add(`§bMana: ${currentMana}${maxMana ? '/' + maxMana : ''}`)
        }
    })
})
