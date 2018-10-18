import UUID from "./utils/uuid";

export default (function (name) {
    return class Entity {
        constructor(name) {
            this.name = name || 'unnamed entity';
            this.components = []; // List of components a.k.a componentes database
            // this.parent = caller;
            // this.children = []; 
            this._id = UUID();
        }
        get id() {
            return this._id;
        }
        addComponent(component) {
            if (this[component.name] != undefined) return;
            this.components.push(component.name);
            this[component.name] = {};
            for (let key in component.data) {
                this[component.name][key] = component.data[key];
            }
        }
        update(time, delta) {}
    }
})();
