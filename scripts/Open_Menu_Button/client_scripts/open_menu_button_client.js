// Open Menu Button - client_scripts

let $Button = Java.loadClass("net.minecraft.client.gui.components.Button");
let $InventoryScreen = Java.loadClass("net.minecraft.client.gui.screens.inventory.InventoryScreen");

ClientEvents.tick((event) => {
    let screen = Client.screen;
    let player = event.player;

    if (screen instanceof $InventoryScreen) {
        screen.addRenderableWidget(
            $Button
                .builder(Text.of("a").font("kubejs:botton"), (button) =>
                    player.sendData("server", { open_menu: "crafting_table" })
                )
                .bounds(screen.guiLeft + screen.getXSize() - 80, screen.guiTop + 60, 20, 20)
                .build()
        );

        screen.addRenderableWidget(
            $Button
                .builder(Text.of("b").font("kubejs:botton"), (button) =>
                    player.sendData("server", { open_menu: "enderchest" })
                )
                .bounds(screen.guiLeft + screen.getXSize() - 55, screen.guiTop + 60, 20, 20)
                .build()
        );

        screen.addRenderableWidget(
            $Button
                .builder(Text.of("c").font("kubejs:botton"), (button) =>
                    player.sendData("server", { open_menu: "trashcan" })
                )
                .bounds(screen.guiLeft + screen.getXSize() - 30, screen.guiTop + 60, 20, 20)
                .build()
        );
    }
});
