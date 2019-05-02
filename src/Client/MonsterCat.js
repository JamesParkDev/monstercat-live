const WebSocket = require("ws");
const util = require("../assets/gateway");
const { EventEmitter } = require("events");
module.exports = class Client extends EventEmitter {
  /**
   * @typedef {Object} ClientOptions
   * @param {string} token
   */

  /**
   * @typedef {Object} song
   * @param {string[]|string} url
   * @param {string} name
   */

  /**
   *
   * @param {ClientOptions} options
   */
  constructor(options) {
    super();
    if (!options.token) return new Error("INVALID_TOKEN: No token was provide");
    if (!options.attempts) options.attempts = 10;
    this.ws = new WebSocket(util.WEBSOCKET, options.token);

    this.ws.onopen = target => {
      setInterval(() => {
        this.ws.pong();
        this.ws.send(this._stringToArrayBuffer(JSON.stringify({ e: "PONG" })));
      }, 4000);
    };

    this.options = options;

    this.ws.onmessage = async message => {
      var enc = new TextDecoder("utf-8");
      var arr = new Uint8Array(message.data);
      var e = await enc.decode(arr);
      const parsed = JSON.parse(e);
      if (parsed.e === "TRACK_UPDATE") {
        this.song = e.data;
        this.emit("TRACK_UPDATE", parsed.data);
      } else if (parsed.e === "DISCONNECTED") {
        if (parsed.data.reason === "INVALID_TOKEN") {
          throw new Error("INVALID_TOKEN: false token was provided");
        }
      } else if (parsed.e === "READY") {
        this.emit("CONNECTED");
      }
    };

    this.ws.onclose = (clean, code, reason, target) => {
      // try connect
      this._reconnect();
    };

    this.isAlive = false;

    /**
     * @type {song|null}
     */
    this.song = null;
  }

  open(attempts) {
    this.ws = new WebSocket(util.WEBSOCKET, this.options.token);
    if (attempts >= this.options.attemnts) {
       return;
    }
  }

  _reconnect() {
    var self = this;
    setTimeout(function() {
      self.options.attempts++;
      self.open(true);
    }, 3000);
  }

  _stringToArrayBuffer(string) {
    const arrayBuffer = new ArrayBuffer(string.length);
    const arrayBufferView = new Uint8Array(arrayBuffer);
    for (let i = 0; i < string.length; i++) {
      arrayBufferView[i] = string.charCodeAt(i);
    }
    return arrayBuffer;
  }

  get currentSong() {
    return this.song ? this.song : "NO_SONG";
  }

  heartbeat() {
    return (this.isAlive = true);
  }
};
