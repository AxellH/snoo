const UI = require('./UI').default;

module.exports.default = class MessageBox extends UI {
    constructor(args) {
        super(args);

        this._widget = this.driver.message({
            parent: this.screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            padding: 1,
            label: ' {blue-fg}' + args.title + '{/blue-fg} ',
            tags: true,
            keys: true,
            hidden: true,
            vi: true
        });

        this._widget.display(args.text, args.timeout, () => {
            this._widget.destroy();
        });
    }
};
