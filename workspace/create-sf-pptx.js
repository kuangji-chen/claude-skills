const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/kchen/.claude/plugins/cache/anthropic-agent-skills/example-skills/69c0b1a06741/skills/pptx/scripts/html2pptx.js');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'San Francisco';
    pptx.author = 'Claude';

    // Slide 1: Title
    await html2pptx('/Users/kchen/Documents/skills/workspace/sf-slide1.html', pptx);

    // Slide 2: What Makes SF Great
    await html2pptx('/Users/kchen/Documents/skills/workspace/sf-slide2.html', pptx);

    // Slide 3: Closing
    await html2pptx('/Users/kchen/Documents/skills/workspace/sf-slide3.html', pptx);

    await pptx.writeFile({ fileName: '/Users/kchen/Documents/skills/workspace/san-francisco.pptx' });
    console.log('Presentation created: san-francisco.pptx');
}

createPresentation().catch(console.error);
