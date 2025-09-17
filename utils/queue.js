/**
 * A simple queue implementation.
 * @class
 */
class Queue {
  /**
   * Creates an instance of Queue.
   */
  constructor() {
    this.items = [];
  }

  /**
   * Adds an item to the end of the queue.
   * @param {*} item - The item to add.
   */
  enqueue(item) {
    this.items.push(item);
  }

  /**
   * Removes and returns the item at the front of the queue.
   * @returns {*} The removed item.
   */
  dequeue() {
    return this.items.shift();
  }

  /**
   * Returns the item at the front of the queue without removing it.
   * @returns {*} The item at the front of the queue.
   */
  peek() {
    return this.items[0];
  }

  /**
   * Clears the queue.
   */
  clear() {
    this.items = [];
  }

  /**
   * The number of items in the queue.
   * @type {number}
   */
  get length() {
    return this.items.length;
  }
}

module.exports = Queue;


