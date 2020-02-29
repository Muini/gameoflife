
import UUID from './uuid'


/*
    dataMap = {
        object: {
            prop1: 0,
            prop2: 1,
            prop3: 2
        }
    }
    currentStore = [10, 'stringvalue', 345]
*/


export const Store = (function () {
    const _MAX_STATES = 1000
    const _states = [[]]
    let _next = []
    let _currentStateIndex = 0
    let _dataMap = {}
    // let _rulesMap = {}

    return {
        add(id, object){
            _dataMap[id] = {}
            for (let prop in object) {
                const value = object[prop]
                if(typeof value !== 'function'){
                    const valueIndex = this.current.length
                    this.current.push(value)
                    _next.push(value)
                    _dataMap[id][prop] = valueIndex
                }else{
                    console.warn('Data.js: Functions are not supported', object, prop, value)
                }
            }
        },
        apply() {
            //TODO: if _currentStateIndex =! _states.length - 1, erase next states
            if (_currentStateIndex < _states.length - 1) {
                _states.splice(_currentStateIndex + 1, _states.length)
            }
            if (_states.length > _MAX_STATES) {
                _states.splice(0, 1)
            }
            _states.push(Object.freeze(_next))
            _next = [...this.current]
            _currentStateIndex = _states.length - 1
        },
        undo() {
            if (_currentStateIndex - 1 < 0) return
            _currentStateIndex--
            _next = [...this.current]
        },
        redo() {
            if (_currentStateIndex + 1 > _states.length - 1) return
            _currentStateIndex++
            _next = [...this.current]
        },
        getValue(id, prop){
            if(!_dataMap[id]) return console.warn('Data.js: (Get) Prop not found', id, prop)
            const valueIndex = _dataMap[id][prop]
            return this.current[valueIndex]
        },
        setValue(id, prop, value){
            if (!_dataMap[id]) return console.warn('Data.js: (Set) Prop not found', id, prop)
            const valueIndex = _dataMap[id][prop]
            _next[valueIndex] = value
        },
        get current() {
            return _states[_currentStateIndex]
        },
        get dataMap(){
            return _dataMap
        }
    }
})()

const Data = function(object){
    const _id = UUID()
    const _rules = {}
    let _initialObject = {}

    return new class Data{
        constructor(){
            return this.add(object)
        }
        add(object) {
            Object.assign(_initialObject, object)
            
            Store.add(this.id, _initialObject)

            const proxy = new Proxy(_initialObject, {
                get: (obj, prop) => {
                    switch(prop){
                        case 'watch':
                            return this.watch.bind(this)
                        case 'add':
                            return this.add.bind(this)
                        default:
                            return Store.getValue(this.id, prop)
                    }
                },
                set: (obj, prop, val) => {
                    Store.setValue(this.id, prop, val)
                    this._notify(prop, val)
                    return true
                }
            })

            return proxy
        }
        watch(key, rule) {
            if (!_rules[key])
                _rules[key] = []
            _rules[key].push(rule)
        }
        _notify(prop, newVal) {
            // console.log('notify prop changed', prop, newVal)
            const propRules = _rules[prop]
            if (propRules) {
                for (let i = 0; i < propRules.length; i++) {
                    const propRule = propRules[i]
                    propRule(newVal)
                }
            }
        }
        get id(){
            return _id
        }
    }
}

export default Data