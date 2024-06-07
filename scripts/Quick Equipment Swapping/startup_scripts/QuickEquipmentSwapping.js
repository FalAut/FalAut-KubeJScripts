let $ArmorItem = Java.loadClass('net.minecraft.world.item.ArmorItem')
let $ElytraItem = Java.loadClass('net.minecraft.world.item.ElytraItem')
let $EnchantmentHelper = Java.loadClass('net.minecraft.world.item.enchantment.EnchantmentHelper')

ForgeEvents.onEvent('net.minecraftforge.event.ItemStackedOnOtherEvent', (event) => {
    const { player, carriedItem, slot, clickAction, stackedOnItem } = event

    if (!stackedOnItem.empty || clickAction != 'SECONDARY' || carriedItem.empty) return

    const { item } = carriedItem
    const equipSlot = item instanceof $ArmorItem ? item.equipmentSlot : item instanceof $ElytraItem ? EquipmentSlot.CHEST : null

    if (!equipSlot) return

    const currArmor = player.getItemBySlot(equipSlot)

    if (slot.mayPickup(player) && slot.mayPlace(currArmor) && !$EnchantmentHelper.hasBindingCurse(currArmor) && currArmor != carriedItem) {
        event.setCanceled(true)
        player.setItemSlot(equipSlot, carriedItem.copy())
        slot.set(currArmor.copy())
    }
})
