import Game from './game';

export default class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isDead = true;
        this.wasDead = true;

        this.TIMEBETWEENTHINK = 30;
        this.timeElapsed = 0;

        this.neighbors = [];
        this.currentNeightborsAlive = 0;

        this.colors = {
            alive: 'rgba(255,255,255,0.8)',
            dead: 'rgba(255,255,255,0.1)',
            dying: 'rgba(255,100,100,1.0)',
            create: 'rgba(100,100,255,1.0)',
        }
    }
    getAdjacentCells() {
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if(!(x === 0 && y === 0)){
                    let adjCell = Game.getEntityAt(this.x + x, this.y + y);
                    if (adjCell && adjCell.constructor.name === 'Cell') {
                        this.neighbors.push(adjCell);
                    }
                }
            }
        }
    }
    countAliveNeighbors(){
        let count = 0;
        for (let i = 0; i < this.neighbors.length; i++) {
            if(!this.neighbors[i].isDead)
                count++;
        }
        return count
    }
    think(){
        if (this.neighbors.length === 0) this.getAdjacentCells();
        this.currentNeightborsAlive = this.countAliveNeighbors();
        if (this.isDead) {
            if (this.currentNeightborsAlive === 3) {
                this.procreate();
            }
        }else{
            if (this.currentNeightborsAlive < 2 || this.currentNeightborsAlive > 3) {
                this.die();
            }
        }
    }
    update(time, delta, ctx) {
        this.timeElapsed += delta;
        if(this.timeElapsed >= this.TIMEBETWEENTHINK){
            this.think();
            this.timeElapsed = 0;
        }
    }
    draw(ctx) {
        let color = '';
        if(this.isDead){
            if (!this.wasDead) {
                color = this.colors.dying;
                this.wasDead = true;
            }else{
                color = this.colors.dead;
            }
        } else {
            if (this.wasDead) {
                color = this.colors.create;
                this.wasDead = false;
            } else {
                color = this.colors.alive;
            }
        }
        ctx.beginPath();
        ctx.arc(this.x * Game.RESOLUTION + (Game.RESOLUTION / 2), this.y * Game.RESOLUTION + (Game.RESOLUTION / 2), Game.RESOLUTION / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        // ctx.strokeStyle = color;
        // ctx.strokeWidth = 2.0;
        ctx.fill();
        ctx.closePath();
        // ctx.stroke();
        // ctx.fillRect(
        //     this.x * Game.RESOLUTION, 
        //     this.y * Game.RESOLUTION, 
        //     Game.RESOLUTION, 
        //     Game.RESOLUTION
        // );
    }
    procreate() {
        this.isDead = false;
    }
    die() {
        this.isDead = true;
    }
}