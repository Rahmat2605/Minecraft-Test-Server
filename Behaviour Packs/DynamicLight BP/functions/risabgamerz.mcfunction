# Clear ALL light blocks around the player every tick (runs first)
execute as @a at @s run fill ~-2 ~-2 ~-2 ~2 ~2 ~2 air replace light_block

# Then reapply based on current equipment

execute as @p[tag=solo] at @s run fill ~-4 ~1 ~-4 ~-2 ~1 ~4 air replace light_block
execute as @p[tag=solo] at @s run fill ~4 ~1 ~-4 ~2 ~1 ~4 air replace light_block
execute as @p[tag=solo] at @s run fill ~1 ~1 ~-2 ~-1 ~1 ~-4 air replace light_block
execute as @p[tag=solo] at @s run fill ~1 ~1 ~4 ~-1 ~1 ~2 air replace light_block
execute as @p[tag=solo] at @s run fill ~-4 ~2 ~-4 ~4 ~2 ~4 air replace light_block
execute as @p[tag=solo] at @s run fill ~-4 ~3 ~-4 ~4 ~4 ~4 air replace light_block
execute as @p[tag=solo] at @s run fill ~-4 ~ ~-4 ~4 ~-1 ~4 air replace light_block

execute as @p[tag=!solo] at @s run fill ~-3 ~1 ~-3 ~-2 ~1 ~3 air replace light_block
execute as @p[tag=!solo] at @s run fill ~3 ~1 ~-3 ~2 ~1 ~3 air replace light_block
execute as @p[tag=!solo] at @s run fill ~1 ~1 ~-2 ~-1 ~1 ~-3 air replace light_block
execute as @p[tag=!solo] at @s run fill ~1 ~1 ~3 ~-1 ~1 ~2 air replace light_block
execute as @p[tag=!solo] at @s run fill ~-3 ~2 ~-3 ~3 ~2 ~3 air replace light_block
execute as @p[tag=!solo] at @s run fill ~-3 ~2 ~-3 ~3 ~3 ~3 air replace light_block
execute as @p[tag=!solo] at @s run fill ~-3 ~ ~-3 ~3 ~-1 ~3 air replace light_block

#Detection for nearby players [A radius around the player about 3/4 blocks each direction with some spots]
execute as @p[tag=solo] at @s run tag @p[dx=-3,dz=3,dy=5,x=-1,y=0,z=1] remove solo
execute as @p[tag=solo] at @s run tag @p[dx=-3,dz=-3,dy=5,x=-1,y=0,z=-1] remove solo
execute as @p[tag=solo] at @s run tag @p[dx=3,dz=-3,dy=5,x=1,y=0,z=-1] remove solo
execute as @p[tag=solo] at @s run tag @p[dx=3,dz=3,dy=5,x=1,y=0,z=1] remove solo

#Additional Clearing Mechanisms, was implemented for creative support and to clear tiles while falling or jumping.
execute as @p at @s run fill ~ ~2 ~ ~ ~6 ~ air replace light_block
execute as @p at @s run fill ~ ~-2 ~ ~ ~-6 ~ air replace light_block
execute as @p[tag=nolight] at @s run fill ~ ~1 ~ ~ ~-1 ~ air replace light_block
tag @p[tag=nolight] remove nolight

give @a[hasitem={item=torch,quantity=4}] minecraf:torch 4
clear @a[hasitem={item=torch,quantity=4}] torch -1 4
give @a[hasitem={item=copper_torch,quantity=4}] minecraf:copper_torch 4
clear @a[hasitem={item=copper_torch,quantity=4}] copper_torch -1 4
give @a[hasitem={item=soul_torch,quantity=4}] minecraf:soul_torch 4
clear @a[hasitem={item=soul_torch,quantity=4}] soul_torch -1 4
give @a[hasitem={item=torch,quantity=64}] minecraf:torch 64
clear @a[hasitem={item=torch,quantity=64}] torch -1 64
give @a[hasitem={item=soul_torch,quantity=64}] minecraf:soul_torch 64
clear @a[hasitem={item=soul_torch,quantity=64}] soul_torch -1 64
give @a[hasitem={item=campfire,quantity=64}] minecraf:campfire 64
clear @a[hasitem={item=campfire,quantity=64}] campfire -1 64
give @a[hasitem={item=soul_campfire,quantity=64}] minecraf:soul_campfire 64
clear @a[hasitem={item=soul_campfire,quantity=64}] soul_campfire -1 64
give @a[hasitem={item=lantern,quantity=64}] minecraf:lantern 64
clear @a[hasitem={item=lantern,quantity=64}] lantern -1 64
give @a[hasitem={item=copper_lantern,quantity=64}] minecraf:copper_lantern 64
clear @a[hasitem={item=copper_lantern,quantity=64}] copper_lantern -1 64
give @a[hasitem={item=exposed_copper_lantern,quantity=64}] minecraf:exposed_copper_lantern 64
clear @a[hasitem={item=exposed_copper_lantern,quantity=64}] exposed_copper_lantern -1 64
give @a[hasitem={item=weathered_copper_lantern,quantity=64}] minecraf:weathered_copper_lantern 64
clear @a[hasitem={item=weathered_copper_lantern,quantity=64}] weathered_copper_lantern -1 64
give @a[hasitem={item=oxidized_copper_lantern,quantity=64}] minecraf:oxidized_copper_lantern 64
clear @a[hasitem={item=oxidized_copper_lantern,quantity=64}] oxidized_copper_lantern -1 64
give @a[hasitem={item=waxed_copper_lantern,quantity=64}] minecraf:waxed_copper_lantern 64
clear @a[hasitem={item=waxed_copper_lantern,quantity=64}] waxed_copper_lantern -1 64
give @a[hasitem={item=waxed_exposed_copper_lantern,quantity=64}] minecraf:waxed_exposed_copper_lantern 64
clear @a[hasitem={item=waxed_exposed_copper_lantern,quantity=64}] waxed_exposed_copper_lantern -1 64
give @a[hasitem={item=waxed_oxidized_copper_lantern,quantity=64}] minecraf:waxed_oxidized_copper_lantern 64
clear @a[hasitem={item=waxed_oxidized_copper_lantern,quantity=64}] waxed_oxidized_copper_lantern -1 64
give @a[hasitem={item=waxed_weathered_copper_lantern,quantity=64}] minecraf:waxed_weathered_copper_lantern 64
clear @a[hasitem={item=waxed_weathered_copper_lantern,quantity=64}] waxed_weathered_copper_lantern -1 64
give @a[hasitem={item=copper_lantern}] minecraf:copper_lantern
clear @a[hasitem={item=copper_lantern}] copper_lantern -1 1
give @a[hasitem={item=exposed_copper_lantern}] minecraf:exposed_copper_lantern
clear @a[hasitem={item=exposed_copper_lantern}] exposed_copper_lantern -1 1
give @a[hasitem={item=weathered_copper_lantern}] minecraf:weathered_copper_lantern
clear @a[hasitem={item=weathered_copper_lantern}] weathered_copper_lantern -1 1
give @a[hasitem={item=oxidized_copper_lantern}] minecraf:oxidized_copper_lantern
clear @a[hasitem={item=oxidized_copper_lantern}] oxidized_copper_lantern -1 1
give @a[hasitem={item=waxed_copper_lantern}] minecraf:waxed_copper_lantern
clear @a[hasitem={item=waxed_copper_lantern}] waxed_copper_lantern -1 1
give @a[hasitem={item=waxed_exposed_copper_lantern}] minecraf:waxed_exposed_copper_lantern
clear @a[hasitem={item=waxed_exposed_copper_lantern}] waxed_exposed_copper_lantern -1 1
give @a[hasitem={item=waxed_oxidized_copper_lantern}] minecraf:waxed_oxidized_copper_lantern
clear @a[hasitem={item=waxed_oxidized_copper_lantern}] waxed_oxidized_copper_lantern -1 1
give @a[hasitem={item=waxed_weathered_copper_lantern}] minecraf:waxed_weathered_copper_lantern
clear @a[hasitem={item=waxed_weathered_copper_lantern}] waxed_weathered_copper_lantern -1 1
give @a[hasitem={item=soul_lantern,quantity=64}] minecraf:soul_lantern 64
clear @a[hasitem={item=soul_lantern,quantity=64}] soul_lantern -1 64
give @a[hasitem={item=torch}] minecraf:torch
clear @a torch -1 1
give @a[hasitem={item=copper_torch}] minecraf:copper_torch
clear @a copper_torch -1 1
give @a[hasitem={item=soul_torch}] minecraf:soul_torch
clear @a soul_torch -1 1
give @a[hasitem={item=campfire}] minecraf:campfire
clear @a campfire -1 1
give @a[hasitem={item=soul_campfire}] minecraf:soul_campfire
clear @a soul_campfire -1 1
give @a[hasitem={item=lantern}] minecraf:lantern
clear @a lantern -1 1
give @a[hasitem={item=soul_lantern}] minecraf:soul_lantern
clear @a soul_lantern -1 1

execute as @e[hasitem={location=slot.weapon.mainhand,item=torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=14] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=14] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=14] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:copper_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=14] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:copper_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=14] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=redstone_ore}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=5] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=deepslate_redstone_ore}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=5] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=glow_lichen}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=5] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=conduit}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=5] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=crying_obsidian}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=5] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:soul_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=redstone_torch}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=7] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:soul_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:soul_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:campfire}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:exposed_copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:waxed_copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:oxidized_copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:waxed_weathered_copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:weathered_copper_bulb}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:exposed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:waxed_exposed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:waxed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:oxidized_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:waxed_weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraft:weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:waxed_exposed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:exposed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:waxed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:oxidized_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:waxed_weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:exposed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:waxed_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=12] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:oxidized_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:waxed_weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:weathered_copper_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=4] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:campfire}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=amethyst_block}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=budding_amethyst}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=13] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=minecraf:soul_campfire}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.offhand,item=minecraf:soul_campfire}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=8] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=sea_lantern}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=11] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=lit_pumpkin}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=11] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=pearlescent_froglight}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=11] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=verdant_froglight}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=11] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=ochre_froglight}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=11] keep
execute as @e[hasitem={location=slot.weapon.mainhand,item=totem_of_undying}] at @s run fill ~~1~ ~~~ light_block ["block_light_level"=2] keep


#Used to help determine what item gets what light source when thrown
tag @e[type=item,name="Torch"] add medium
tag @e[type=item,name="Copper Torch"] add medium
tag @e[type=item,name="Copper Bulb"] add max
tag @e[type=item,name="Oxidized Copper Bulb"] add medium
tag @e[type=item,name="Waxed Oxidized Copper Bulb"] add medium
tag @e[type=item,name="Weathered Copper Bulb"] add low
tag @e[type=item,name="Waxed Weathered Copper Bulb"] add low
tag @e[type=item,name="Exposed Copper Bulb"] add high
tag @e[type=item,name="Waxed Exposed Copper Bulb"] add high
tag @e[type=item,name="Waxed Copper Bulb"] add max
tag @e[type=item,name="Copper Lantern"] add max
tag @e[type=item,name="Oxidized Copper Lantern"] add medium
tag @e[type=item,name="Waxed Oxidized Copper Lantern"] add medium
tag @e[type=item,name="Weathered Copper Lantern"] add low
tag @e[type=item,name="Waxed Weathered Copper Lantern"] add low
tag @e[type=item,name="Exposed Copper Lantern"] add high
tag @e[type=item,name="Waxed Exposed Copper Lantern"] add high
tag @e[type=item,name="Waxed Copper Lantern"] add max
tag @e[type=item,name="Lantern"] add mediumhigh
tag @e[type=item,name="Copper Lantern"] add mediumhigh
tag @e[type=item,name="Conduit"] add mediumhigh
tag @e[type=item,name="Budding Amethyst"] add mediumhigh
tag @e[type=item,name="Block of Amethyst"] add medium
tag @e[type=item,name="Redstone Torch"] add verylow
tag @e[type=item,name="Glow Lichen"] add verylow
tag @e[type=item,name="Beacon"] add high
tag @e[type=item,name="Magma Block"] add low
tag @e[type=item,name="Jack o'Lantern"] add medium
tag @e[type=item,name="Brewing Stand"] add mediumlow
tag @e[type=item,name="Sea Lantern"] add high
tag @e[type=item,name="Verdant Froglight"] add high
tag @e[type=item,name="Ochre Froglight"] add high
tag @e[type=item,name="Pearlescent Froglight"] add high
tag @e[type=item,name="End Rod"] add mediumhigh
tag @e[type=item,name="Blaze Rod"] add medium
tag @e[type=item,name="Glowstone"] add max
tag @e[type=item,name="Totem of Undying"] add medium
tag @e[type=item,name="Glowstone Dust"] add low
tag @e[type=item,name="Ender Chest"] add low
tag @e[type=item,name="Enchantment Table"] add medium
tag @e[type=item,name="Campfire"] add medium
tag @e[type=item,name="Redstone of Block"] add low
tag @e[type=item,name="Bottle o' Enchanting"] add mediumlow
tag @e[type=item,name="Blaze Powder"] add mediumlow
tag @e[type=item,name="Magma Cream"] add low
tag @e[type=item,name="Fire Charge"] add low
tag @e[type=item,name="Blue Ice"] add verylow
tag @e[type=item,name="Lava Bucket"] add mediumhigh
tag @e[type=item,name="Shroomlight"] add high
tag @e[type=item,name="Soul Torch"] add medium
tag @e[type=item,name="Soul Lantern"] add mediumhigh
tag @e[type=item,name="Soul Campfire"] add medium 
tag @e[type=item,name="Crying Obsidian"] add medium 


tag @e[type=item,name="Oxidized Copper Bulb"] add lghsrc
tag @e[type=item,name="Waxed Oxidized Copper Bulb"] add lghsrc
tag @e[type=item,name="Weathered Copper Bulb"] add lghsrc
tag @e[type=item,name="Waxed Weathered Copper Bulb"] add lghsrc
tag @e[type=item,name="Exposed Bulb"] add lghsrc
tag @e[type=item,name="Waxed Exposed Copper Bulb"] add lghsrc
tag @e[type=item,name="Waxed Copper Bulb"] add lghsrc
tag @e[type=item,name="Oxidized Copper Lantern"] add lghsrc
tag @e[type=item,name="Waxed Oxidized Copper Lantern"] add lghsrc
tag @e[type=item,name="Weathered Copper Lantern"] add lghsrc
tag @e[type=item,name="Waxed Weathered Copper Lantern"] add lghsrc
tag @e[type=item,name="Exposed Lantern"] add lghsrc
tag @e[type=item,name="Waxed Exposed Copper Lantern"] add lghsrc
tag @e[type=item,name="Waxed Copper Lantern"] add lghsrc
tag @e[type=item,name="Redstone Torch"] add lghsrc
tag @e[type=item,name="Torch"] add lghsrc
tag @e[type=item,name="Copper Torch"] add lghsrc
tag @e[type=item,name="Lantern"] add lghsrc
tag @e[type=item,name="Glow Lichen"] add lghsrc
tag @e[type=item,name="Glowstone"] add lghsrc
tag @e[type=item,name="Blaze Rod"] add lghsrc
tag @e[type=item,name="Beacon"] add lghsrc
tag @e[type=item,name="Magma Block"] add lghsrc
tag @e[type=item,name="Budding Amethyst"] add lghsrc
tag @e[type=item,name="Jack o'Lantern"] add lghsrc
tag @e[type=item,name="Block of Amethyst"] add lghsrc
tag @e[type=item,name="Sea Lantern"] add lghsrc
tag @e[type=item,name="Ochre Froglight"] add lghsrc
tag @e[type=item,name="Pearlescent Froglight"] add lghsrc
tag @e[type=item,name="Verdant Froglight"] add lghsrc
tag @e[type=item,name="Brewing Stand"] add lghsrc
tag @e[type=item,name="End Rod"] add lghsrc
tag @e[type=item,name="Totem of Undying"] add lghsrc
tag @e[type=item,name="Glowstone Dust"] add lghsrc
tag @e[type=item,name="Ender Chest"] add lghsrc
tag @e[type=item,name="Enchantment Table"] add lghsrc
tag @e[type=item,name="Campfire"] add lghsrc
tag @e[type=item,name="Redstone of Block"] add lghsrc
tag @e[type=item,name="Bottle o' Enchanting"] add lghsrc
tag @e[type=item,name="Blaze Powder"] add lghsrc
tag @e[type=item,name="Magma Cream"] add lghsrc
tag @e[type=item,name="Fire Charge"] add lghsrc
tag @e[type=item,name="Blue Ice"] add lghsrc
tag @e[type=item,name="Lava Bucket"] add lghsrc
tag @e[type=item,name="Shroomlight"] add lghsrc
tag @e[type=item,name="Soul Torch"] add lghsrc
tag @e[type=item,name="Copper Lantern"] add lghsrc
tag @e[type=item,name="Soul Lantern"] add lghsrc
tag @e[type=item,name="Soul Campfire"] add lghsrc
tag @e[type=item,name="Crying Obsidian"] add lghsrc

execute as @e[tag=max] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=15] replace air
execute as @e[tag=high] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=13] replace air
execute as @e[tag=mediumhigh] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=12] replace air
execute as @e[tag=medium] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=11] replace air
execute as @e[tag=mediumlow] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=10] replace air
execute as @e[tag=low] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=5] replace air
execute as @e[tag=verylow] at @s run fill ~ ~ ~ ~ ~ ~ light_block ["block_light_level"=9] replace air

#Adding Objectives
scoreboard objectives add lghsrc dummy
scoreboard objectives add multifunc dummy

#Adding Scores
scoreboard players add @s lghsrc 1
scoreboard players add @s multifunc 1
scoreboard players operation @e lghsrc = @e lghsrc

#Used for timing multiplayer compatability
execute as @s[scores={multifunc=100..10000}] at @s run tag @s add solo
execute as @s[scores={multifunc=100..10000}] at @s run scoreboard players set @s multifunc 0

#Used to time individual lighting entities/thrown items
execute as @s[scores={lghsrc=10..1000}] at @s run scoreboard players set @s lghsrc 0
gamerule sendcommandfeedback false
