const blessed = require('blessed');
const Snoocore = require('snoocore');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const _ = require('lodash');
const packageJson = require('./package.json');

const MessageBox = require('./UI/MessageBox').default;
const ArticlesList = require('./UI/ArticlesList').default;
const ArticleView = require('./UI/ArticleView').default;

module.exports.default = class Snoo {
    constructor() {
        this._store = {};

        this._views = [];
        this._viewIndex = 0;

        this._articlesList = null;

        this._currentUri = '/hot';

        this._reddit = new Snoocore({
            'userAgent': '/u/mrusme snoo@' + packageJson.version,
            'oauth': {
                'type': 'script',
                'key': process.env.REDDIT_APP_KEY,
                'secret': process.env.REDDIT_APP_SECRET,
                'username': process.env.REDDIT_USERNAME,
                'password': process.env.REDDIT_PASSWORD,
                'scope': [
                    'identity',
                    'read',
                    'vote',
                    'save',
                    'subscribe',
                    'submit',
                    'edit',
                    'privatemessages',
                    'report'
                ]
            }
        });
    }

    screenSetup() {
        this._screen = blessed.screen({
            autoPadding: true,
            fullUnicode: true,
            dockBorders: true
        });

        this._screen.key('C-q', () => {
            this._screen.destroy();
            process.exit(0);
        });

        this._screen.title = 'Snoo';
    }

    get screen() {
        return this._screen;
    }

    pushView(view) {
        let newLength = this._views.push(view);

        this._viewIndex = (newLength - 1);
        this._views[this._viewIndex].render();
    }

    goBack() {
        this._views[this._viewIndex].destroy();
        this._views.pop();

        this._viewIndex--;
        this._views[this._viewIndex].render();
    }

    async run() {
        const loggedIn = await this.login();

        if(loggedIn === false) {
            console.error('login failed: Could not log in.');
            return false;
        }

        this.screenSetup();
        this._articlesList = this.initArticlesList();

        const updateSuccess = await this.updateArticlesList();

        if(process.env.hasOwnProperty('SNOO_AUTO_UPDATE_INTERVAL') === true) {
            const oneMinuteInMilliseconds = 60000;
            const autoUpdateInterval = parseInt(process.env.SNOO_AUTO_UPDATE_INTERVAL, 10) * oneMinuteInMilliseconds;
            const autoUpdateIntervalRunner = setInterval(async () => {
                return await this.updateArticlesList();
            }, autoUpdateInterval);
        }

        return true;
    }

    async login() {
        try {
            console.log('logging into reddit ...');
            const auth = await this._reddit.auth();
            this._store.me = await this._reddit('/api/v1/me').get();
        } catch(err) {
            console.error('login failed: %j', err);
            return false;
        }

        return true;
    }

    async querier(uri, slicesToLoad) {
        let slice = null;
        let rawArray = [];

        try {
            slice = await this._reddit(uri).listing();
            for(let i = 1; i <= slicesToLoad; i++) {
                rawArray = _.concat(rawArray, slice.children);
                slice = await slice.next();
            }
        } catch(err) {
            console.error('querier failed: %j', err);
            return null;
        }

        return rawArray;
    }

    async queryGenericRaw(uri, slicesToLoad) {
        return await this.querier(uri, slicesToLoad);
    }

    async queryArticlesRaw(uri) {
        const slicesToLoad = 2;
        return this.queryGenericRaw(uri, slicesToLoad);
    }


    async queryCommentsRaw(articleId) {
        return await this._reddit('/comments/$article').get({
            'sort': 'confidence',
            // 'context': 8,
            '$article': articleId
        });
    }

    initArticlesList(uri) {
        const articlesList = new ArticlesList({
            'driver': blessed,
            'screen': this.screen
        });

        // Preview article from articles list
        articlesList.widget.key('space', () => {
            const dataIndex = articlesList.widget.selected - 1;
            const isSelf = articlesList.raw[dataIndex].data.is_self;
            const url = articlesList.raw[dataIndex].data.url;
            const title = entities.decode(articlesList.raw[dataIndex].data.title);
            const author = articlesList.raw[dataIndex].data.author;
            let body = entities.decode(articlesList.raw[dataIndex].data.selftext);

            if(isSelf === false) {
                body = url;
            }

            const text = `{cyan-fg}${title}{/cyan-fg}\nby ${author}\n\n${body}`;

            let msgbox = new MessageBox({
                'driver': blessed,
                'screen': this.screen,
                'title': 'Preview',
                'text': text,
                'timeout': MessageBox.DISPLAY_NO_TIMEOUT
            });
        });

        // Refresh articles list
        articlesList.widget.key('C-r', async () => {
            const updateSuccess = await this.updateArticlesList();
        });

        // Open any article and view it instead of launching a browser
        articlesList.widget.key('C-v', async () => {
            const dataIndex = articlesList.widget.selected - 1;
            const articleView = this.initArticleView(articlesList.raw[dataIndex]);
        });

        // Press enter on article in articles list
        articlesList.widget.on('select', () => {
            const dataIndex = articlesList.widget.selected - 1;
            const isSelf = articlesList.raw[dataIndex].data.is_self;
            const url = articlesList.raw[dataIndex].data.url;

            if(isSelf === true) {
                const articleView = this.initArticleView(articlesList.raw[dataIndex]);
            } else {
                this.screen.spawn(process.env.BROWSER, [url]);
            }
        });

        this.pushView(articlesList);
        return articlesList;
    }

    async updateArticlesList() {
        try {
            this._articlesList.raw = await this.queryArticlesRaw(this._currentUri);
        } catch(err) {
            console.error('updateArticlesList failed: %j', err);
            return false;
        }

        return true;
    }

    initArticleView(raw) {
        const articleView = new ArticleView({
            'driver': blessed,
            'screen': this.screen
        });

        articleView.widget.key('escape', () => {
            this.goBack();
        });

        articleView.raw = raw;

        this.queryCommentsRaw(raw.data.id).then(rawData => {
            articleView.rawComments = rawData[1].data.children;
        }).catch(err => {
            console.error('queryCommentsRaw failed: %j', err);
        });

        this.pushView(articleView);
        return articleView;
    }


};
