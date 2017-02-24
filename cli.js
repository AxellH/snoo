#!/usr/bin/env node
require('dotenv').config();
const Snoo = require('./Snoo').default;
const snoo = new Snoo();

snoo.run().then(fulfillment => {
}).catch(rejection => {
    console.log(rejection);
});
