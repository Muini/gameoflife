import UUID from "./utils/uuid"
import clone from "./utils/clone"
import Data, { Store } from './utils/data'

const Entity = function (name) {
    const _id = UUID();
    // const _data = new Data({})
    // console.log(_data)
    return new class Entity {
        constructor(){
            this.name = name || 'unnamed entity';
            this.components = []; // List of components a.k.a componentes database
        }
        addComponent(component) {
            if(this[component.name] != undefined) return
            this.components.push(component.name)
            /*_data.add(component.data)
            this[component.name] = {}
            for (let prop in component.data) {
                const value = component.data[prop];
                this[component.name][prop] = {
                    get(){
                        return _data[prop]
                    },
                    set(value){
                        _data[prop] = value
                    }
                }
            }*/
            this[component.name] = new Data(component.data)
        }
        get id(){
            return _id;
        }
    }
}

const Component = function(name, data){
    return new class Component{
        constructor(){
            this.name = name || 'unnamed component';
            this.data = clone(data);
        }
    }
}

const System = function (name, { onInit, onUpdate, onInitEntity, onUpdateEntity }) {
    return new class System {
        constructor(){
            this.name = name || 'unnamed system';
            this.init = onInit || function(){};
            this.initEntity = onInitEntity || function (entity) {};
            this.update = onUpdate || function (time, delta) {};
            this.updateEntity = onUpdateEntity || function (entity, time, delta) {};
            this.entities = [];
        }
        addEntity (entity) {
            this.entities.push(entity);
        }
    }
}

const Scene = function(name){
    const _id = UUID();
    return new class Scene {
        constructor(){
            this.name = name || 'unnamed scene';

            this.entities = []; // List of entities a.k.a entities database
            this.components = {}; // List of components data ready for creation
            this.systems = []; // List of systems a.k.a systems database
        }
        get id() {
            return _id;
        }
        init() {
            const now = performance.now()
            for (let s = 0; s < this.systems.length; s++) {
                this.systems[s].init();
            }
            for (let e = 0; e < this.entities.length; e++) {
                for (let s = 0; s < this.systems.length; s++) {
                    this.systems[s].initEntity(this.entities[e]);
                }
            }
            Store.apply()
            console.log('init took', performance.now() - now, 'ms\n', 'Store length:', Store.current.length)
        }
        update(time, delta) {
            const now = performance.now()
            for (let s = 0; s < this.systems.length; s++) {
                this.systems[s].update(time, delta);
            }
            for (let e = 0; e < this.entities.length; e++) {
                for (let s = 0; s < this.systems.length; s++) {
                    this.systems[s].updateEntity(this.entities[e], time, delta);
                }
            }
            Store.apply()
            console.log('update took', performance.now() - now, 'ms')
        }
        destroy(){}
    }
}

export const ECS = (function () {
    return new class ECS{
        constructor(){
            this.scene = undefined;
            this.scenes = {};
        }
        setScene(sceneName){
            if (this.scenes[sceneName])
                this.scene = this.scenes[sceneName];
        }
        newScene(name){
            const scene = new Scene(name);
            this.scenes[name] = scene;
            if(!this.scene)
                this.setScene(name);
            return scene
        }
        Entity(name, components) {
            // Create new entity with components
            const entity = new Entity(name);
            this.scene.entities.push(entity);
            for (let c = 0; c < components.length; c++) {
                const component = new Component(components[c], this.scene.components[components[c]]);
                entity.addComponent(component);
            }
            return entity;
        }
        Component(name, data){
            // Register component
            this.scene.components[name] = data;
        }
        System(name, onInit, onUpdate){
            const system = new System(name, onInit, onUpdate);
            this.scene.systems.push(system);
            return system;
        }
    }
})();