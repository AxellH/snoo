const packageJson = require('./package.json');
const blessed = require('blessed');
const Reddit = require('./lib/reddit').default;
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const _ = require('lodash');
const bunyan = require('bunyan');
const fs = require('fs');

const MessageBox = require('./UI/MessageBox').default;
const ArticlesList = require('./UI/ArticlesList').default;
const ArticleView = require('./UI/ArticleView').default;
const PopupList = require('./UI/PopupList').default;

const SUBREDDITS_FIXED = [
    'hot',
    'new',
    'top'
];

/**
 * Snoo Class
 */
module.exports.default = class Snoo {
    /**
     * Constructs the Snoo object:
     * - Initializes class properties
     * - Initializes logger (bunyan) instance
     * - Initializes Reddit instance
     */
    constructor() {
        this._views = [];
        this._viewIndex = 0;

        this._autoUpdater = null;

        this._articlesList = null;
        this._popupList = null;

        this._currentUri = `${SUBREDDITS_FIXED[0]}`;

        this._subredditsMineSubscriberRaw = [];


        // Clear the logfile
        const logfile = fs.openSync(process.env.SNOO_LOG_FILE, 'w');
        fs.closeSync(logfile);

        this._log = bunyan.createLogger({
            'name': packageJson.name,
            'streams': [
                {
                    'path': process.env.SNOO_LOG_FILE
                }
            ]
        });

        this._reddit = new Reddit({
            'dependencies': {
                'log': this._log
            },
            'reddit': {
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
                        'mysubreddits',
                        'submit',
                        'edit',
                        'privatemessages',
                        'report'
                    ]
                }
            }
        });
    }

    /**
     * Getter for logger instance
     *
     * @return     {Function}  The logger instance
     */
    get log() {
        return this._log;
    }

    /**
     * Getter for Reddit instance
     *
     * @return     {Function}  The Reddit instance
     */
    get $r() {
        return this._reddit;
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
     * Setup the screen (blessed)
     *
     * @return     {boolean}  True
     */
    screenSetup() {
        this._screen = blessed.screen({
            'autoPadding': true,
            'fullUnicode': true,
            'dockBorders': true
        });

        this._screen.key('C-q', () => {
            this._screen.destroy();
            process.exit(0);
        });

        this._screen.key('C-t', () => {
            this.popupSubredditsMine();
        });

        this._screen.title = 'Snoo';

        return true;
    }

    /**
     * Push a new view on the view-stack
     *
     * @param      {Object}  view    The view to be pushed
     * @return     {number} Current view index
     */
    pushView(view) {
        let newLength = this._views.push(view);

        this._viewIndex = (newLength - 1);
        this._views[this._viewIndex].render();

        return this._viewIndex;
    }

    /**
     * Remove (pop) the current view from the stack and go to the previous one.
     *
     * @return     {number} Current view index
     */
    goBack() {
        this._views[this._viewIndex].destroy();
        this._views.pop();

        this._viewIndex--;
        this._views[this._viewIndex].render();

        return this._viewIndex;
    }

    /**
     * Run Snoo. This is the program entrypoint.
     *
     * @return     {Promise}  Promise
     */
    async run() {
        const loggedIn = await this.$r.login();

        if(loggedIn === false) {
            this.log.error('login failed: Could not log in.');
            return false;
        }

        this.screenSetup();
        this._articlesList = this.initArticlesList();

        await this.updateArticlesList();
        this._subredditsMineSubscriberRaw = await this.$r.updateSubredditsMine();

        if(process.env.hasOwnProperty('SNOO_AUTO_UPDATE_INTERVAL') === true) {
            const oneMinuteInMilliseconds = 60000;
            const autoUpdateInterval = parseInt(process.env.SNOO_AUTO_UPDATE_INTERVAL, 10) * oneMinuteInMilliseconds;
            this._autoUpdater = setInterval(async () => {
                await this.updateArticlesList();
                this._subredditsMineSubscriberRaw = await this.$r.updateSubredditsMine();
            }, autoUpdateInterval);
            this.log.debug('autoUpdater started');
        }

        return true;
    }

    /**
     * Display the subreddits/mine switcher popup.
     *
     * @return     {boolean}  True
     */
    popupSubredditsMine() {
        if(this._popupList !== null
        && typeof this._popupList.destroy === 'function') {
            this._popupList.destroy();
            this._popupList = null;
        }

        this._popupList = new PopupList({
            'driver': blessed,
            'screen': this.screen,
            'title': 'subreddits'
        });

        let data = _.clone(SUBREDDITS_FIXED);

        _.forEach(this._subredditsMineSubscriberRaw, item => {
            data.push('/' + item.data.display_name_prefixed);
        });

        this._popupList.widget.on('select', async () => {
            let dataIndex = this._popupList.widget.selected - SUBREDDITS_FIXED.length;
            let displayName = '';

            if(dataIndex < 0) {
                dataIndex = dataIndex + SUBREDDITS_FIXED.length;
                displayName = SUBREDDITS_FIXED[dataIndex];
            } else {
                const selectedRaw = this._subredditsMineSubscriberRaw[dataIndex];
                displayName = selectedRaw.data.display_name_prefixed;
            }

            this._currentUri = `/${displayName}`;
            this._popupList.destroy();
            this._popupList = null;
            await this.updateArticlesList();
            this._articlesList.widget.select(0);
        });

        this._popupList.data = data;

        return true;
    }

    /**
     * Initialize articles list (the "main view").
     *
     * @return     {ArticlesList}  Initialized ArticlesList instance
     */
    initArticlesList() {
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
            const createdAt = new Date((articlesList.raw[dataIndex].data.created * 1000));
            let body = entities.decode(articlesList.raw[dataIndex].data.selftext);

            if(isSelf === false) {
                body = url;
            }

            if(body.length > 350) {
                body = `${body.substr(0, 350)}...`;
            }

            const text = `{red-fg}{bold}${title}{/bold}{/red-fg}\nby {yellow-fg}${author}{/yellow-fg} on ${createdAt.toDateString()}\n\n${body}`;

            return new MessageBox({
                'driver': blessed,
                'screen': this.screen,
                'title': 'Preview',
                'text': text,
                'timeout': MessageBox.DISPLAY_NO_TIMEOUT
            });
        });

        // Refresh articles list
        articlesList.widget.key('C-r', async () => {
            return await this.updateArticlesList();
        });

        // Open any article and view it instead of launching a browser
        articlesList.widget.key('C-v', async () => {
            const dataIndex = articlesList.widget.selected - 1;
            return this.initArticleView(articlesList.raw[dataIndex]);
        });

        articlesList.widget.key('C-s', async () => {
            const dataIndex = articlesList.widget.selected - 1;
            let raw = articlesList.raw;

            if(raw[dataIndex].data.saved === false) {
                await this.$r.saveArticle(raw[dataIndex].data.name);
                raw[dataIndex].data.saved = true;
            } else {
                await this.$r.unsaveArticle(raw[dataIndex].data.name);
                raw[dataIndex].data.saved = false;
            }

            articlesList.raw = raw;
            articlesList.widget.select(dataIndex + 1);
        });

        // Press enter on article in articles list
        articlesList.widget.on('select', () => {
            const dataIndex = articlesList.widget.selected - 1;
            const isSelf = articlesList.raw[dataIndex].data.is_self;
            const url = articlesList.raw[dataIndex].data.url;

            if(isSelf === true) {
                this.initArticleView(articlesList.raw[dataIndex]);
            } else {
                this.screen.spawn(process.env.BROWSER, [url]);
            }
        });

        this.pushView(articlesList);
        return articlesList;
    }

    /**
     * Update articles list content
     *
     * @return     {Promise}  Promise
     */
    async updateArticlesList() {
        try {
            const selectedIndex = this._articlesList.widget.selected;
            this._articlesList.widget.setLabel(this._currentUri);
            this._articlesList.raw = await this.$r.queryArticlesRaw(this._currentUri);
            this._articlesList.widget.select(selectedIndex);
        } catch(err) {
            this.log.error('updateArticlesList failed: %j', err);
            return false;
        }

        return true;
    }

    /**
     * Initialize article view
     *
     * @param      {Object}       raw     The raw reddit API data of the article
     * @return     {ArticleView}  Initialized ArticleView instance
     */
    initArticleView(raw) {
        const articleView = new ArticleView({
            'driver': blessed,
            'screen': this.screen
        });

        articleView.widget.key('escape', () => {
            this.goBack();
        });

        articleView.raw = raw;

        this.$r.queryCommentsRaw(raw.data.id).then(rawData => {
            articleView.rawComments = rawData[1].data.children;
        }).catch(err => {
            this.log.error('queryCommentsRaw failed: %j', err);
        });

        this.pushView(articleView);
        return articleView;
    }
};
