const { $Item } = require("packages/net/minecraft/world/item/$Item");
const { $ClipContext$Fluid } = require("packages/net/minecraft/world/level/$ClipContext$Fluid");
const { $HitResult$Type } = require("packages/net/minecraft/world/phys/$HitResult$Type");
const { $TickEvent$PlayerTickEvent } = require("packages/net/minecraftforge/event/$TickEvent$PlayerTickEvent");
const { $LivingFallEvent } = require("packages/net/minecraftforge/event/entity/living/$LivingFallEvent");
const { $PlayerFlyableFallEvent } = require("packages/net/minecraftforge/event/entity/player/$PlayerFlyableFallEvent");

global.SlimeSlingUsing = (itemstack, level, entity, timeLeft) => {
    if (!entity.onGround()) return;

    let hitResult = $Item.getPlayerPOVHitResult(level, entity, $ClipContext$Fluid.NONE);
    let timeUsed = itemstack.useDuration - timeLeft;
    let i = timeUsed / 20;

    i = (i * i + i * 2) / 3;
    i *= 4;

    if (i > 6) i = 6;

    if (hitResult?.type == $HitResult$Type.BLOCK) {
        let vec3 = entity.lookAngle.normalize();

        entity.addDeltaMovement(Vec3d(vec3.x() * -i, (vec3.y() * -i) / 3, vec3.z() * -i));
        addBounceHandler(entity, 0);
    }

    if (i > 1) entity.playSound("entity.slime.jump_small", 1, 1);
};

function addBounceHandler(entity, bounce) {
    if (entity.isPlayer() && !entity.isFake()) {
        entity.persistentData.putBoolean("bounce", true);
        let bounceData = entity.persistentData.get("bounceData") || {};
        bounceData.bounce = bounce;
        bounceData.bounceTick = entity.age;
        entity.persistentData.put("bounceData", bounceData);
    }
}

global.BounceHandler = (/**@type {$TickEvent$PlayerTickEvent} */ event) => {
    const { player } = event;
    if (!player.persistentData.getBoolean("bounce")) return;

    if (
        player.abilities.flying ||
        player.isSwimming() ||
        player.isInWaterOrBubble() ||
        player.onClimbable() ||
        player.isSpectator() ||
        player.isFallFlying()
    ) {
        player.persistentData.putBoolean("bounce", false);
        return;
    }

    let bounceData = player.persistentData.get("bounceData");
    if (!bounceData) {
        bounceData = {
            bounce: 0,
            bounceTick: 0,
            lastMoveX: 0,
            lastMoveZ: 0,
            wasInAir: false,
            timer: 0,
        };
        player.persistentData.put("bounceData", bounceData);
    }

    if (player.age == bounceData.bounceTick) {
        player.setDeltaMovement(Vec3d(player.deltaMovement.x(), bounceData.bounce, player.deltaMovement.z()));
        bounceData.bounceTick = 0;
    }

    if (
        !player.onGround() &&
        player.age != bounceData.bounceTick &&
        (bounceData.lastMoveX != player.deltaMovement.x() || bounceData.lastMoveZ != player.deltaMovement.z())
    ) {
        let d = 0.935;
        player.setDeltaMovement(Vec3d(player.deltaMovement.x() / d, player.deltaMovement.y(), player.deltaMovement.z() / d));
        player.hasImpulse = true;
        bounceData.lastMoveX = player.deltaMovement.x();
        bounceData.lastMoveZ = player.deltaMovement.z();
    }

    if (bounceData.wasInAir && player.onGround()) {
        if (bounceData.timer == 0) {
            bounceData.timer = player.age;
        } else if (player.age - bounceData.timer > 5) {
            player.persistentData.putBoolean("bounce", false);
            player.persistentData.remove("bounceData");
            return;
        }
    } else {
        bounceData.timer = 0;
        bounceData.wasInAir = true;
    }

    player.persistentData.put("bounceData", bounceData);
};

global.OnFallWithSlimeBoots = (/**@type {$LivingFallEvent} */ event) => {
    const { entity, distance } = event;
    const { level } = entity;
    if (entity.getItemBySlot("feet") != "kubejs:slime_boots") return;

    if (!entity.crouching && distance > 2) {
        if (!entity.abilities.mayfly) {
            event.setDamageMultiplier(0);
            entity.resetFallDistance();
        } else {
            event.setDistance(distance);
        }

        if (level.clientSide) {
            const motion = entity.deltaMovement;

            entity.setDeltaMovement(Vec3d(motion.x(), motion.y() * -0.9, motion.z()));
            entity.hasImpulse = true;
            entity.setOnGround(false);
        } else {
            event.setCanceled(true);
        }

        entity.playSound("minecraft:entity.slime.squish");

        for (let i = 0; i < 8; i++) {
            const random1 = entity.random.nextFloat() * 6.2831855;
            const random2 = entity.random.nextFloat() * 0.5 + 0.5;
            const xOffset = Math.sin(random1) * 0.5 * random2;
            const yOffset = Math.cos(random1) * 0.5 * random2;
            level.addParticle("minecraft:item_slime", entity.x + xOffset, entity.y, entity.z + yOffset, 0, 0, 0);
        }
        addBounceHandler(entity, entity.deltaMovement.y());
    }
};

StartupEvents.registry("item", (event) => {
    event
        .create("slime_sling")
        .unstackable()
        .use(() => true)
        .useAnimation("bow")
        .useDuration(() => 72000)
        .releaseUsing((itemstack, level, entity, timeLeft) => {
            global.SlimeSlingUsing(itemstack, level, entity, timeLeft);
        });

    event.create("slime_boots", "boots");
});

ForgeEvents.onEvent($TickEvent$PlayerTickEvent, (event) => {
    if (event.phase != "END") return;
    global.BounceHandler(event);
});

ForgeEvents.onEvent($LivingFallEvent, (event) => {
    global.OnFallWithSlimeBoots(event);
});

ForgeEvents.onEvent($PlayerFlyableFallEvent, (event) => {
    global.OnFallWithSlimeBoots(event);
});
