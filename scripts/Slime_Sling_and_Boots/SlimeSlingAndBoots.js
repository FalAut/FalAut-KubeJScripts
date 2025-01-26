/**
 *
 * @param {Internal.ServerPlayer} player
 * @param {number} bounceY
 */
function setBounceData(player, bounceY) {
    let bounceData = player.persistentData.get("bounceData");
    if (!bounceData) {
        bounceData = {
            bounceTick: 0,
            bounceY: 0,
            lastX: 0,
            lastZ: 0,
            wasInAir: false,
            groundTimer: 0,
        };
    }
    bounceData.bounceTick = player.age;
    bounceData.bounceY = bounceY;

    player.persistentData.put("bounceData", bounceData);
}

/**
 *
 * @param {Internal.LivingFallEvent} event
 * @returns
 */
function onFallWithSlimeBoots(event) {
    const { entity, distance } = event;
    if (!entity.isPlayer() || entity.isFake()) return;

    if (entity.getItemBySlot("feet") != "mierno:slime_boots") return;

    if (!entity.crouching && distance > 2) {
        if (entity.abilities.mayfly) {
            event.setDistance(distance);
        } else {
            event.setDamageMultiplier(0);
            entity.resetFallDistance();
        }

        if (entity.level.isClientSide()) {
            const motion = entity.deltaMovement;
            entity.setDeltaMovement(new Vec3d(motion.x(), motion.y() * -0.9, motion.z()));
            entity.hasImpulse = true;
            entity.setOnGround(false);
        } else if (event.isCancelable()) {
            event.setCanceled(true);
        }

        entity.playSound("minecraft:entity.slime.squish");

        for (let i = 0; i < 8; i++) {
            const angle = entity.random.nextFloat() * KMath.PI * 2;
            const radius = 0.5 * (0.5 + entity.random.nextFloat());
            const xOffset = Math.sin(angle) * radius;
            const zOffset = Math.cos(angle) * radius;
            entity.level.addParticle("minecraft:item_slime", entity.x + xOffset, entity.y, entity.z + zOffset, 0, 0, 0);
        }

        setBounceData(entity, entity.deltaMovement.y());
    }
}

StartupEvents.registry("item", (event) => {
    event.create("mierno:slime_boots", "boots");

    event
        .create("mierno:slime_sling")
        .unstackable()
        .use(() => true)
        .useAnimation("bow")
        .useDuration(() => 72000)
        .releaseUsing((itemStack, level, entity, timeLeft) => {
            if (!entity.onGround()) return;

            let timeUsed = itemStack.useDuration - timeLeft;
            let power = timeUsed / 20;
            power = (power * power + power * 2) / 3;
            power *= 4;
            if (power > 6) power = 6;

            if (getRayTraceBlock(entity)) {
                let lookVec = entity.lookAngle.normalize();
                let vec = new Vec3d(lookVec.x() * -power, (lookVec.y() * -power) / 3, lookVec.z() * -power);

                entity.addDeltaMovement(vec);
                setBounceData(entity, 0);
            }

            if (power > 1) {
                entity.playSound("entity.slime.jump_small", 1, 1);
            }
        });
});

ForgeEvents.onEvent("net.minecraftforge.event.TickEvent$PlayerTickEvent", (event) => {
    const { player, phase } = event;
    if (phase != "END") return;

    let bounceData = player.persistentData.get("bounceData");
    if (!bounceData) return;

    if (
        player.abilities.flying ||
        player.isSwimming() ||
        player.isInWaterOrBubble() ||
        player.onClimbable() ||
        player.isSpectator() ||
        player.isFallFlying()
    ) {
        player.persistentData.remove("bounceData");
        return;
    }

    if (player.age == bounceData.bounceTick) {
        player.setDeltaMovement(new Vec3d(player.deltaMovement.x(), bounceData.bounceY, player.deltaMovement.z()));
        bounceData.bounceTick = 0;
    }

    if (
        !player.onGround() &&
        (bounceData.lastX != player.deltaMovement.x() || bounceData.lastZ == player.deltaMovement.z())
    ) {
        let d = 0.935;
        let vec = new Vec3d(player.deltaMovement.x() / d, player.deltaMovement.y(), player.deltaMovement.z() / d);

        player.setDeltaMovement(vec);
        player.hasImpulse = true;
    }

    bounceData.lastX = player.deltaMovement.x();
    bounceData.lastZ = player.deltaMovement.z();

    if (bounceData.wasInAir && player.onGround()) {
        if (bounceData.groundTimer == 0) {
            bounceData.groundTimer = player.age;
        } else {
            if (player.age - bounceData.groundTimer > 5) {
                player.persistentData.remove("bounceData");
                return;
            }
        }
    } else {
        bounceData.wasInAir = true;
        bounceData.groundTimer = 0;
    }

    player.persistentData.put("bounceData", bounceData);
});

ForgeEvents.onEvent("net.minecraftforge.event.entity.living.LivingFallEvent", (event) => {
    onFallWithSlimeBoots(event);
});

ForgeEvents.onEvent("net.minecraftforge.event.entity.player.PlayerFlyableFallEvent", (event) => {
    onFallWithSlimeBoots(event);
});
