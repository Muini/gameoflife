import { ECS } from './core/ecs';

ECS.$RESOLUTION = 6;
ECS.$canvas = document.getElementById("game");
ECS.$ctx = ECS.$canvas.getContext('2d');

ECS.$generateLevel = function (width, height) {
    let level = new Array(width);
    this.$levelEntitiesPositions = new Array(width);
    for (let x = 0; x < level.length; x++) {
        level[x] = new Array(height);
        this.$levelEntitiesPositions[x] = new Array(height);
        for (let y = 0; y < level[x].length; y++) {
            level[x][y] = (Math.random() * width / 6) | 0;
            this.$levelEntitiesPositions[x][y] = [];
        }
    }
    return level;
}
ECS.$setup = function(level) {
    this.$canvas.width = level.length * this.$RESOLUTION;
    this.$canvas.height = level[0].length * this.$RESOLUTION;

    for (let x = 0; x < level.length; x++) {
        for (let y = 0; y < level[x].length; y++) {
            let cell = this.Entity('Cell', ['position', 'state', 'colors', 'think']);
            cell.position.x = x;
            cell.position.y = y;
            this.$levelEntitiesPositions[x][y].push(cell);
            switch (level[x][y]) {
                case 1:
                    cell.state.isDead = false;
                    break;

                case 0:
                default:
                    cell.state.isDead = true;
                    break;
            }
        }
    }
}
ECS.$getEntityAt = function(x, y) {
    if (this.$levelEntitiesPositions[x] && this.$levelEntitiesPositions[x][y] && this.$levelEntitiesPositions[x][y])
        return this.$levelEntitiesPositions[x][y][0];
    else
        return undefined;
}
ECS.$start = function(){
    this.scene.init();
    this.$lastTick = Date.now();
    this.$update = this.$update.bind(this);
    requestAnimationFrame(this.$update);
}
ECS.$update = function(){
    requestAnimationFrame(this.$update);

    let now = Date.now();
    let delta = Date.now() - this.$lastTick;
    let fps = (1 / delta * 1000) | 0;

    this.$ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

    this.scene.update(now, delta);

    this.$ctx.save();

    this.$ctx.font = "14px Arial";
    this.$ctx.shadowColor = 'rgba(0,0,0,1.0)';
    this.$ctx.shadowBlur = 6;
    this.$ctx.fillStyle = 'rgba(255,255,255,1.0)';
    this.$ctx.fillText("Game of Life", 10, 20);

    this.$ctx.font = "12px Arial";
    this.$ctx.fillStyle = 'rgba(200,200,255,0.8)';
    this.$ctx.fillText(fps + " fps", 10, 35);

    this.$ctx.fillStyle = 'rgba(255,255,255,0.6)';
    this.$ctx.fillText(this.scene.entities.length + " entities", 10, 50);

    this.$ctx.restore();

    this.$lastTick = now;
}

ECS.newScene('gameoflife', ['CellThink', 'CellLiving', 'CellRenderer']);

ECS.Component('position', {
    x: 0,
    y: 0,
})

ECS.Component('state', {
    isDead: true,
    wasDead: true,
    shouldDraw: true,
    willBeDead: false,
})

ECS.Component('colors', {
    alive: 'rgba(255,255,255,0.8)',
    dead: 'rgba(255,255,255,0.1)',
    dying: 'rgba(255,100,100,1.0)',
    create: 'rgba(100,100,255,1.0)',
})

ECS.Component('think', {
    delay: 30,
    timeElapsed: 0,
    neighbors: [],
})

ECS.System('CellThink', {
    onInitEntity: function(entity){
        //Get neightbors
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (!(x === 0 && y === 0)) {
                    let adjCell = ECS.$getEntityAt(entity.position.x + x, entity.position.y + y);
                    if (adjCell && adjCell.name === 'Cell') {
                        entity.think.neighbors.push(adjCell);
                    }
                }
            }
        }
    },
    onUpdateEntity: function(entity, time, delta){
        entity.think.timeElapsed += delta;
        if (entity.think.timeElapsed >= entity.think.delay) {

            let count = 0;
            for (let i = 0; i < entity.think.neighbors.length; i++) {
                if (!entity.think.neighbors[i].state.isDead)
                    count++;
            }
            if (entity.state.isDead) {
                if (count === 3) {
                    // Procreate
                    entity.state.willBeDead = false;
                    // entity.state.shouldDraw = true;
                }
            } else {
                if (count < 2 || count > 3) {
                    // Die
                    entity.state.willBeDead = true;
                    // entity.state.shouldDraw = true;
                }
            }

            entity.think.timeElapsed = 0;
        }
    }
});

ECS.System('CellLiving', {
    onUpdateEntity: function (entity, time, delta) {
        entity.state.isDead = entity.state.willBeDead;
    }
});

ECS.System('CellRenderer', {
    onUpdateEntity: function (entity, time, delta){
        if (!entity.state || !entity.colors || !entity.position) return;
        // if (!entity.state.shouldDraw) return;
        let color = '';
        if (entity.state.isDead) {
            if (!entity.state.willBeDead) {
                color = entity.colors.create;
            } else {
                color = entity.colors.dead;
            }
        } else {
            if (entity.state.willBeDead) {
                color = entity.colors.dying;
            } else {
                color = entity.colors.alive;
            }
        }
        /*
        ECS.$ctx.beginPath();
        ECS.$ctx.arc(entity.position.x * ECS.$RESOLUTION + (ECS.$RESOLUTION / 2), entity.position.y * ECS.$RESOLUTION + (ECS.$RESOLUTION / 2), ECS.$RESOLUTION / 2, 0, 2 * Math.PI, false);
        ECS.$ctx.fillStyle = color;
        ECS.$ctx.fill();
        ECS.$ctx.closePath();
        */

        ECS.$ctx.fillStyle = color;
        ECS.$ctx.fillRect(
            entity.position.x * ECS.$RESOLUTION,
            entity.position.y * ECS.$RESOLUTION,
            ECS.$RESOLUTION,
            ECS.$RESOLUTION
        );
    }
});

ECS.$setup(ECS.$generateLevel(100, 100));
ECS.$start();

window.ECS = ECS;
console.log(ECS.scene.entities[0]);
