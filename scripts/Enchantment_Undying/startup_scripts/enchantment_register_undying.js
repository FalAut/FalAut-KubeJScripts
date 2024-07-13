// little example of register enchantment for test
StartupEvents.registry("enchantment", (event) => {
    event.create("undying").armor()
});
// take any armor in hand and use the command /enchant @p kubejs:undying in game