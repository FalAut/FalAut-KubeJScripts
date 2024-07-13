let $EnchantmentHelper = Java.loadClass("net.minecraft.world.item.enchantment.EnchantmentHelper");

EntityEvents.death("player", (event) => {
    const { entity } = event;

    // Get player's last stand enchantment level
    const enchantmentLevel = $EnchantmentHelper.getEnchantmentLevel("kubejs:last_stand", entity);

    // If player has last stand enchantment
    if (enchantmentLevel > 0) {
        // Get the damage value from player hurt event
        let damage = entity.persistentData.getFloat("damage");
        // Calculate the xp required for revival
        const xpRequired = Math.max(1, 50 * ((1 - (entity.health - damage)) / enchantmentLevel));

        // If player has enough xp
        if (entity.xp >= xpRequired) {
            // Set player's health to 1 (prevent death)
            entity.setHealth(1);
            // Deduct the xp from the player
            entity.giveExperiencePoints(-xpRequired);
            // Cancel the death event
            event.cancel();
        }
    }
});

// We can't get the damage value in the death event, so here
EntityEvents.hurt("player", (event) => {
    const { entity, damage } = event;

    entity.persistentData.putFloat("damage", damage);
});