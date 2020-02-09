const Component = function (name, data) {
  return new class Component {
    constructor () {
      this.name = name || 'unnamed component'
      this.data = data
    }
  }()
}
