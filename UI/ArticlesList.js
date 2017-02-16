const UI = require('./UI').default;
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const _ = require('lodash');

module.exports.default = class ArticlesList extends UI {
    constructor(args) {
        super(args);

        this._widget = this.driver.listtable({
            parent: this.screen,
            top: 0,
            left: 0,
            data: args.data,
            border: 'line',
            align: 'left',
            tags: true,
            keys: true,
            width: this.screen.width - 4, // TODO
            height: '100%',
            vi: false,
            mouse: false,
            noCellBorders: true,
            style: {
                border: {
                    fg: 'white'
                },
                header: {
                    fg: 'cyan',
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

        this._widget.focus();
    }

    set raw(raw) {
        this._raw = raw;
        this._data = this.buildDataFromRaw(raw);

        this._widget.setData(this._data);
        this.render();
    }

    get raw() {
        return this._raw;
    }

    get data() {
        return this._data;
    }

    buildDataFromRaw(raw) {
        let data = [
            [
                '{bold}Score{/bold}',
                '{bold}Subreddit{/bold}',
                '{bold}Title{/bold}'
            ]
        ];

        _.forEach(raw, (item) => {
            let scoreString = item.data.score.toString();
            let title = entities.decode(item.data.title);
            const subreddit = item.data.subreddit;

            if(item.data.score > 999) {
                scoreString = (item.data.score / 1000).toFixed(1) + 'k';
            }

            if(item.data.score >= 15000 && item.data.score < 25000) {
                scoreString = `{green-fg}${scoreString}{/green-fg}`;
            }

            if(item.data.score >= 25000 && item.data.score < 35000) {
                scoreString = `{yellow-fg}${scoreString}{/yellow-fg}`;
            }

            if(item.data.score >= 35000) {
                scoreString = `{red-fg}${scoreString}{/red-fg}`;
            }

            data.push([
                scoreString,
                subreddit,
                title
            ]);
        });

        return data;
    }
};
