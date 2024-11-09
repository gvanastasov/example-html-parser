const TOKEN_TYPES = {
    TAG_OPEN: 'TAG_OPEN',
    TAG_CLOSE: 'TAG_CLOSE',
    TEXT: 'TEXT',
    COMMENT: 'COMMENT',
    ATTRIBUTE: 'ATTRIBUTE',
    DOCTYPE: 'DOCTYPE'
  };
  
  class HTMLTokenizer {
    constructor(html) {
      this.html = html;
      this.position = 0;
      this.tokens = [];
    }
  
    // Returns the next token
    getNextToken() {
      if (this.position >= this.html.length) {
        return null; // End of input
      }
  
      const char = this.html[this.position];
  
      // Skip whitespace
      if (/\s/.test(char)) {
        this.position++;
        return this.getNextToken();
      }
  
      // Handle tags (start or end)
      if (char === '<') {
        const nextChar = this.html[this.position + 1];
        if (nextChar === '/') {
          // Closing tag
          return this.consumeEndTag();
        }
        // Opening tag or doctype
        return this.consumeStartTag();
      }
  
      // Handle comments
      if (char === '!' && this.html[this.position + 1] === '-' && this.html[this.position + 2] === '-') {
        return this.consumeComment();
      }
  
      // Handle text nodes
      return this.consumeText();
    }
  
    // Consume text until next tag or special character
    consumeText() {
      let text = '';
      while (this.position < this.html.length && this.html[this.position] !== '<') {
        text += this.html[this.position];
        this.position++;
      }
      return { type: TOKEN_TYPES.TEXT, value: text };
    }
  
    // Consume an end tag
    consumeEndTag() {
      this.position += 2; // Skip the "</"
      let tagName = '';
      while (this.position < this.html.length && /[a-zA-Z0-9]/.test(this.html[this.position])) {
        tagName += this.html[this.position];
        this.position++;
      }
      this.position++; // Skip the ">"
      return { type: TOKEN_TYPES.TAG_CLOSE, value: tagName };
    }
  
    // Consume a start tag (including optional attributes)
    consumeStartTag() {
      this.position++; // Skip the "<"
      let tagName = '';
      while (this.position < this.html.length && /[a-zA-Z0-9]/.test(this.html[this.position])) {
        tagName += this.html[this.position];
        this.position++;
      }
  
      // Now, check for attributes
      const attributes = [];
      while (this.position < this.html.length && this.html[this.position] !== '>') {
        if (/\s/.test(this.html[this.position])) {
          this.position++;
          continue;
        }
        attributes.push(this.consumeAttribute());
      }
  
      this.position++; // Skip the ">"
      return { type: TOKEN_TYPES.TAG_OPEN, value: tagName, attributes };
    }
  
    // Consume an attribute in a tag
    consumeAttribute() {
      let name = '';
      while (this.position < this.html.length && /[a-zA-Z0-9-]/.test(this.html[this.position])) {
        name += this.html[this.position];
        this.position++;
      }
  
      this.position++; // Skip the "="
  
      let value = '';
      if (this.html[this.position] === '"') {
        this.position++; // Skip the opening quote
        while (this.position < this.html.length && this.html[this.position] !== '"') {
          value += this.html[this.position];
          this.position++;
        }
        this.position++; // Skip the closing quote
      }
      return { name, value };
    }
  
    // Consume a comment
    consumeComment() {
      this.position += 4; // Skip the "<!--"
      let comment = '';
      while (this.position < this.html.length && this.html.slice(this.position, this.position + 3) !== '-->') {
        comment += this.html[this.position];
        this.position++;
      }
      this.position += 3; // Skip the closing "-->"
      return { type: TOKEN_TYPES.COMMENT, value: comment };
    }
  
    // Start tokenization process
    tokenize() {
      let token;
      while ((token = this.getNextToken())) {
        this.tokens.push(token);
      }
      return this.tokens;
    }
  }
  
//   const html = `<div class="container"><h1>Hello, world!</h1><!-- This is a comment --></div>`;
//   const tokenizer = new HTMLTokenizer(html);
//   const tokens = tokenizer.tokenize();
//   console.log(tokens);

export default HTMLTokenizer;
  