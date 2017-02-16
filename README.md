# snoo

A Reddit command line client written in Node.js, using modern ES-features

![Snoo](demo.gif)

## Installation

### GitHub

```bash
$ git clone git@github.com:twostairs/snoo.git
$ cd snoo
$ npm install
$ cp .env.example .env
$ vim .env # & adjust settings
$ npm start
```

In order to get `REDDIT_APP_KEY` and `REDDIT_APP_SECRET` you need to [create your own reddit app](https://www.reddit.com/prefs/apps/) as a `script`. `name`, `description`, `about url` and `redirect url` don't matter.

For `REDDIT_USERNAME` and `REDDIT_PASSWORD` you need to enter the credentials of the user you created the app with. **Snoo** does not use your credentials for anything else but logging in. If you want to be sure, check out the source code.

## Running

```bash
$ npm start
```

## Usage

- `ctrl+q`: Quit Snoo
- `ctrl+r`: Refresh articles
- `arrow up`/`arrow down`: Scroll through articles list
- `space`: Preview selected article
- `return`: Open article, automatically in external browser or article viewer, depending on the type of the article
- `ctrl+v`: Open article in viewer

## Feedback & suggestions

Shoot me a [tweet](https://twitter.com/mrusme). :-)
