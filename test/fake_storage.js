
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

export default FakeStorage;
