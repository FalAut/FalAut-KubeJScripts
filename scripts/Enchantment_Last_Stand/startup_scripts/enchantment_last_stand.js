let $EnchantmentHelper = Java.loadClass("net.minecraft.world.item.enchantment.EnchantmentHelper");

ForgeEvents.onEvent("net.minecraftforge.event.entity.living.LivingHurtEvent", (event) => {
    const { entity, amount } = event;
    if (!entity.isPlayer()) return;

    const enchantmentLevels = $EnchantmentHelper.getEnchantmentLevel("kubejs:last_stand", entity);

    if (enchantmentLevels > 0 && entity.health - amount < 1) {
        const xpRequired = Math.max(1, (50 * (1 - (entity.health - amount))) / enchantmentLevels);
        if (getPlayerXP(entity) >= xpRequired) {
            entity.setHealth(1);
            entity.giveExperiencePoints(-xpRequired);
            event.setAmount(0);
            event.setCanceled(true);
        }
    }
});

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
