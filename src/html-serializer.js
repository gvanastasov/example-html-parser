class HTMLSerializer {
    serialize(node) {
        if (node.type === 'text') {
          return node.value;
        } else if (node.type === 'element') {
          let tag = `<${node.tagName}`;
          node.attributes.forEach(attr => {
            tag += ` ${attr.name}="${attr.value}"`;
          });
          tag += '>';
          node.children.forEach(child => {
            tag += serialize(child);
          });
          tag += `</${node.tagName}>`;
          return tag;
        } else if (node.type === 'comment') {
          return `<!-- ${node.value} -->`;
        }
        return '';
      }
} 
  
export default HTMLSerializer;