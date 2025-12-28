const once = (fn) => {
  let called = false;
  return function (...args) {
    if (!called) {
      fn.apply(this, args);
      called = true;
    }
  };
};

class EventEmitter {
  #store;

  constructor() {
    this.#store = new Map();
  }

  on(eventName, callback) {
    // implementation
    if (this.#store.has(eventName)) {
      const cbs = this.#store.get(eventName);
      const updatedCbs = [...cbs, callback];
      this.#store.set(eventName, updatedCbs);
    } else {
      this.#store.set(eventName, [callback]);
    }
  }

  once(eventName, callback) {
    // implementation
    const updatedCb = once(callback);
    this.on(eventName, updatedCb);
  }

  off(eventName, callback) {
    // implementation
    if (this.#store.has(eventName)) {
      const cbs = this.#store.get(eventName);
      const updatedCbs = cbs.filter((cb) => cb !== callback);
      this.#store.set(eventName, updatedCbs);
      console.log(updatedCbs);
    } else {
      throw new Error("eventname does not exist");
    }
  }

  emit(eventName, ...args) {
    // implementation
    const cbs = this.#store.get(eventName) || [];
    cbs.forEach((cb) => {
      cb(...args);
    });
  }
}

const emitter = new EventEmitter();

const log1 = (...args) => console.log("logged", ...args);
emitter.on("Hello", log1);
emitter.emit("Hello", "Push all", "by Ujjwal");

emitter.off("Hello", log1);
emitter.emit("Hello", "Push all", "by Ujjwal");

emitter.once("Hello once", log1);

emitter.emit("Hello once", "once");
emitter.emit("Hello once", "twice");
emitter.emit("Hello once", "thrice");
