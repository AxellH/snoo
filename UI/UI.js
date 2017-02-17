
/**
 * UI Class
 */
module.exports.default = class UI {
    /**
     * Constructs the UI object.
     *
     * @param      {Object}  args    The arguments object
     */
    constructor(args) {
        this._driver = args.driver;
        this._screen = args.screen;
    }

    /**
     * Getter for driver instance
     *
     * @return     {Function}  The driver instance
     */
    get driver() {
        return this._driver;
    }

    /**
     * Getter for screen (blessed) instance
     *
     * @return     {Function}  The screen instance
     */
    get screen() {
        return this._screen;
    }

    /**
     * Getter for widget instance
     *
     * @return     {Function}  The widget instance
     */
    get widget() {
        return this._widget;
    }

    /**
     * Render current UI
     *
     * @return     {boolean}  True
     */
    render() {
        // this._screen.realloc();
        this._screen.render();
        return true;
    }

    /**
     * Destroy current UI
     *
     * @return     {boolean}  True
     */
    destroy() {
        this._widget.destroy();
        this.render();
        return true;
    }

    /**
     * Static getter for UI display timeout
     *
     * @return     {number}  The timeout
     */
    static get DISPLAY_NO_TIMEOUT() {
        const timeoutNumber = -1;
        return timeoutNumber;
    }

    /**
     * Static getter for UI display timeout
     *
     * @return     {number}  The timeout
     */
    static get DISPLAY_DEFAULT_TIMEOUT() {
        const timeoutNumber = 3;
        return timeoutNumber;
    }

    /**
     * Static getter for UI display timeout
     *
     * @return     {number}  The timeout
     */
    static get DISPLAY_SHORT_TIMEOUT() {
        const timeoutNumber = 1;
        return timeoutNumber;
    }
};
