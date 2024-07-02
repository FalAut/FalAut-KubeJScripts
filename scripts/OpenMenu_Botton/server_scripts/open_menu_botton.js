let $Optional = Java.loadClass("java.util.Optional");
let $SimpleMenuProvider = Java.loadClass("net.minecraft.world.SimpleMenuProvider");
let $ChestMenu = Java.loadClass("net.minecraft.world.inventory.ChestMenu");
let $CraftingMenu = Java.loadClass("net.minecraft.world.inventory.CraftingMenu");

NetworkEvents.dataReceived("open_crafting", (event) => {
    const { player, level } = event;

    player.openMenu(
        new $SimpleMenuProvider(
            (i, inv, p) =>
                new $CraftingMenu(i, inv, (func) => {
                    func.apply(level, player.blockPosition());
                    return $Optional.empty();
                }),
            Component.translatable("container.crafting")
        )
    );
});

NetworkEvents.dataReceived("open_enderchest", (event) => {
    const { player } = event;

    player.openInventoryGUI(player.enderChestInventory, Component.translatable("container.enderchest"));
});

NetworkEvents.dataReceived("open_trashcan", (event) => {
    const { player } = event;

    player.openMenu(new $SimpleMenuProvider((i, inv, p) => $ChestMenu.sixRows(i, inv), Component.translatable("container.trashcan")));
});
