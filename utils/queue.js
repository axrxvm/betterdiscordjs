class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  peek() {
    return this.items[0];
  }
  clear() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
}

module.exports = Queue;
