// little example of register enchantment for test
StartupEvents.registry("enchantment", (event) => {
    event.create("last_stand").armor().maxLevel(2);
});
// take any armor in hand and use the command /enchant @p kubejs:last_stand in game