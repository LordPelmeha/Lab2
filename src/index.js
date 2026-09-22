if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}

function setup() {
    document.getElementById('diffButton').onclick = runDiff;
}

function runDiff() {
    const expr = document.getElementById('expressionInput').value;
    const variable = document.getElementById('variableInput').value;
    const resultDiv = document.getElementById('result');

    console.log('runDiff called', { expr, variable });

    try {
        const maple = new window.MiniMaple();
        const result = maple.diff(expr, variable);
        console.log('diff result', result);
        resultDiv.textContent = result;
    } catch (e) {
        console.error('diff error', e);
        resultDiv.textContent = 'Error: ' + e.message;
    }
}
