const blessed = require('blessed');
const UI = require('./UI').default;

module.exports.default = class MessageBox extends UI {
    constructor(args) {
        super(args);

        this._widget = blessed.message({
            parent: this._screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            label: ' {blue-fg}' + args.title + '{/blue-fg} ',
            tags: true,
            keys: true,
            hidden: true,
            vi: true
        });

        this._widget.display(args.text, args.timeout, () => {
            this.destroy();
        });

        this._screen.render();
    }
};
