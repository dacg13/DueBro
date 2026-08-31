async function testRoutes() {
  const routes = [
    '/today',
    '/calendar',
    '/workload',
    '/analytics',
    '/deadlines',
    '/subjects',
    '/inbox',
    '/settings'
  ];

  console.log('Testing DueBro HTTP Routes on http://localhost:3000:\n');

  for (const r of routes) {
    const url = `http://localhost:3000${r}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      const hasContent = text.includes('DueBro') || text.includes('html') || text.length > 500;
      console.log(`✅ [${res.status}] ${r.padEnd(12)} - ${text.length} bytes (Valid: ${hasContent})`);
    } catch (err) {
      console.error(`❌ [FAIL] ${r.padEnd(12)} - ${err.message}`);
    }
  }
}

testRoutes();
