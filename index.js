'use strict';

const fs = require('fs');
const glob = require('glob');
const stemmer = require('stemmer');
const sw = require('stopword');

let output;

['Amazon', 'Yelp'].forEach(category => {
  glob(`input/${category}/**/*.txt`, (err, filenames) => {
    if (err) {
      console.error('Fail to read input files: ', err);
      return;
    }

    category = category.toLowerCase();

    output = filenames.reduce((str, filename) => {
      let content = fs.readFileSync(filename, { encoding: 'utf8' });
      content = process(filter(category, content));
      return `${str}${content}\n`;
    }, '');

    outputToFile(category, output);
  });
});

function filter(category, content) {
  content = content.replace(/not\s+/ig, 'not-');
  switch(category) {
    case 'amazon':
      content = content.replace(/[\s\S]+Content:[\r\n]+/ig, '');
      break;
    case 'yelp':
      content = content.replace(/[\s\S]*Category:[^\r\n]*[\r\n]+/ig, '');
      break;
    default:
      content = '';
      break;
  }
  return content.replace(/(\r\n|\r|\n)/ig, ' ');
}

function process(line) {
  let words = sw.removeStopwords(line.split(' '));
  return words.map(w => stemmer(w)).join(' ');
}

function outputToFile(category, data) {
  fs.open('output', 'r', (err, fd) => {
    if (err) {
      fs.mkdirSync('output');
    }
    fs.writeFileSync(`output/${category}.txt`, data);
  });
}