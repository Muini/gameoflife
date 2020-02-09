import { ECS } from './core/ecs'

// ECS.Scene('Boids', ['Move', 'Render'])
ECS.newScene('Boids')

ECS.Component('position', { x: 0, y: 0 })
ECS.Component('awarness', { radius: 10, neightboor: [] })

const bird = ECS.Entity('Bird', ['position', 'awarness'])

bird.position.x = 256
bird.position.y = bird.position.x
console.log(bird.position.y)

ECS.System('Move', {
  onInit: (_) => {},
  onUpdate: (_) => {},
  onInitEntity: (entity) => {},
  onUpdateEntity: (entity, time, delta) => {
      if(entity.position.x > ECS._canvas.width)
        entity.position.x = 0
      else
        entity.position.x += 0.1 * delta 
  }
})

ECS.System('Render', {
    onInit: (_) => { },
    onUpdate: (_) => { },
    onInitEntity: (entity) => { },
    onUpdateEntity: (entity) => {
        console.log('render')
        ECS._ctx.fillStyle = `rgba(255, 255, 255, 1.0)`
        ECS._ctx.fillRect(
            entity.position.x,
            entity.position.y,
            10,
            10
        )
    }
})

console.log(ECS)


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
    ECS._raf = requestAnimationFrame(ECS._update);
}
ECS._update = _ =>{
    ECS._raf = requestAnimationFrame(ECS._update);

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

