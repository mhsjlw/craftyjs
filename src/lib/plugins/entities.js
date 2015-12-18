module.exports.server=function(serv) {
  serv.on('tick', function(delta) {
    Promise.all(
      Object.keys(serv.entities).map(async (id) => {
        const entity = serv.entities[id];
        if (entity.deathTime && Date.now() - entity.bornTime >= entity.deathTime) {
          entity.destroy();
          return;
        } else if (entity.pickupTime && Date.now() - entity.bornTime >= entity.pickupTime) {
          const players = serv.getNearby({
            world: entity.world,
            position: entity.position,
            radius: 1.5*32 // Seems good for now
          });
          if (players.length) {
            players[0].collect(entity);
          }
        }
        if (!entity.velocity || !entity.size) return;
        const posAndOnGround = await entity.calculatePhysics(delta);
        if (entity.type == 'mob') entity.sendPosition(posAndOnGround.position, posAndOnGround.onGround);
      })
    ).catch((err)=> setTimeout(() => {throw err;},0));
  });
};

module.exports.entity=function(entity){
  entity.sendMetadata = (data) => {
    entity._writeOthersNearby('entity_metadata', {
      entityId: entity.id,
      metadata: data
    });
  };

  entity.setAndUpdateMetadata = (data) => {
    entity.metadata = data;
    entity.sendMetadata(data);
  };
};