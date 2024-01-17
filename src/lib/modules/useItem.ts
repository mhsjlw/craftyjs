export const server = (serv: Server, { version }: Options) => {
  const registry = require('prismarine-registry')(version)
  const { mobs } = registry

  function getEntID (entName) {
    let foundID = ''

    Object.keys(mobs).forEach(mobID => {
      const mob = mobs[mobID]
      if ('minecraft:' + mob.name === entName) {
        foundID = mobID
      }
    })

    return foundID
  }

  serv.on('asap', () => { // On server ready
    if (registry.supportFeature('theFlattening')) { // >1.12 support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const mob of Object.values(mobs) as Array<{ id: string, name: string }>) {
        const spawnEgg = registry.itemsByName[mob.name + '_spawn_egg']
        if (spawnEgg) {
          serv.onItemPlace(spawnEgg.name, ({ player, placedPosition }) => {
            serv.spawnMob(mob.id, player.world, placedPosition)
            return { id: -1, data: 0 }
          })
        }
      }
    } else {
      if (registry.supportFeature('entityMCPrefixed')) { // 1.12 support
        serv.onItemPlace('spawn_egg', ({ item, player, placedPosition }) => {
          serv.spawnMob(getEntID(item.nbt.value.EntityTag.value.id.value), player.world, placedPosition)
          return { id: -1, data: 0 }
        })
      } else {
        if (registry.supportFeature('nbtOnMetadata')) { // 1.8 support
          serv.onItemPlace('spawn_egg', ({ item, player, placedPosition }) => {
            serv.spawnMob(item.metadata, player.world, placedPosition)
            return { id: -1, data: 0 }
          })
        } else {
          serv.onItemPlace('spawn_egg', ({ item, player, placedPosition }) => { // 1.9, 1.10, 1.11 support
            serv.spawnMob(getEntID('minecraft:' + item.nbt.value.EntityTag.value.id.value), player.world, placedPosition)
            return { id: -1, data: 0 }
          })
        }
      }
    }
  })
}
declare global {
}
