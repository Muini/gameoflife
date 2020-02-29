
import UUID from './uuid'
import clone from './clone'

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
                    const valueIndex = _next.length
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
            _states.push(_next)
            _currentStateIndex = _states.length - 1
            _next = clone(this.current)
        },
        undo() {
            if (_currentStateIndex - 1 < 0) return
            _currentStateIndex--
            _next = clone(this.current)
        },
        redo() {
            if (_currentStateIndex + 1 > _states.length - 1) return
            _currentStateIndex++
            _next = clone(this.current)
        },
        getValue(id, prop){
            if(!_dataMap[id]) return console.error('Data.js: (Get) Prop not existing in data', id, prop)
            const valueIndex = _dataMap[id][prop]
            if (isNaN(valueIndex)) return console.error('Data.js: (Get) Prop not found in data', id, prop)
            return this.current[valueIndex]
        },
        setValue(id, prop, value){
            if (!_dataMap[id]) return console.error('Data.js: (Set) Prop not existing in data', id, prop)
            const valueIndex = _dataMap[id][prop]
            if (isNaN(valueIndex)) return console.error('Data.js: (Set) Prop not found in data', id, prop)
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
                    const prevVal = Store.getValue(this.id, prop)
                    Store.setValue(this.id, prop, val)
                    this._notify(prop, val, prevVal)
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
        _notify(prop, newVal, prevVal) {
            // console.log('notify prop changed', prop, newVal)
            const propRules = _rules[prop]
            if (propRules) {
                for (let i = 0; i < propRules.length; i++) {
                    const propRule = propRules[i]
                    propRule(newVal, prevVal)
                }
            }
        }
        get id(){
            return _id
        }
    }
}

export default Data