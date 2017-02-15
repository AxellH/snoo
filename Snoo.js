const blessed = require('blessed');
const Snoocore = require('snoocore');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const _ = require('lodash');
const packageJson = require('./package.json');

const MessageBox = require('./UI/MessageBox').default;
const PostingsList = require('./UI/PostingsList').default;

module.exports.default = class Snoo {
    constructor() {
        this._store = {};

        this._screen = blessed.screen({
            'smartCSR': true
        });

        this._screen.title = 'Snoo';
        this._screen.key('q', () => {
            this._screen.destroy();
        });

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

    async run() {
        const loggedIn = await this.login();

        if(loggedIn === false) {
            return false;
        }

        const postings = await this.postings('/r/all/hot');

        return true;
    }

    async postings(uri) {
        try {
            this._store.$hot = await this._reddit(uri).listing();

            let data = [
                [
                    'Score',
                    'Subreddit',
                    'Title',
                    'Author'
                ]
            ];

            _.forEach(this._store.$hot.children, (child) => {
                let scoreString = child.data.score.toString();
                const title = entities.decode(child.data.title);
                const subreddit = child.data.subreddit;
                const author = child.data.author;

                if(child.data.score > 999) {
                    scoreString = (child.data.score / 1000).toFixed(1) + 'k';
                }

                data.push([
                    scoreString,
                    subreddit,
                    title,
                    author
                ]);
            });

            // console.log('%j', data);

            let postingsList = new PostingsList({
                'screen': this._screen,
                'data': data
            });
        } catch(err) {
            console.log('%j', err);
            // const msgbox = new MessageBox({
            //     'screen': this._screen,
            //     'title': 'Error',
            //     'text': err,
            //     'timeout': MessageBox.DISPLAY_NO_TIMEOUT
            // });
            return false;
        }

        return true;
    }

    async login() {
        try {
            let msgbox = new MessageBox({
                'screen': this._screen,
                'title': 'Login',
                'text': 'Please wait while logging you in ...',
                'timeout': MessageBox.DISPLAY_NO_TIMEOUT
            });
            this._store.me = await this._reddit('/api/v1/me').get();
            msgbox.destroy();
        } catch(err) {
            const msgbox = new MessageBox({
                'screen': this._screen,
                'title': 'Error',
                'text': err,
                'timeout': MessageBox.DISPLAY_NO_TIMEOUT
            });
            return false;
        }

        return true;
    }
};
