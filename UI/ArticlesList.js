const UI = require('./UI').default;
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const _ = require('lodash');

/**
 * ArticlesList Class
 */
module.exports.default = class ArticlesList extends UI {
    /**
     * Constructs the ArticlesList object.
     *
     * @param      {Object}  args    The arguments object
     */
    constructor(args) {
        super(args);

        this._widget = this.driver.listtable({
            'parent': this.screen,
            'top': 0,
            'left': 0,
            'border': 'line',
            'align': 'left',
            'tags': true,
            'keys': true,
            'width': this.screen.width - 4,
            'height': '100%',
            'vi': false,
            'mouse': false,
            'noCellBorders': true,
            'style': {
                'border': {
                    'fg': 'white'
                },
                'header': {
                    'fg': 'cyan',
                    'bold': true
                },
                'cell': {
                    'fg': 'white',
                    'selected': {
                        'bg': 'red'
                    }
                }
            }
        });

        this._widget.focus();
    }

    /**
     * Set raw data and process it
     *
     * @param      {Object}  raw     The raw data
     */
    set raw(raw) {
        this._raw = raw;
        this._data = this.buildDataFromRaw(raw);

        this._widget.setData(this._data);
        this.render();
    }

    /**
     * Get raw data
     *
     * @return     {Object}  The raw data
     */
    get raw() {
        return this._raw;
    }

    /**
     * Get the data
     *
     * @return     {Object}  The data
     */
    get data() {
        return this._data;
    }

    /**
     * Builds data from raw data
     *
     * @param      {Object}  raw     The raw data
     * @return     {Array}   The data
     */
    buildDataFromRaw(raw) {
        let data = [
            [
                '{bold}Score{/bold}',
                '{bold}Subreddit{/bold}',
                '{bold}Title{/bold}'
            ]
        ];

        _.forEach(raw, (item) => {
            let title = entities.decode(item.data.title);
            const subreddit = item.data.subreddit;

            let scoreString = this.buildScoreString(item.data.score);

            if(item.data.clicked === true || item.data.visited === true) {
                title = `{gray-fg}${title}{/gray-fg}`;
            }

            if(item.data.over_18 === true) {
                title = `{red-fg}[18+]{/red-fg} ${title}`;
            }

            if(item.data.saved === true) {
                title = `{green-fg}[saved]{/green-fg} ${title}`;
            }

            data.push([
                scoreString,
                subreddit,
                title
            ]);
        });

        return data;
    }

    /**
     * Build the score string
     *
     * @param      {number}  score   The score
     * @return     {string}  The score string
     */
    buildScoreString(score) {
        let scoreString = score.toString();

        if(score > 999) {
            scoreString = (score / 1000).toFixed(1) + 'k';
        } else if(score >= 15000 && score < 25000) {
            scoreString = `{green-fg}${scoreString}{/green-fg}`;
        } else if(score >= 25000 && score < 35000) {
            scoreString = `{yellow-fg}${scoreString}{/yellow-fg}`;
        } else if(score >= 35000) {
            scoreString = `{red-fg}${scoreString}{/red-fg}`;
        }

        return scoreString;
    }
};
