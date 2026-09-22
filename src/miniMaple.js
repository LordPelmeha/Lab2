class MiniMaple {

  diff(expression, variable) {
    const tokens = this.tokenize(expression);
    const ast = this.parse(tokens);
    const derivative = this.differentiate(ast, variable);
    const simplified = this.simplify(derivative);
    return this.stringify(simplified);
  }

  tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      if (/[+\-*^()]/.test(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
      } else if (/\d/.test(ch)) {
        let num = '';
        while (i < expr.length && /\d/.test(expr[i])) {
          num += expr[i++];
        }
        tokens.push({ type: 'number', value: parseInt(num, 10) });
      } else if (/[a-zA-Z]/.test(ch)) {
        tokens.push({ type: 'variable', name: ch });
        i++;
      } else {
        throw new Error(`Unexpected character: ${ch}`);
      }
    }
    tokens.push({ type: 'eof' });
    return tokens;
  }

  parse(tokens) {
    const parser = new Parser(tokens);
    return parser.parse();
  }

  differentiate(ast, variable) {
    if (ast.type === 'number') {
      return { type: 'number', value: 0 };
    }
    if (ast.type === 'variable') {
      return { type: 'number', value: ast.name === variable ? 1 : 0 };
    }
    if (ast.type === 'binary') {
      switch (ast.op) {
        case '+':
          return {
            type: 'binary', op: '+',
            left: this.differentiate(ast.left, variable),
            right: this.differentiate(ast.right, variable)
          };
        case '-':
          return {
            type: 'binary', op: '-',
            left: this.differentiate(ast.left, variable),
            right: this.differentiate(ast.right, variable)
          };
        case '*':
          return {
            type: 'binary', op: '+',
            left: {
              type: 'binary', op: '*',
              left: this.differentiate(ast.left, variable),
              right: ast.right
            },
            right: {
              type: 'binary', op: '*',
              left: ast.left,
              right: this.differentiate(ast.right, variable)
            }
          };
        case '^': {
          const leftDeriv = this.differentiate(ast.left, variable);
          const right = ast.right;
          const left = ast.left;

          if (right.type === 'number') {
            if (right.value === 0) {
              return { type: 'number', value: 0 };
            }
            if (right.value === 1) {
              return leftDeriv;
            }
            if (left.type === 'number') {
              return { type: 'number', value: 0 };
            }
            const newExp = { type: 'number', value: right.value - 1 };
            const basePowNminus1 = { type: 'binary', op: '^', left, right: newExp };
            return {
              type: 'binary', op: '*',
              left: {
                type: 'binary', op: '*',
                left: { type: 'number', value: right.value },
                right: basePowNminus1
              },
              right: leftDeriv
            };
          }

          if (left.type === 'number') {
            return { type: 'number', value: 0 };
          }

          throw new Error('Power rule with non-constant exponent is not supported');
        }
        default:
          throw new Error(`Unsupported operation: ${ast.op}`);
      }
    }
    throw new Error('Unknown AST node type');
  }

  simplify(node) {
    if (node.type === 'number' || node.type === 'variable') return node;

    const left = this.simplify(node.left);
    const right = this.simplify(node.right);

    switch (node.op) {
      case '+': {
        if (left.type === 'number' && right.type === 'number') {
          return { type: 'number', value: left.value + right.value };
        }
        if (right.type === 'number' && right.value === 0) return left;
        if (left.type === 'number' && left.value === 0) return right;
        return { type: 'binary', op: '+', left, right };
      }
      case '-': {
        if (left.type === 'number' && right.type === 'number') {
          return { type: 'number', value: left.value - right.value };
        }
        if (right.type === 'number' && right.value === 0) return left;
        return { type: 'binary', op: '-', left, right };
      }
      case '*': {
        if (left.type === 'number' && right.type === 'number') {
          return { type: 'number', value: left.value * right.value };
        }

        let coef = 1;
        const parts = [];

        const collect = (n) => {
          if (n.type === 'number') {
            coef *= n.value;
          } else if (n.type === 'binary' && n.op === '*') {
            collect(n.left);
            collect(n.right);
          } else {
            parts.push(n);
          }
        };

        collect(left);
        collect(right);

        if (coef === 0) return { type: 'number', value: 0 };

        let result;
        if (parts.length === 0) {
          result = { type: 'number', value: coef };
        } else {
          result = parts[0];
          for (let i = 1; i < parts.length; i++) {
            result = { type: 'binary', op: '*', left: result, right: parts[i] };
          }
          if (coef !== 1) {
            result = { type: 'binary', op: '*', left: { type: 'number', value: coef }, right: result };
          }
        }

        return result;
      }
      case '^': {
        if (right.type === 'number') {
          if (right.value === 0) return { type: 'number', value: 1 };
          if (right.value === 1) return left;
          if (left.type === 'number') {
            return { type: 'number', value: Math.pow(left.value, right.value) };
          }
        }
        return { type: 'binary', op: '^', left, right };
      }
    }
  }

  stringify(node) {
    if (node.type === 'number') return String(node.value);
    if (node.type === 'variable') return node.name;

    const left = this.stringify(node.left);
    const right = this.stringify(node.right);

    switch (node.op) {
      case '+':
        if (node.left.type === 'number' && node.left.value === 0) return right;
        if (node.right.type === 'number' && node.right.value === 0) return left;
        return `${left}+${right}`;
      case '-':
        if (node.right.type === 'number' && node.right.value === 0) return left;
        if (node.left.type === 'number' && node.left.value === 0) return `-${right}`;
        return `${left}-${right}`;
      case '*':
        if (node.left.type === 'number' && node.left.value === 0) return '0';
        if (node.right.type === 'number' && node.right.value === 0) return '0';
        if (node.left.type === 'number' && node.left.value === 1) return right;
        if (node.right.type === 'number' && node.right.value === 1) return left;
        return `${left}*${right}`;
      case '^':
        if (node.right.type === 'number' && node.right.value === 1) return left;
        if (node.right.type === 'number' && node.right.value === 0) return '1';
        return `${left}^${right}`;
    }
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume() {
    return this.tokens[this.pos++];
  }

  parse() {
    const result = this.parseExpr();
    if (this.peek().type !== 'eof') {
      throw new Error('Unexpected token at end of expression');
    }
    return result;
  }

  parseExpr() {
    let left = this.parseTerm();
    while (this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = { type: 'binary', op: op, left, right };
    }
    return left;
  }

  parseTerm() {
    let left = this.parseFactor();
    while (this.peek().type === 'op' && this.peek().value === '*') {
      this.consume();
      const right = this.parseFactor();
      left = { type: 'binary', op: '*', left, right };
    }
    while (
      this.peek().type === 'number' ||
      this.peek().type === 'variable' ||
      (this.peek().type === 'op' && this.peek().value === '(')
    ) {
      const right = this.parseFactor();
      left = { type: 'binary', op: '*', left, right };
    }
    return left;
  }

  parseFactor() {
    if (this.peek().type === 'op' && this.peek().value === '-') {
      this.consume();
      const expr = this.parseFactor();
      return { type: 'binary', op: '-', left: { type: 'number', value: 0 }, right: expr };
    }
    if (this.peek().type === 'op' && this.peek().value === '+') {
      this.consume();
      return this.parseFactor();
    }
    const primary = this.parsePrimary();
    if (this.peek().type === 'op' && this.peek().value === '^') {
      this.consume();
      const right = this.parseFactor();
      return { type: 'binary', op: '^', left: primary, right };
    }
    return primary;
  }

  parsePrimary() {
    const token = this.peek();
    if (token.type === 'number') {
      this.consume();
      return { type: 'number', value: token.value };
    }
    if (token.type === 'variable') {
      this.consume();
      return { type: 'variable', name: token.name };
    }
    if (token.type === 'op' && token.value === '(') {
      this.consume();
      const expr = this.parseExpr();
      if (this.peek().type !== 'op' || this.peek().value !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.consume();
      return expr;
    }
    throw new Error(`Unexpected token: ${token.type}`);
  }
}

if (typeof window !== 'undefined') {
  window.MiniMaple = MiniMaple;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MiniMaple };
}
