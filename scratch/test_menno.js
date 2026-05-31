async function test() {
  const mennoVendor = '1066';
  try {
    const shopRes = await fetch(`https://api.menno.pro/shops/${mennoVendor}`);
    console.log('Shop Status:', shopRes.status);
    const shopText = await shopRes.text();
    console.log('Shop Response (first 200 chars):', shopText.substring(0, 200));
    
    const menuRes = await fetch(`https://api.menno.pro/menus/${mennoVendor}`);
    console.log('Menu Status:', menuRes.status);
    const menuText = await menuRes.text();
    console.log('Menu Response (first 200 chars):', menuText.substring(0, 200));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
