const UI = require('./UI').default;

/**
 * PopupList Class
 */
module.exports.default = class PopupList extends UI {
    /**
     * Constructs the PopupList object.
     *
     * @param      {Object}  args    The arguments object
     */
    constructor(args) {
        super(args);

        this._widget = this.driver.list({
            'parent': this.screen,
            'border': 'line',
            'align': 'left',
            'top': 'center',
            'left': 'center',
            'label': args.title,
            'padding': 1,
            'tags': true,
            'keys': true,
            'width': 'shrink',
            'height': 'half',
            'vi': false,
            'mouse': false,
            'grabKeys': true,
            'style': {
                'selected': {
                    'bg': 'blue'
                }
            }
        });

        this._widget.on('cancel', () => {
            this.destroy();
        });

        this._widget.focus();
    }

    /**
     * Set the data
     *
     * @param      {Object}  data    The data
     */
    set data(data) {
        this._data = data;
        this._widget.setItems(this._data);

        this.render();
    }

    /**
     * Get the data
     *
     * @return     {Object}  The data
     */
    get data() {
        return this._data;
    }
};
