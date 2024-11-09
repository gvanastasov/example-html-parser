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
      const tokenizer = new HTMLTokenizer(dummyHTML);
      const tokens = tokenizer.tokenize();
      const parser = new HTMLParser(tokens);
      const domTree = parser.parse();
      expect(domTree).to.be.an('object').that.has.property('tagName');
      expect(domTree.tagName).to.equal('html');
    });
  
    it('should handle basic HTML structure correctly', function () {
      const tokenizer = new HTMLTokenizer(dummyHTML);
      const tokens = tokenizer.tokenize();
      const parser = new HTMLParser(tokens);
      const domTree = parser.parse();
  
      const header = domTree.children
        .find(child => child.tagName === 'body')
            .children
                .find(child => child.tagName === 'header');
      expect(header).to.exist;
      expect(header.children[0].value).to.include('Welcome to My Dummy Website');
    });
  });