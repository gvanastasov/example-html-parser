import { TOKEN_TYPES } from './html-tokenizer.mjs';

class HTMLParser {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
      this.stack = [];
      this.root = null;
    }
  
    parse() {
      let token;
      while ((token = this.tokens[this.position])) {
        if (token.type === TOKEN_TYPES.TAG_OPEN) {
          const element = { type: 'element', tagName: token.value, attributes: token.attributes, children: [] };
          if (!this.root) {
            this.root = element;
          }
          if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].children.push(element);
          }
          this.stack.push(element);
        } else if (token.type === TOKEN_TYPES.TAG_CLOSE) {
          this.stack.pop();
        } else if (token.type === TOKEN_TYPES.TEXT) {
          const textNode = { type: 'text', value: token.value };
          if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].children.push(textNode);
          }
        } else if (token.type === TOKEN_TYPES.COMMENT) {
          const commentNode = { type: 'comment', value: token.value };
          if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].children.push(commentNode);
          }
        }
  
        this.position++;
      }
      return this.root;
    }
}
  
export default HTMLParser;