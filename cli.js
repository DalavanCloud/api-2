#!/usr/bin/env node

const _ = require('lodash');
const parseArgs = require('minimist')(process.argv.slice(2));
const path = require('path');
require('colors');

const utils = require('./utils/utils');

const args = parseArgs._;
const opts = _.clone(parseArgs);
delete opts._;

const action = load(args[0]);
action.run();

function load(verb = 'help') {
  const file = path.join(__dirname, 'commands', `${verb}.js`);
  if (utils.fileExists(file)) {
    return require(file);
  }

  console.log('Command not found.'.red);
  console.log(`Type ${'api help'.yellow} to see all commands`);
  return process.exit();
}