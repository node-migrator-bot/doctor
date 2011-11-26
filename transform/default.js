var rules = [];

rules.push({
  match: function (node) {
    return typeof node.comments !== 'undefined' && node.comments.length > 0;
  },
  transform: function (node) {
    var comments = node.comments;
    var lastComment = comments[comments.length - 1];
    var commentText = "";

    comments.forEach(function (comment, i) {
      var text;
      if (comment.indexOf('/*') === 0) {
        text = '  ' + comment.substr(2, comment.length - 4);
        text = text.replace(/^[\s\*]*(\r\n|\n|\r)/, '');
        text = text.replace(/(\r\n|\n|\r)[\s\*]*$/, '');
        var lines = text.split(/(\r\n|\n|\r)/);
        lines.forEach(function (line, i) {
          var padMatch = line.match(/^\s*\*/);
          if (padMatch) {
            lines[i] = padMatch[0].replace(/\*/g, ' ') + line.replace(/^\s*\*/, '');
          }
        });
        text = lines.join('\n');
      } else {
        text = '  ' + comment.substr(2);
      }
      if (commentText !== '') {
        text = '\n' + text;
      }
      commentText += text;
    });

    var lines = commentText.split(/\n/);

    var indent = -1;
    var i;
    for (i = 0; i < lines.length; i++) {
      var padMatch = lines[i].match(/^\s*/);
      if (padMatch[0].length === 0) {
        indent = 0;
        break;
      }
      if (indent < 0 || padMatch[0].length < indent) {
        indent = padMatch[0].length;
      }
    }
    if (indent > 0) {
      lines.forEach(function (line, i) {
        lines[i] = line.replace(new RegExp('^\\s{0,' + indent + '}'), '');
      });
    }

    node.commentText = lines.join('\n');
  }
});

rules.push({
  match: function (node) {
    return typeof node.commentText === 'string' && node.commentText !== '';
  },
  transform: function (node, transform) {
    var tags = transform.options.commentParser.parse(node.commentText);
    node.commentTags = tags;
  }
});

rules.push({
  type: 'define-function',
  transform: function (node) {
    var nameNode = node.nodes[0];
    var paramsNodes = node.nodes[1] ? node.nodes[1].nodes : [];
    node.name = nameNode.value;
    node.params = [];
    paramsNodes.forEach(function (paramNode, i) {
      node.params.push(paramNode.value);
    });
  }
});

module.exports = rules;