
class FakeStorage {
  constructor() {
    this.items = {};
  }

  setItem(key, value) {
    this.items[key] = value;
  }

  getItem(key) {
    return this.items[key];
  }
}

module.exports = FakeStorage;
