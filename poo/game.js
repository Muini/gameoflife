import Cell from './cell';

class Game{
    constructor(){

        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext('2d');

        this.RESOLUTION = 6;
        this.entities = [];
        this.levelEntitiesPositions = [];

        this.draw = this.draw.bind(this);

        this.lastTick = new Date();

        this.isClicking = false;
        this.onMouseMove = this.onMouseMove.bind(this);
        this.canvas.addEventListener('mousedown', e => {this.isClicking = true; this.onMouseMove(e)}, false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('mouseup', e => {this.isClicking = false}, false);
    }
    onMouseMove(e){
        if(!this.isClicking) return;
        let x = (e.offsetX / this.RESOLUTION) | 0; 
        let y = (e.offsetY / this.RESOLUTION) | 0;
        let cell = this.getEntityAt(x, y);
        if (cell && cell.isDead) {
            cell.procreate();
        }
    }
    generateLevel(width, height){
        let level = new Array(width);
        this.levelEntitiesPositions = new Array(width);
        for (let x = 0; x < level.length; x++) {
            level[x] = new Array(height);
            this.levelEntitiesPositions[x] = new Array(height);
            for (let y = 0; y < level[x].length; y++) {
                level[x][y] = (Math.random() * width / 6) | 0;
                this.levelEntitiesPositions[x][y] = [];
            }
        }
        return level;
    }
    setup(level) {
        this.canvas.width = level.length * this.RESOLUTION;
        this.canvas.height = level[0].length * this.RESOLUTION;

        for (let x = 0; x < level.length; x++) {
            for (let y = 0; y < level[x].length; y++) {
                let cell = new Cell('Cell' + (x+y), y, x);
                this.levelEntitiesPositions[y][x].push(cell);
                this.entities.push(cell);
                switch (level[x][y]) {
                    case 1:
                        cell.isDead = false;
                        break;

                    case 0:
                    default:
                        cell.isDead = true;
                        break;
                }
            }
        }
    }
    getEntityAt(x, y) {
        if (this.levelEntitiesPositions[x] && this.levelEntitiesPositions[x][y] && this.levelEntitiesPositions[x][y])
            return this.levelEntitiesPositions[x][y][0];
        else
            return undefined;
        /*for (let length = this.entities.length, e = length - 1; e >= 0; --e) {
            if (this.entities[e].x === x && this.entities[e].y === y)
                return this.entities[e];
        }*/
    }
    start() {
        this.lastTick = new Date();
        requestAnimationFrame(this.draw);
    }
    draw(){
        requestAnimationFrame(this.draw);

        let now = Date.now();
        let delta = Date.now() - this.lastTick;
        let fps = (1 / delta * 1000) | 0;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let length = this.entities.length, e = length - 1; e >= 0; --e) {
            this.entities[e].update(now, delta);
            this.entities[e].draw(this.ctx);
        }
        this.ctx.save();

        this.ctx.font = "14px Arial";
        this.ctx.shadowColor = 'rgba(0,0,0,1.0)';
        this.ctx.shadowBlur = 6;
        this.ctx.fillStyle = 'rgba(255,255,255,1.0)';
        this.ctx.fillText("Game of Life", 10, 20);

        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = 'rgba(200,200,255,0.8)';
        this.ctx.fillText(fps + " fps", 10, 35);

        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        this.ctx.fillText(this.entities.length + " entities", 10, 50);

        this.ctx.restore();

        this.lastTick = now;
    }
}

export default new Game();