# Snoo

A Reddit command line client written in Node.js, using modern ES-features

![Snoo](demo.gif)

## Features

Snoo allows you to:
- browse hot, new & top subreddits
- browse your subscribed subreddits
- preview articles
- read articles
- read the top comments of articles
- save and unsave articles (no categories yet, though)
- be warned if an article is NSFW before opening it

... and there's a lot more to come!

## Installation

### GitHub

```bash
$ git clone git@github.com:twostairs/snoo.git
$ cd snoo
$ npm install
$ cat .env.example | while read line; do echo export $line; done > ~/.config/snoo
$ vim ~/.config/snoo # & adjust settings
$ vim ~/.bashrc # or .bash_profile, .zshrc, ... -> add `source ~/.config/snoo`
$ npm link
```

In order to get `REDDIT_APP_KEY` and `REDDIT_APP_SECRET` you need to [create your own reddit app](https://www.reddit.com/prefs/apps/) as a `script`. `name`, `description`, `about url` and `redirect url` don't matter.

For `REDDIT_USERNAME` and `REDDIT_PASSWORD` you need to enter the credentials of the user you created the app with. **Snoo** does not use your credentials for anything else but logging in. If you want to be sure, check out the source code.

Info: Don't use `~` in the `SNOO_LOG_FILE` path, as it's not (yet) supported.

### NPM

```bash
$ npm install -g snoo
$ cat /your/global/node_modules/snoo/.env.example | while read line; do echo export $line; done > ~/.config/snoo
$ vim ~/.config/snoo # & adjust settings
$ vim ~/.bashrc # or .bash_profile, .zshrc, ... -> add `source ~/.config/snoo`
```

## Running

```bash
$ snoo
```

## Usage

- `ctrl+q`: Quit Snoo
- `ctrl+r`: Refresh articles
- `arrow up`/`arrow down`: Scroll through articles list
- `space`: Preview selected article
- `return`: Open article, automatically in external browser or article viewer, depending on the type of the article
- `ctrl+v`: Open article in viewer
- `ctrl+s`: Save/unsave selected article
- `ctrl+t`: Open own subreddits list for switching
- `escape`: Go back to the articles list

## Feedback & suggestions

Shoot me a [tweet](https://twitter.com/mrusme). :-)
