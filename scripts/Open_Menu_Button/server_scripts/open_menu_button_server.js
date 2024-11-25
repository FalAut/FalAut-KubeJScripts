// Open Menu Button - server_scripts

let $SimpleMenuProvider = Java.loadClass("net.minecraft.world.SimpleMenuProvider");
let $CraftingMenu = Java.loadClass("net.minecraft.world.inventory.CraftingMenu");
let $ChestMenu = Java.loadClass("net.minecraft.world.inventory.ChestMenu");
let $Optional = Java.loadClass("java.util.Optional");

NetworkEvents.dataReceived("server", (event) => {
    const { data, player, level } = event;

    if (data.open_menu == "crafting_table") {
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
    }

    if (data.open_menu == "enderchest") {
        player.openInventoryGUI(player.enderChestInventory, Component.translatable("container.enderchest"));
    }

    if (data.open_menu == "trashcan") {
        player.openMenu(
            new $SimpleMenuProvider(
                (i, inv, p) => $ChestMenu.sixRows(i, inv),
                Component.translatable("container.trashcan")
            )
        );
    }
});
