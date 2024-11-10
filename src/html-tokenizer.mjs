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
    this.html = html.trim();
    this.position = 0;
    this.tokens = [];
  }

  // Tokenizes the input HTML
  tokenize() {
    let token;
    while ((token = this.getNextToken())) {
      if (Array.isArray(token)) {
        this.tokens.push(...token);
      } else {
        this.tokens.push(token);
      }
    }
    return this.tokens;
  }

  // Retrieves the next token
  getNextToken() {
    if (this.position >= this.html.length) return null;

    this.skipWhitespace();
    const char = this.html[this.position];

    if (char === '<') {
      return this.handleTag();
    }

    return this.consumeText();
  }

  // Skips whitespace
  skipWhitespace() {
    while (/\s/.test(this.html[this.position])) {
      this.position++;
    }
  }

  // Handles any tag, including comments and doctypes
  handleTag() {
    const nextChar = this.html[this.position + 1];

    if (nextChar === '!') {
      return this.handleSpecialTag();
    }
    if (nextChar === '/') {
      return this.consumeEndTag();
    }

    return this.consumeStartTag();
  }

  // Handle special tags like DOCTYPE and comments
  handleSpecialTag() {
    const peek = this.html.slice(this.position + 2, this.position + 9).toLowerCase();

    if (peek.startsWith('doctype')) return this.consumeDoctype();
    if (this.html.slice(this.position + 2, this.position + 4) === '--') return this.consumeComment();

    throw new Error(`Unexpected character sequence in tag at position ${this.position}`);
  }

  // Consume a DOCTYPE declaration
  consumeDoctype() {
    this.position += 9; // Skip the "<!DOCTYPE"
    const doctype = this.consumeUntil('>');
    return { type: TOKEN_TYPES.DOCTYPE, value: doctype.trim() };
  }

  // Consume a comment
  consumeComment() {
    this.position += 4; // Skip the "<!--"
    const comment = this.consumeUntil('-->');
    this.position += 3; // Skip the closing "-->"
    return { type: TOKEN_TYPES.COMMENT, value: comment };
  }

  // Consume an end tag
  consumeEndTag() {
    this.position += 2; // Skip the "</"
    const tagName = this.consumeTagName();
    this.position++; // Skip the closing ">"
    return { type: TOKEN_TYPES.TAG_CLOSE, value: tagName };
  }

  // Consume a start tag, including optional attributes
  consumeStartTag() {
    this.position++; // Skip the "<"
    const tagName = this.consumeTagName();

    const attributes = this.consumeAttributes();
    const token = { type: TOKEN_TYPES.TAG_OPEN, value: tagName, attributes };

    // Handle self-closing tags
    if (this.html.slice(this.position, this.position + 2) === '/>') {
      this.position += 2;
      return [token, { type: TOKEN_TYPES.TAG_CLOSE, value: tagName }];
    }

    this.position++; // Skip the ">"
    return token;
  }

  // Consume tag name
  consumeTagName() {
    let tagName = '';
    while (/[a-zA-Z0-9]/.test(this.html[this.position])) {
      tagName += this.html[this.position];
      this.position++;
    }
    return tagName;
  }

  // Consume attributes in a tag
  consumeAttributes() {
    const attributes = [];
    while (this.position < this.html.length && this.html[this.position] !== '>') {
      this.skipWhitespace();
      if (this.html[this.position] === '/' || this.html[this.position] === '>') break;
      attributes.push(this.consumeAttribute());
    }
    return attributes;
  }

  // Consume a single attribute in a tag
  consumeAttribute() {
    const name = this.consumeAttributeName();
    this.position++; // Skip the "="

    const value = this.html[this.position] === '"' ? this.consumeQuotedAttributeValue() : '';
    return { name, value };
  }

  // Consume attribute name
  consumeAttributeName() {
    let name = '';
    while (/[a-zA-Z0-9-]/.test(this.html[this.position])) {
      name += this.html[this.position];
      this.position++;
    }
    return name;
  }

  // Consume quoted attribute value
  consumeQuotedAttributeValue() {
    let value = '';
    this.position++; // Skip the opening quote
    while (this.html[this.position] !== '"') {
      value += this.html[this.position];
      this.position++;
    }
    this.position++; // Skip the closing quote
    return value;
  }

  // Consume text content until the next tag
  consumeText() {
    const text = this.consumeUntil('<', false);
    return { type: TOKEN_TYPES.TEXT, value: text };
  }

  // Helper to consume until a specified string
  consumeUntil(target, consumeTarget = true) {
    let result = '';
    while (this.position < this.html.length && !this.html.startsWith(target, this.position)) {
      result += this.html[this.position];
      this.position++;
    }
    if (consumeTarget) this.position += target.length;
    return result;
  }
}

export { HTMLTokenizer, TOKEN_TYPES };
