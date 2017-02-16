module.exports.default = class UI {
    constructor(args) {
        this._driver = args.driver;
        this._screen = args.screen;
    }

    get driver() {
        return this._driver;
    }

    get screen() {
        return this._screen;
    }

    get widget() {
        return this._widget;
    }

    render() {
        // this._screen.realloc();
        this._screen.render();
    }

    destroy() {
        this._widget.destroy();
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
