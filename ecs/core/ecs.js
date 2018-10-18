import UUID from "./utils/uuid";

const Entity = function (name) {
    const _id = UUID();
    return new class Entity {
        constructor(){
            this.name = name || 'unnamed entity';
            this.components = []; // List of components a.k.a componentes database
        }
        addComponent(component) {
            if(this[component.name] != undefined) return;
            this.components.push(component.name);
            this[component.name] = {};
            for (let key in component.data) {
                this[component.name][key] = component.data[key];
            }
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
            this.data = JSON.parse(JSON.stringify(data));
        }
    }
}

const System = function (name, onInit, onUpdate) {
    return new class System {
        constructor(){
            this.name = name || 'unnamed system';
            this.init = onInit || function(entity){};
            this.update = onUpdate || function (entity, time, delta) {};
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
            for (let length = this.entities.length, e = length - 1; e >= 0; --e) {
                for (let length2 = this.systems.length, s = length2 - 1; s >= 0; --s) {
                    this.systems[s].init(this.entities[e]);
                }
            }
        }
        update(time, delta) {
            for (let length = this.entities.length, e = length - 1; e >= 0; --e) {
                for (let length2 = this.systems.length, s = length2 - 1; s >= 0; --s) {
                    this.systems[s].update(this.entities[e], time, delta);
                }
            }
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
            for (let length = components.length, c = length - 1; c >= 0; --c) {
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