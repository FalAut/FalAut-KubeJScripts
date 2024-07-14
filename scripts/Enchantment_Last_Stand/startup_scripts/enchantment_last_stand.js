let $EnchantmentHelper = Java.loadClass("net.minecraft.world.item.enchantment.EnchantmentHelper");

ForgeEvents.onEvent("net.minecraftforge.event.entity.living.LivingHurtEvent", (event) => {
    const { entity, amount } = event;
    if (!entity.isPlayer()) return;
    // Get player's last stand enchantment level
    const enchantmentLevels = $EnchantmentHelper.getEnchantmentLevel("kubejs:last_stand", entity);
    // If player has last stand enchantment
    if (enchantmentLevels > 0) {
        // Calculate the xp required for revival
        const xpRequired = Math.max(1, (50 * (1 - (entity.health - amount))) / enchantmentLevels);
        // If player has enough xp
        if (getPlayerXP(entity) >= xpRequired) {
            // Set player's health to 1 (prevent death)
            entity.setHealth(1);
            // Deduct the xp from the player
            entity.giveExperiencePoints(-xpRequired);
            // Cancel the hurt event
            event.setCanceled(true);
        }
    }
});

// minecraft doesn't update experience properly, so we have to do this
function sum(n, a0, d) {
    return (n * (2 * a0 + (n - 1) * d)) / 2;
}

function getExperienceForLevel(level) {
    if (level == 0) return 0;
    if (level <= 15) return sum(level, 7, 2);
    if (level <= 30) return 315 + sum(level - 15, 37, 5);
    return 1395 + sum(level - 30, 112, 9);
}

function getPlayerXP(player) {
    return getExperienceForLevel(player.experienceLevel) + player.totalExperience;
}