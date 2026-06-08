const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/aadhaar-ocr');
  const schema = new mongoose.Schema({}, { strict: false });
  const Aadhaar = mongoose.model('Aadhaar', schema, 'aadhaars');
  const doc = await Aadhaar.findOne().sort({ createdAt: -1 });

  const rawTextBack = doc.get('rawTextBack');
  const pincode = doc.get('pincode');

  console.log('=== CURRENT ADDRESS IN DB ===');
  console.log(doc.get('address'));
  console.log('\n=== RAW BACK TEXT ===');
  console.log(rawTextBack);

  const sanitise = (l) => l.replace(/[|\\<>~^*_]/g, '').trim();
  const extractEnglish = (s) => s.replace(/[\u0D00-\u0D7F]/g, ' ').replace(/\s+/g, ' ').trim();

  const rawBackLines = rawTextBack.split('\n').map(sanitise).filter(l => l.length > 0);
  const engBackLines = rawBackLines.map(extractEnglish).filter(l => l.length > 1);

  console.log('\n=== RAW BACK LINES ===');
  rawBackLines.forEach((l, i) => console.log(`[${i}] "${l}"`));

  console.log('\n=== ENGLISH-EXTRACTED BACK LINES ===');
  engBackLines.forEach((l, i) => console.log(`[${i}] "${l}"`));

  await mongoose.disconnect();
}

run().catch(console.error);
