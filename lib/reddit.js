const Snoocore = require('snoocore');
const _ = require('lodash');

/**
 * Reddit Class
 */
module.exports.default = class Reddit {
    /**
     * Constructs the Reddit object:
     * - Initializes class properties
     * - Initializes Snoocore Reddit API library
     *
     * @param      {Object}  arg1                    The args object
     * @param      {Object}  arg1.dependencies:deps  The dependencies object
     * @param      {Object}  arg1.reddit:args        The Reddit config object
     */
    constructor({ dependencies: deps, reddit: args }) {
        this._log = deps.log;
        this._reddit = new Snoocore(args);
        this._me = null;
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
     * Getter for driver instance
     *
     * @return     {Function}  The driver instance
     */
    get driver() {
        return this._reddit;
    }

    /**
     * Log in the user
     *
     * @return     {Promise}  Promise
     */
    async login() {
        this.log.info('logging into reddit ...');
        await this._reddit.auth();
        this._me = await this._reddit('/api/v1/me').get();
        return true;
    }

    /**
     * Update subreddits/mine data and return it
     *
     * @return     {Promise}  Promise
     */
    async updateSubredditsMine() {
        try {
            const subredditsMineSubscriber = await this.querySubredditsMineSubscriber();
            return subredditsMineSubscriber.allChildren;
        } catch(err) {
            this.log.error('updateSubredditsMine failed: %j', err);
            return null;
        }
    }

    /**
     * Generic querier that supports slice-loading
     *
     * @param      {string}   uri           The URI
     * @param      {number}   slicesToLoad  The number of slices to load
     * @return     {Promise}  Promise
     */
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
            this.log.error('querier failed: %j', err);
            return null;
        }

        return rawArray;
    }

    /**
     * Query generic raw data
     *
     * @param      {string}   uri           The URI
     * @param      {number}   slicesToLoad  The number of slices to load
     * @return     {Promise}  Promise
     */
    async queryGenericRaw(uri, slicesToLoad) {
        return await this.querier(uri, slicesToLoad);
    }

    /**
     * Query articles raw data
     *
     * @param      {string}   uri     The URI
     * @return     {Promise}  Promise
     */
    async queryArticlesRaw(uri) {
        const slicesToLoad = 2;
        return this.queryGenericRaw(uri, slicesToLoad);
    }

    /**
     * Query comments raw data
     *
     * @param      {string}   articleId  The article identifier
     * @return     {Promise}  Promise
     */
    async queryCommentsRaw(articleId) {
        return await this._reddit('/comments/$article').get({
            'sort': 'confidence',
            // 'context': 8,
            '$article': articleId
        });
    }

    /**
     * Query subreddits/mine/subscriber
     *
     * @return     {Promise}  Promise
     */
    async querySubredditsMineSubscriber() {
        return await this._reddit('/subreddits/mine/subscriber').listing();
    }

    /**
     * Saves an article
     *
     * @param      {string}   fullname  The article "fullname", e.g. "t5_ia27s"
     * @return     {Promise}  Promise
     */
    async saveArticle(fullname) {
        try {
            await this._reddit('/api/save').post({
                'id': fullname
            });

            return true;
        } catch(err) {
            this.log.error('saveArticle failed: %j', err);
            return false;
        }
    }

    /**
     * Unsaves ("remove from saves") an article
     *
     * @param      {string}   fullname  The article "fullname", e.g. "t5_ia27s"
     * @return     {Promise}  Promise
     */
    async unsaveArticle(fullname) {
        try {
            await this._reddit('/api/unsave').post({
                'id': fullname
            });

            return true;
        } catch(err) {
            this.log.error('unsaveArticle failed: %j', err);
            return false;
        }
    }
};
