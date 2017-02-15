module.exports.default = class UI {
    constructor(args) {
        this._screen = args.screen;
    }

    destroy() {
        this._widget.destroy();
        this._screen.render();
    }

    static get DISPLAY_NO_TIMEOUT() {
        const timeoutNumber = -1;
        return timeoutNumber;
    }

    static get DISPLAY_DEFAULT_TIMEOUT() {
        const timeoutNumber = 3;
        return timeoutNumber;
    }
};
