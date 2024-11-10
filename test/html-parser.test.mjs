import { expect } from 'chai';
import fs from 'fs';
import { HTMLParser, HTMLTokenizer } from '../src/index.mjs';

const dummyHTML = fs.readFileSync('./test/example.html', 'utf-8');

describe('HTML5 Parser', function () {
  it('should correctly tokenize HTML', function () {
    const tokenizer = new HTMLTokenizer(dummyHTML);
    const tokens = tokenizer.tokenize();
    expect(tokens).to.be.an('array').that.is.not.empty;
  });

  it('should parse HTML into a DOM tree', function () {
    const parser = new HTMLParser(dummyHTML);
    const domTree = parser.parse();
    expect(domTree).to.be.an('object').that.has.property('name');
    expect(domTree.name).to.equal('root');
    expect(domTree.children).to.be.an('array').that.is.not.empty;
    expect(domTree.children[0].name).to.equal('html');
  });

  it('should handle basic HTML structure correctly', function () {
    const parser = new HTMLParser(dummyHTML);
    const domTree = parser.parse();

    const header = domTree
      .children[0]
        .children
        .find((child) => child.name === 'body')
          .children
          .find((child) => child.name === 'header');
    const h1 = header.children.find((child) => child.name === 'h1');

    expect(h1).to.exist;
    expect(h1.children[0].name).to.include('Welcome to My Dummy Website');
  });

  it('shoudl handle selectors correctly', function () {
    const parser = new HTMLParser(dummyHTML);
    const domTree = parser.parse();

    const result = domTree.querySelector('root > html > body > header > h1');
    expect(result).to.be.an('array').that.is.not.empty;
    expect(result[0].children[0].name).to.include('Welcome to My Dummy Website');
  });
});
