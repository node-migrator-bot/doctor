/*global suite:false, test:false*/

var peg = require('pegjs');
var fs = require('fs');
var Path = require('path');

var grammar = fs.readFileSync(Path.join(__dirname, '../grammar/comment-tags.pegjs'), 'utf8');
var parser = peg.buildParser(grammar);

var assert = require('chai').assert;

suite('test comment tags');

test('simple returns tag', function () {
  var comment = "@returns description";
  var ast = parser.parse(comment);

  assert.equal(ast.length, 1);

  var tag = ast[0];
  assert.equal(tag.name, 'returns');
  assert.deepEqual(tag.value, { description: 'description'});
});

test('returns tag with type', function () {
  var comment = "@returns {String} description";
  var ast = parser.parse(comment);

  assert.equal(ast.length, 1);

  var tag = ast[0];
  assert.equal(tag.name, 'returns');
  assert.equal(tag.value.description, 'description');
  assert.equal(tag.value.types.length, 1);
  assert.equal(tag.value.types[0], 'String');
});

test('optional param tag', function () {
  var comment = "@param [s='giggly goo'] description";
  var ast = parser.parse(comment);

  assert.equal(ast.length, 1);

  var tag = ast[0];

  assert.ok(tag.value.optional);
  assert.equal(tag.value.defaultValue, "'giggly goo'");
  assert.equal(tag.name, 'param');
  assert.equal(tag.value.name, 's');
  assert.equal(tag.value.description, 'description');
});

test('class and constructor description', function () {
  var comment = "@class class description\n" +
      "@constructor constructor description";

  var ast = parser.parse(comment);
  assert.equal(ast.length, 2);

  var tag = ast[0];

  assert.equal(tag.name, 'classDescription');
  assert.equal(tag.value.description, 'class description');
});

test('properties', function () {
  var comment = "@property propOne property one description\n" +
      "@property {String} propTwo property two description";

  var ast = parser.parse(comment);
  assert.equal(ast.length, 2);

  var prop1 = ast[0];
  assert.equal(prop1.name, 'property');
  assert.equal(prop1.value.name, 'propOne');
  assert.equal(prop1.value.description, 'property one description');
  assert.ok(!prop1.types);

  var prop2 = ast[1];
  assert.equal(prop2.name, 'property');
  assert.equal(prop2.value.name, 'propTwo');
  assert.equal(prop2.value.description, 'property two description');
  assert.equal(prop2.value.types.length, 1);
  assert.equal(prop2.value.types[0], 'String');
});

test('example', function () {
  var comment = '@example\n' +
      'var x = 3;\n' +
      'var y = 4;';
  
  var ast = parser.parse(comment);
  assert.equal(ast.length, 1);

  var example = ast[0];
  assert.equal(example.name, 'example');
  assert.equal(example.value, 'var x = 3;\nvar y = 4;');
});

test('visibility', function () {
  var comment = '@public';

  var ast = parser.parse(comment);
  assert.equal(ast.length, 1);
  
  var tag = ast[0];
  assert.equal(tag.name, 'visibility');
  assert.equal(tag.value, 'public');
});

test('extends', function () {
  var comment = '@extends SuperClass';

  var ast = parser.parse(comment);
  assert.equal(ast.length, 1);
  
  var tag = ast[0];
  assert.equal(tag.name, 'extends');
  assert.equal(tag.value, 'SuperClass');
});
