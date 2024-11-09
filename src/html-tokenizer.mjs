const TOKEN_TYPES = {
  TAG_OPEN: 'TAG_OPEN',
  TAG_CLOSE: 'TAG_CLOSE',
  TEXT: 'TEXT',
  COMMENT: 'COMMENT',
  ATTRIBUTE: 'ATTRIBUTE',
  DOCTYPE: 'DOCTYPE',
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

      // Handle comment or doctype
      if (nextChar === '!') {
        if (
          this.html.slice(this.position + 2, this.position + 2 + 7) ===
          'DOCTYPE'
        ) {
          return this.consumeDoctype();
        }
        if (
          this.html.slice(this.position + 2, this.position + 2 + 2) === '--'
        ) {
          return this.consumeComment();
        }
      }

      if (nextChar === '/') {
        // Closing tag
        return this.consumeEndTag();
      }

      // Opening tag or doctype
      return this.consumeStartTag();
    }

    // Handle text nodes
    return this.consumeText();
  }

  // Consume a doctype declaration
  consumeDoctype() {
    this.position += 9; // Skip the "<!DOCTYPE"
    let doctype = '';
    while (
      this.position < this.html.length &&
      this.html[this.position] !== '>'
    ) {
      if (/[a-zA-Z]/.test(this.html[this.position])) {
        doctype += this.html[this.position];
      }
      this.position++;
    }
    this.position++; // Skip the closing ">"
    return { type: TOKEN_TYPES.DOCTYPE, value: doctype };
  }

  // Consume text until next tag or special character
  consumeText() {
    let text = '';
    while (
      this.position < this.html.length &&
      this.html[this.position] !== '<'
    ) {
      text += this.html[this.position];
      this.position++;
    }
    return { type: TOKEN_TYPES.TEXT, value: text };
  }

  // Consume an end tag
  consumeEndTag() {
    this.position += 2; // Skip the "</"
    let tagName = '';
    while (
      this.position < this.html.length &&
      /[a-zA-Z0-9]/.test(this.html[this.position])
    ) {
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
    while (
      this.position < this.html.length &&
      /[a-zA-Z0-9]/.test(this.html[this.position])
    ) {
      tagName += this.html[this.position];
      this.position++;
    }

    // Now, check for attributes
    const attributes = [];
    while (
      this.position < this.html.length &&
      this.html[this.position] !== '>'
    ) {
      if (/\s/.test(this.html[this.position])) {
        this.position++;
        continue;
      }
      attributes.push(this.consumeAttribute());
    }

    const openTag = { type: TOKEN_TYPES.TAG_OPEN, value: tagName, attributes };

    if (this.html.slice(this.position - 1, this.position + 1) === '/>') {
      this.position++; // Skip the ">"
      return [openTag, { type: TOKEN_TYPES.TAG_CLOSE, value: tagName }];
    }
    this.position++; // Skip the ">"
    return openTag;
  }

  // Consume an attribute in a tag
  consumeAttribute() {
    let name = '';
    while (
      this.position < this.html.length &&
      /[a-zA-Z0-9-]/.test(this.html[this.position])
    ) {
      name += this.html[this.position];
      this.position++;
    }

    this.position++; // Skip the "="

    let value = '';
    if (this.html[this.position] === '"') {
      this.position++; // Skip the opening quote
      while (
        this.position < this.html.length &&
        this.html[this.position] !== '"'
      ) {
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
    while (
      this.position < this.html.length &&
      this.html.slice(this.position, this.position + 3) !== '-->'
    ) {
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
      if (token instanceof Array) {
        token.forEach((t) => this.tokens.push(t));
      } else {
        this.tokens.push(token);
      }
    }
    return this.tokens;
  }
}

export { HTMLTokenizer, TOKEN_TYPES };
