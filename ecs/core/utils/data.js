import clone from './clone'

function FragmentData(object){
    const _states = []
    const _rules = {}
    let _current = {}
    let _next = {}
    let _currentStateIndex = 0
    let _initialObject = null

    return new class FragmentData{
        constructor(){
            _initialObject = this.add(object)
            _initialObject.watch = this.watch.bind(this)
            this.apply()
            return this
        }
        add(object){
            Object.assign(_current, object)
            Object.assign(_next, object)

            /*const self = this
            const _makeReactive = (obj, key) => {
                if (!obj.hasOwnProperty(key)) return
                Object.defineProperty(obj, key, {
                    get() {
                        // console.log("get", key, _current[key])
                        return _current[key]
                    },
                    set(newVal) {
                        // console.log("set", key, newVal)
                        _next[key] = newVal
                        self._notify(key, newVal)
                    },
                })
            }
            for (let key in object) {
                if (typeof object[key] === 'object') {
                    // console.log('object detected', object[key])
                }
                _makeReactive(object, key)
            }
            return object*/
            return new Proxy(object, {
                get: (obj, prop, receiver) => {
                    return _current[prop]
                },
                set: (obj, prop, val, receiver) => {
                    _next[prop] = val
                    this._notify(prop, val)
                    return true;
                }
            })
        }
        _notify(prop, newVal){
            // console.log('notify prop changed', prop, newVal)
            const propRules = _rules[prop]
            if (propRules){
                for (let i = 0; i < propRules.length; i++) {
                    const propRule = propRules[i]
                    propRule(newVal)
                }
            }
        }
        watch(key, rule){
            if (!_rules[key])
                _rules[key] = []
            _rules[key].push(rule)
        }
        apply(){
            // console.log('apply')
            const nextState = clone(_next)
            _current = Object.freeze(nextState)
            _next = clone(_current)
            _states.push(_current)
            _currentStateIndex = _states.length - 1
        }
        undo(){
            if(_currentStateIndex - 1 < 0) return
            _currentStateIndex--
            const undoState = clone(_states[_currentStateIndex])
            _current = Object.freeze(undoState)
            _next = clone(_current)
        }
        redo(){
            if(_currentStateIndex + 1 > _states.length - 1) return
            _currentStateIndex++
            const redoState = clone(_states[_currentStateIndex])
            _current = Object.freeze(redoState)
            _next = clone(_current)
        }
        /*toJSON(){
            return JSON.stringify(_current)
        }
        fromJSON(json){
            let object = JSON.parse(json)
            this.add(object)
        }*/

        get object(){
            return _initialObject
        }
        get current(){
            return _current
        }
        get states(){
            return _states
        }
    }
}

const _data = []
export default class Data {
    constructor(object) {
        const data = new FragmentData(object)
        Data.add(data)
        return data.object
    }
    static add(data) {
        _data.push(data)
    }
    static apply() {
        for (let i = 0; i < _data.length; i++) {
            _data[i].apply()
        }
    }
    static undo() {
        for (let i = 0; i < _data.length; i++) {
            _data[i].undo()
        }
    }
    static redo() {
        for (let i = 0; i < _data.length; i++) {
            _data[i].redo()
        }
    }
}