import Game from './game'
import Entity from './entity'

export default function (name, x, y) {
  const TIMEBETWEENTHINK = 30
  let _timeElapsed = 0
  let _firstUpdate = true
  const _neighbors = []

  return new class Cell extends Entity {
    constructor () {
      super(name)

      this.x = x
      this.y = y
      this.isDead = true
      this.wasDead = true

      this.colors = {
        alive: 'rgba(255,255,255,0.8)',
        dead: 'rgba(255,255,255,0.1)',
        dying: 'rgba(255,100,100,1.0)',
        create: 'rgba(100,100,255,1.0)'
      }
    }
    getAdjacentCells () {
      for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
          if (!(x === 0 && y === 0)) {
            const adjCell = Game.getEntityAt(this.x + x, this.y + y)
            if (adjCell && adjCell.constructor.name === 'Cell') {
              _neighbors.push(adjCell)
            }
          }
        }
      }
    }
    think () {
      if (_firstUpdate) {
        // Process heavy function
        this.getAdjacentCells()
        _firstUpdate = false
      }
      let count = 0
      for (let i = 0; i < _neighbors.length; i++) {
        if (!_neighbors[i].isDead) { count++ }
      }
      if (this.isDead) {
        if (count === 3) {
          this.procreate()
        }
      } else if (count < 2 || count > 3) {
        this.die()
      }
    }
    update (time, delta) {
      _timeElapsed += delta
      if (_timeElapsed >= TIMEBETWEENTHINK) {
        this.think()
        _timeElapsed = 0
      }
    }
    draw (ctx) {
      let color = ''
      if (this.isDead) {
        if (!this.wasDead) {
          color = this.colors.dying
          this.wasDead = true
        } else {
          color = this.colors.dead
        }
      } else if (this.wasDead) {
        color = this.colors.create
        this.wasDead = false
      } else {
        color = this.colors.alive
      }
      /* ctx.beginPath();
            ctx.arc(this.x * Game.RESOLUTION + (Game.RESOLUTION / 2), this.y * Game.RESOLUTION + (Game.RESOLUTION / 2), Game.RESOLUTION / 2, 0, 2 * Math.PI, false); */
      ctx.fillStyle = color
      /* ctx.fill();
            ctx.closePath(); */
      ctx.fillRect(
        this.x * Game.RESOLUTION,
        this.y * Game.RESOLUTION,
        Game.RESOLUTION,
        Game.RESOLUTION
      )
    }
    procreate () {
      this.isDead = false
    }
    die () {
      this.isDead = true
    }
  }()
}
