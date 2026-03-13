const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const resetIndex = html.indexOf('reset-btn');
const section = html.substring(resetIndex, resetIndex + 150);
console.log('Reset button HTML:');
console.log(section);
console.log('\nContains "disabled":', section.includes('disabled'));
