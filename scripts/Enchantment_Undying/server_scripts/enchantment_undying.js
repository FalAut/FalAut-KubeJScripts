EntityEvents.death((event) => {
    const { source, entity, level } = event;
    // If the source of damage is command kill, return
    if (source.getType() == "genericKill") return;

    if (tryRemoveUndyingEnchantment(entity)) {
        // Set the entity's health to 1 (prevent death)
        entity.setHealth(1);
        // Remove all original potion effects and add the effects of the undying totem
        entity.removeAllEffects();
        entity.potionEffects.add("regeneration", 900, 1);
        entity.potionEffects.add("absorption", 100, 1);
        entity.potionEffects.add("fire_resistance", 800, 0);
        // Play the undying totem animation
        level.broadcastEntityEvent(entity, 35);

        // Cancel the death event
        event.cancel();
    }
});

// Try to remove the undying enchantment
function tryRemoveUndyingEnchantment(entity) {
    for (let item of entity.armorSlots) {
        let enchantmentTags = item.enchantmentTags;

        for (let i = 0; i < enchantmentTags.size(); i++) {
            let enchantment = enchantmentTags.get(i);
            if (enchantment.get("id") == "kubejs:undying") {
                // If the undying enchantment is found, remove it and return true
                enchantmentTags.remove(i);
                return true;
            }
        }
    }
    // Otherwise return false
    return false;
}