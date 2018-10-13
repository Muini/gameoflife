import Cell from './cell';

class Game{
    constructor(){

        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext('2d');

        this.RESOLUTION = 6;
        this.entities = [];

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
        let x = Math.floor(e.offsetX / this.RESOLUTION);
        let y = Math.floor(e.offsetY / this.RESOLUTION);
        let cell = this.getEntityAt(x, y);
        if (cell && cell.isDead) {
            cell.procreate();
        }
    }
    generateLevel(width, height){
        let level = new Array(width);
        for (let x = 0; x < level.length; x++) {
            level[x] = new Array(height);
            for (var y = 0; y < level[x].length; y++) {
                level[x][y] = Math.floor(Math.random() * width / 6);
            }
        }
        return level;
    }
    setup(level) {
        this.canvas.width = level.length * this.RESOLUTION;
        this.canvas.height = level[0].length * this.RESOLUTION;

        for (let x = 0; x < level.length; x++) {
            for (let y = 0; y < level[x].length; y++) {
                let cell = new Cell(y, x);
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
        let e = this.entities.length;
        while(e--){
            if (this.entities[e].x === x && this.entities[e].y === y)
                return this.entities[e];
        }
    }
    start(){
        requestAnimationFrame(this.draw);
    }
    draw(){
        requestAnimationFrame(this.draw);

        let now = Date.now();
        let delta = Date.now() - this.lastTick;
        let fps = Math.floor(1 / delta * 1000);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].update(now, delta);
            this.entities[e].draw(this.ctx);
        }

        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = 'rgba(255,255,255,1.0)';
        this.ctx.fillText("Game of Life", 10, 20);

        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = 'rgba(200,200,255,0.8)';
        this.ctx.fillText(fps + " fps", 10, 35);

        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        this.ctx.fillText(this.entities.length + " entities", 10, 50);

        this.lastTick = now;
    }
}

export default new Game();