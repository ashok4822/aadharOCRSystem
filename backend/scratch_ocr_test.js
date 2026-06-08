const { createWorker } = require('tesseract.js');
const path = require('path');

async function testOCR() {
  const filePath = path.join(__dirname, 'uploads', 'frontImage-1780816929951-472491217.jpg');
  console.log('Testing OCR on:', filePath);

  try {
    console.log('\n--- Running eng+mal ---');
    const workerEngMal = await createWorker('eng+mal');
    const resEngMal = await workerEngMal.recognize(filePath);
    console.log('Result (eng+mal):');
    console.log(resEngMal.data.text);
    await workerEngMal.terminate();

    console.log('\n--- Running eng only ---');
    const workerEng = await createWorker('eng');
    const resEng = await workerEng.recognize(filePath);
    console.log('Result (eng):');
    console.log(resEng.data.text);
    await workerEng.terminate();

  } catch (err) {
    console.error(err);
  }
}

testOCR();
