const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = `
function MyWidget() {
  const [state, setState] = useState(0);
  return <Text>hello</Text>;
}
`;

const ast = parser.parse(code, { plugins: ['jsx', 'typescript'] });
traverse(ast, {
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name.startsWith('use')) {
      console.log('Found hook!', path.node.callee.name);
    }
  }
});
