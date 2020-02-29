/*import Game from './poo/game';

Game.setup(Game.generateLevel(100, 100));
Game.start();
*/
// import Game from './ecs/game'
import Boids from './ecs/boids';

/*
import Data, { Store } from './ecs/core/utils/data'

const person = new Data({
    name: "Philipe",
    age: 32,
    gender: 'male',
    money: 1000,
    class: 1,
    stats: {
        health: 1
    }
})

Store.apply()

// data.connect(person.money, person.class, (inValue, curValue) => curValue++)
console.log(person)
person.watch('money', newVal => {
    person.class += 1
})

console.log(person.watch)

person.money += 100

// person.stats.health += 1

Store.apply()

console.log(person.money)
// Store.undo()
// console.log(person.money)
*/