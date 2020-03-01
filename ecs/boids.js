import { ECS } from './core/ecs'
import distance from './core/utils/distance'

// ECS.Scene('Boids', ['Move', 'Render'])
ECS.newScene('Boids')

ECS.Component('position', { x: 0, y: 0 })
ECS.Component('rotation', { delta: 0 })
ECS.Component('awarness', { radius: 50 })

for (let i = 0; i < 100; i++) {
    const bird = ECS.Entity('Bird' + i, ['position', 'awarness', 'rotation'])
    bird.position.x = Math.random() * 512 << 0
    bird.position.y = Math.random() * 512 << 0
    bird.rotation.delta = Math.random() * 360 << 0 * Math.PI / 180
}
console.log(ECS)

ECS.System('Move', {
  onInit: (_) => {},
  onUpdate: (_) => {},
  onInitEntity: (entity) => {},
  onUpdateEntity: (entity, time, delta) => {
    const pos = { x: entity.position.x, y: entity.position.y }
    const radius = entity.awarness.radius
    let rotation = entity.rotation.delta

    // Avoid neighboor
    let closestDistance = radius
    let closestNeighboor = null
    for (let i = 0; i < ECS.scene.entities.length; i++) {
        const neighboor = ECS.scene.entities[i]
        if(neighboor !== entity){
            const entityPos = { x: neighboor.position.x, y: neighboor.position.y }
            const dist = distance(entityPos, pos)
            if (dist < radius ){
                if (dist < closestDistance) {
                    closestDistance = dist
                    closestNeighboor = neighboor
                }
            }
        }
    }
    if(closestNeighboor){
        const direction = Math.sin(rotation) > Math.sin(closestNeighboor.rotation.delta)  ? -1 : 1
        rotation += (1 - (closestDistance / radius)) * (Math.PI) * direction * 0.1
    }
    
    // Move forward
    const speed = 2
    pos.x += Math.cos(rotation) * speed
    pos.y += Math.sin(rotation) * speed

    // Keep in bound
    if(pos.x > ECS._canvas.width)
        pos.x = 0
    if(pos.y > ECS._canvas.height)
        pos.y = 0
    if (pos.x < 0)
        pos.x = ECS._canvas.width
    if (pos.y < 0)
        pos.y = ECS._canvas.height
    
    entity.position.x = pos.x
    entity.position.y = pos.y
    entity.rotation.delta = rotation
  }
})

ECS.System('Render', {
    onInit: (_) => { },
    onUpdate: (_) => { },
    onInitEntity: (entity) => { },
    onUpdateEntity: (entity) => {
        ECS._ctx.translate(entity.position.x, entity.position.y)
        ECS._ctx.rotate(entity.rotation.delta)
        ECS._ctx.fillStyle = `rgba(255, 255, 255, 1.0)`
        ECS._ctx.beginPath()
        ECS._ctx.moveTo(8, 0)
        ECS._ctx.lineTo(-8, -5)
        ECS._ctx.lineTo(-8, 5)
        ECS._ctx.fill()
        ECS._ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
})

ECS._canvas = document.getElementById("game");
ECS._ctx = ECS._canvas.getContext('2d');
ECS._setup = (level) => {
    ECS._canvas.width = 512 * window.devicePixelRatio;
    ECS._canvas.height = 512 * window.devicePixelRatio;
    ECS._canvas.style['width'] = 512;
    ECS._canvas.style['height'] = 512;

    // Generate boids
}
ECS._start = _ => {
    ECS.scene.init();
    ECS._lastTick = Date.now();
    ECS._update = ECS._update.bind(ECS);
    ECS._playOnce = true
    ECS._raf = requestAnimationFrame(ECS._update);
}
ECS._update = _ =>{
    if (!ECS._playOnce) {
        ECS._raf = requestAnimationFrame(ECS._update);
    } else { 
        ECS._playOnce = false 
    }

    let now = Date.now();
    let delta = Date.now() - ECS._lastTick;
    let fps = (1 / delta * 1000) | 0;

    ECS._ctx.clearRect(0, 0, ECS._canvas.width, ECS._canvas.height);

    ECS.scene.update(now, delta);

    ECS._ctx.save();

    ECS._ctx.font = "18px Arial";
    ECS._ctx.shadowColor = 'rgba(0,0,0,1.0)';
    ECS._ctx.shadowBlur = 6;
    ECS._ctx.fillStyle = 'rgba(255,255,255,1.0)';
    ECS._ctx.fillText("Boids", 10, 25);

    ECS._ctx.font = "14px Arial";
    ECS._ctx.fillStyle = 'rgba(100,150,255,1.0)';
    ECS._ctx.fillText(fps + " fps", 10, 45);

    ECS._ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ECS._ctx.fillText(ECS.scene.entities.length + " entities", 10, 65);

    ECS._ctx.restore();

    ECS._lastTick = now;
}

ECS._setup()
ECS._start()

document.querySelector('#next').addEventListener('click', (_) => {
    cancelAnimationFrame(ECS._raf)
    ECS._playOnce = true
    requestAnimationFrame(ECS._update)
})
document.querySelector('#run').addEventListener('click', (_) => {
    requestAnimationFrame(ECS._update)
})
document.querySelector('#stop').addEventListener('click', (_) => {
    cancelAnimationFrame(ECS._raf)
})