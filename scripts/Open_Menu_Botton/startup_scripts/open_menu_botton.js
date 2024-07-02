let $Button = Java.loadClass("net.minecraft.client.gui.components.Button");
let $InventoryScreen = Java.loadClass("net.minecraft.client.gui.screens.inventory.InventoryScreen");

ForgeEvents.onEvent("net.minecraftforge.client.event.ScreenEvent$Init$Post", (event) => {
    const { screen } = event;

    if (screen instanceof $InventoryScreen) {
        screen.addRenderableWidget(
            $Button
                .builder(Text.of("a").font("kubejs:botton"), (button) => Client.player.sendData("open_crafting", {}))
                .bounds(screen.guiLeft + screen.getXSize() - 80, screen.guiTop + 60, 20, 20)
                .build()
        );

        screen.addRenderableWidget(
            $Button
                .builder(Text.of("b").font("kubejs:botton"), (button) => Client.player.sendData("open_enderchest", {}))
                .bounds(screen.guiLeft + screen.getXSize() - 55, screen.guiTop + 60, 20, 20)
                .build()
        );

        screen.addRenderableWidget(
            $Button
                .builder(Text.of("c").font("kubejs:botton"), (button) => Client.player.sendData("open_trashcan", {}))
                .bounds(screen.guiLeft + screen.getXSize() - 30, screen.guiTop + 60, 20, 20)
                .build()
        );
    }
});
