const blessed = require('blessed');
const UI = require('./UI').default;

module.exports.default = class PostingsList extends UI {
    constructor(args) {
        super(args);

        this._widget = blessed.listtable({
            parent: this._screen,
            top: 0,
            left: 0,
            data: args.data,
            border: 'line',
            align: 'left',
            tags: true,
            keys: true,
            width: '100%',
            height: '100%',
            vi: true,
            mouse: false,
            style: {
                border: {
                    fg: 'blue'
                },
                header: {
                    fg: 'green',
                    bold: true
                },
                cell: {
                    fg: 'white',
                    selected: {
                        bg: 'red'
                    }
                }
            }
        });

        this._screen.append(this._widget);
        this._widget.focus();
        this._screen.render();
    }
};
