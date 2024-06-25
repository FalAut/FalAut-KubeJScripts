let $PatchouliAPI = Java.loadClass('vazkii.patchouli.api.PatchouliAPI').get()
let $Character = Java.loadClass('java.lang.Character')

StartupEvents.postInit((event) => {
    $PatchouliAPI.registerMultiblock(
        'kubejs:stabilization_ritual',
        $PatchouliAPI.makeMultiblock(
            [['TRRRRRRRR', 'TRTTTTTTT', 'TRTRRRRRT', 'TRTRTTTRT', 'TRTR0RTRT', 'TRTTTRTRT', 'TRRRRRTRT', 'TTTTTTTRT', 'RRRRRRRRT']],
            new $Character('0'),
            Blocks.BEACON,
            new $Character('R'),
            Blocks.REDSTONE_WIRE,
            new $Character('T'),
            Blocks.TRIPWIRE
        )
    );
});