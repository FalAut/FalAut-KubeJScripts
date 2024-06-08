let $PatchouliAPI = Java.loadClass('vazkii.patchouli.api.PatchouliAPI').get()

const directions = ['east', 'west', 'south', 'north']
// prettier-ignore
const items = {
    east: ['minecraft:water_breathing', 'minecraft:night_vision', 'minecraft:swiftness', 'minecraft:leaping', 'minecraft:strength', 'minecraft:healing', 'minecraft:invisibility', 'minecraft:fire_resistance', 'minecraft:poison', 'minecraft:harming', 'minecraft:weakness', 'minecraft:slowness'],
    south: ['minecraft:diamond_ore', 'minecraft:lapis_ore', 'minecraft:emerald_ore', 'minecraft:redstone_ore', 'minecraft:gold_ore', 'minecraft:copper_ore', 'minecraft:iron_ore', 'minecraft:coal_ore', 'minecraft:sand', 'minecraft:gravel', 'minecraft:grass_block', 'minecraft:clay'],
    west: ['minecraft:music_disc_stal', 'minecraft:music_disc_strad', 'minecraft:music_disc_mellohi', 'minecraft:music_disc_mall', 'minecraft:music_disc_far', 'minecraft:music_disc_13', 'minecraft:music_disc_cat', 'minecraft:music_disc_chirp', 'minecraft:music_disc_blocks', 'minecraft:music_disc_ward', 'minecraft:music_disc_11', 'minecraft:music_disc_wait'],
    north: ['minecraft:glass', 'minecraft:charcoal', 'minecraft:cooked_cod', 'minecraft:cooked_chicken', 'minecraft:terracotta', 'minecraft:cooked_beef', 'minecraft:cooked_porkchop', 'minecraft:iron_ingot', 'minecraft:gold_ingot', 'minecraft:baked_potato', 'minecraft:stone', 'minecraft:green_dye']
}

let chestCheck = (/** @type {Internal.Level} */ level, /** @type {BlockPos} */ blockPos) => {
    if (!$PatchouliAPI.getMultiblock('kubejs:stabilization_ritual').validate(level, blockPos)) return

    let counts = { east: 0, south: 0, west: 0, north: 0 }

    directions.forEach((direction) => {
        let chest = level.getBlock(blockPos).offset(direction, 5)
        chest?.inventory.allItems.forEach((item) => {
            if (direction == 'east' && item == 'potion' && items.east.includes(item.nbt.Potion)) counts.east++
            if (items[direction].includes(item.id)) counts[direction]++
        })
    })

    return counts
}

let beaconCheck = (/** @type {Internal.Level} */ level, /** @type {Internal.BlockContainerJS} */ block) => {
    const radius = 4
    const { x, y, z } = block

    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                let blockPos = new BlockPos(x + dx, y + dy, z + dz)
                let block = level.getBlockState(blockPos).block

                if (block == Blocks.BEACON) return blockPos
            }
        }
    }
}

BlockEvents.rightClicked('beacon', (event) => {
    const { hand, level, block, player, item } = event
    if (hand !== 'MAIN_HAND' || item !== 'kubejs:division_sigil' || level.dimension !== 'minecraft:the_end') return

    let counts = chestCheck(level, block.pos)

    if (counts) {
        player.tell('\n\nStabilization Ritual\n')
        player.tell(`§c- To the north, Children of Fire: ${counts.north} / 12`)
        player.tell(`§a- To the south, Gifts of Earth: ${counts.south} / 12`)
        player.tell(`§b- To the east, Descendants of Water: ${counts.east} / 12`)
        player.tell(`§e- To the west, Spices of Air: ${counts.west} / 12\n`)
        player.tell('Ritual Markings: Completed')

        if (counts && Object.values(counts).every((count) => count == 12)) {
            player.tell('\nEverything is prepared.\n')
            player.tell('§4Sacrifice one who would sacrifice himself.')
        }
    }
})

EntityEvents.death((event) => {
    const { entity, level, source, server } = event

    if (level.dimension != 'minecraft:the_end' || !source.actual?.player) return
    let player = source.player

    if (entity.type == 'minecraft:iron_golem') {
        let blockPos = beaconCheck(level, entity.block)
        let counts = chestCheck(level, blockPos)

        if (counts && Object.values(counts).every((count) => count == 12)) {
            directions.forEach((direction) => level.getBlock(blockPos).offset(direction, 5).set('air'))
            level.getBlock(blockPos).set('air')

            let mobs = ['zombie', 'spider', 'cave_spider', 'witch', 'zombie_villager']

            for (let i = 0; i < 200; i++) {
                let mob = mobs[Math.floor(Math.random() * mobs.length)]
                let mobEntity = entity.block.createEntity(mob)
                mobEntity.addTag('trial_mob')
                mobEntity.x = Math.random() * 100 - 50 + entity.x
                mobEntity.y = 65
                mobEntity.z = Math.random() * 100 - 50 + entity.z
                mobEntity.spawn()
            }

            server.runCommandSilent('effect give @e[tag=trial_mob] minecraft:speed infinite 4')
            
            player.persistentData.putInt('trial_kill', 0)
            let bar = server.customBossEvents.create('kubejs:trial_bar', 'Kill: 0 / 100')
            bar.addPlayer(player)
            bar.setOverlay('notched_20')

            server.runCommandSilent(`title ${player.username} title "Trial Start"`)
            server.runCommandSilent(`title ${player.username} subtitle "The Siege has begun in 'The End'"`)

            entity.block.createExplosion().explosionMode('block').strength(5).causesFire(true).explode()
        }
    }

    if (entity.tags.contains('trial_mob')) {
        let amount = player.persistentData.getInt('trial_kill')
        let bar = server.customBossEvents.get('kubejs:trial_bar')

        amount++
        player.persistentData.putInt('trial_kill', amount)
        bar.progress += 0.01
        bar.name = `Kill: ${amount} / 100`

        if (amount >= 100) {
            bar.removePlayer(player)
            server.runCommandSilent('kill @e[tag=trial_mob]')
            server.runCommandSilent(`title ${player.username} title "Your Sigil has stabilized"`)
            server.runCommandSilent(`title ${player.username} subtitle "The Siege has ended in 'The End'"`)

            if (player.inventory.count('kubejs:division_sigil') >= 1) {
                server.runCommandSilent(`clear ${player.username} kubejs:division_sigil 1`)
                player.give('kubejs:pseudo_inversion_sigil')
            }
        }
    }
})
