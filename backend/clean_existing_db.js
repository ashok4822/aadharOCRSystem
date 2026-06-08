const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aadhaar-ocr';

const consonantsMap = {
  'ക': 'k', 'ഖ': 'kh', 'ഗ': 'g', 'ഘ': 'gh', 'ങ': 'ng',
  'ച': 'ch', 'ഛ': 'chh', 'ജ': 'j', 'ഝ': 'jh', 'ഞ': 'ny',
  'ട': 't', 'ഠ': 'th', 'ഡ': 'd', 'ഢ': 'dh', 'ണ': 'n',
  'ത': 'th', 'ഥ': 'th', 'ദ': 'd', 'ധ': 'dh', 'ന': 'n',
  'പ': 'p', 'ഫ': 'ph', 'ബ': 'b', 'ഭ': 'bh', 'മ': 'm',
  'യ': 'y', 'ര': 'r', 'ല': 'l', 'വ': 'v',
  'ശ': 'sh', 'ഷ': 'sh', 'സ': 's', 'ഹ': 'h',
  'ള': 'l', 'ഴ': 'zh', 'റ': 'r'
};

const vowelSignsMap = {
  'ാ': 'a', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
  'ൃ': 'ri', 'െ': 'e', 'േ': 'e', 'ൈ': 'ai', 'ൊ': 'o',
  'ോ': 'o', 'ൌ': 'au'
};

const vowelsMap = {
  'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
  'ഋ': 'ri', 'എ': 'e', 'ഏ': 'e', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'o',
  'ഔ': 'au'
};

const chillusMap = {
  'ൽ': 'l', 'ൻ': 'n', 'ർ': 'r', 'ൺ': 'n', 'ൾ': 'l', 'ൿ': 'k',
  '൯': 'n',
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '0': '0'
};

const conjunctsList = [
  { string: 'ണ്ട', value: 'nd' }, // ണ + ് + ട
  { string: 'ന്ത', value: 'nth' }, // ന + ് + ത
  { string: 'മ്പ', value: 'mb' },  // മ + ് + പ
  { string: 'ഞ്ച', value: 'nj' },  // ഞ + ് + ച
  { string: 'ങ്ക', value: 'ng' },  // ങ + ് + ക
  { string: 'ണ്ണ', value: 'nn' },  // ണ + ് + ണ
  { string: 'ന്ന', value: 'nn' },  // ന + ് + ന
  { string: 'മ്മ', value: 'mm' },  // മ + ് + മ
  { string: 'ല്ല', value: 'll' },  // ല + ് + ല
  { string: 'ള്ള', value: 'll' },  // ള + ് + ള
  { string: 'ച്ച', value: 'ch' },  // ച + ് + ച
  { string: 'ക്ക', value: 'kk' },  // ക + ് + ക
  { string: 'പ്പ', value: 'pp' },  // പ + ് + പ
  { string: 'ത്ത', value: 'th' },  // ത + ് + ത
  { string: 'റ്റ', value: 'tt' }   // റ + ് + റ
];

function transliterateMalayalam(text) {
  let cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  let result = '';
  let i = 0;

  while (i < cleanText.length) {
    let matchedConjunct = null;
    for (const c of conjunctsList) {
      if (cleanText.startsWith(c.string, i)) {
        matchedConjunct = c;
        break;
      }
    }

    if (matchedConjunct) {
      const len = matchedConjunct.string.length;
      const nextChar = cleanText[i + len];
      if (vowelSignsMap[nextChar]) {
        result += matchedConjunct.value + vowelSignsMap[nextChar];
        i += len + 1;
      } else if (nextChar === '്') {
        result += matchedConjunct.value;
        i += len + 1;
      } else {
        result += matchedConjunct.value + 'a';
        i += len;
      }
      continue;
    }

    const char = cleanText[i];

    if (vowelsMap[char]) {
      result += vowelsMap[char];
      i++;
      continue;
    }

    if (chillusMap[char]) {
      result += chillusMap[char];
      i++;
      continue;
    }

    if (char === 'ം') {
      result += 'm';
      i++;
      continue;
    }

    if (char === 'ഃ') {
      result += 'h';
      i++;
      continue;
    }

    if (consonantsMap[char]) {
      const nextChar = cleanText[i + 1];
      if (nextChar === '്') {
        result += consonantsMap[char];
        i += 2;
      } else if (vowelSignsMap[nextChar]) {
        result += consonantsMap[char] + vowelSignsMap[nextChar];
        i += 2;
      } else {
        result += consonantsMap[char] + 'a';
        i++;
      }
      continue;
    }

    result += char;
    i++;
  }
  return result;
}

function levenshteinDist(a, b) {
  const tmp = [];
  let i, j, alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[alen][blen];
}

function isSimilarWord(w1, w2) {
  w1 = w1.toLowerCase().replace(/shri/g, 'sree').replace(/sri/g, 'sree');
  w2 = w2.toLowerCase().replace(/shri/g, 'sree').replace(/sri/g, 'sree');
  if (w1 === w2) return true;

  const norm = (w) => w
    .replace(/k/g, 'c')
    .replace(/h/g, '')
    .replace(/y/g, 'i')
    .replace(/v/g, 'w')
    .replace(/t$/g, '')
    .replace(/d$/g, '')
    .replace(/de$/g, '')
    .replace(/e/g, 'a');

  if (norm(w1) === norm(w2)) return true;

  if (w1.length > 4 && w2.length > 4) {
    const dist = levenshteinDist(w1, w2);
    if (dist <= 2) return true;
  }
  return false;
}

function cleanAddressLine(line) {
  let clean = line.replace(/[\u200B-\u200D\uFEFF]/g, '');
  clean = clean.replace(/^[^a-zA-Z0-9#]+/, '');
  clean = clean.replace(/[^a-zA-Z0-9)]+$/, '');
  return clean.trim();
}

const sanitise = (l) => l.replace(/[|\\<>~^*_]/g, '').trim();

function parseAddressFromRaw(rawTextBack, pincode) {
  if (!rawTextBack) return 'Not Found';

  const transliteratedBack = transliterateMalayalam(rawTextBack);
  const rawBackLines = transliteratedBack.split('\n').map(sanitise).filter(l => l.length > 0);

  const backHeaderNoise = [
    'unique identification authority', 'uidai', 'govt of india',
    'government of india', 'toll free', 'helpline', 'www.',
    'enrolment', 'enrollment', 'my aadhaar', 'mera aadhaar',
    'valid anywhere in india', '1800 180 1947', 'bengaluru',
  ];

  const isAddressNoise = (l) =>
    l.length < 4 ||
    backHeaderNoise.some(n => l.toLowerCase().includes(n)) ||
    /^\d{4}\s\d{4}\s\d{4}$/.test(l);

  const addrCandidates = rawBackLines.filter(l => !isAddressNoise(l));

  let joinedLines = '';
  const addrLabelRe = /(?:^|\s)(?:address|add\.?)[:\s]*/i;
  const addrLabelIdx = addrCandidates.findIndex(l => addrLabelRe.test(l));

  if (addrLabelIdx !== -1) {
    const firstLine = addrCandidates[addrLabelIdx];
    const match = firstLine.match(addrLabelRe);
    let firstPart = '';
    if (match && match.index !== undefined) {
      firstPart = firstLine.substring(match.index + match[0].length).trim();
    } else {
      firstPart = firstLine.replace(addrLabelRe, ' ').trim();
    }
    
    const parts = [];
    const cleanedFirst = cleanAddressLine(firstPart);
    if (cleanedFirst.length > 0) parts.push(cleanedFirst);

    for (let i = addrLabelIdx + 1; i < addrCandidates.length; i++) {
      const l = addrCandidates[i];
      if (isAddressNoise(l)) continue;
      const cleaned = cleanAddressLine(l);
      if (cleaned.length > 0) parts.push(cleaned);
      if (pincode && pincode !== 'Not Found' && l.includes(pincode)) break;
      if (parts.length >= 8) break;
    }

    joinedLines = parts.join(', ');
  } else {
    const parts = [];
    for (const l of addrCandidates) {
      const cleaned = cleanAddressLine(l);
      if (cleaned.length > 0) parts.push(cleaned);
      if (pincode && pincode !== 'Not Found' && l.includes(pincode)) break;
      if (parts.length >= 8) break;
    }
    joinedLines = parts.join(', ');
  }

  const rawWords = joinedLines.split(/[\s,]+/);

  const noiseWords = new Set([
    'ksham', 'ozhu', 'ukashmumumalu', 'kashmumumalu', 'shalam', 'rl', 'lu', '8',
    'melvilasam', 'address', 'add', 'aflonjmbeads', 'olla', 'axmlena',
    'loumma®0', 'caer', 'ieee', 'augbmo', 'bddno', 'pi.o', 'po', 'po.'
  ]);

  let careOf = '';
  let detectedPincode = '';
  let detectedState = '';
  let detectedDistrict = '';
  let postOfficeName = '';

  const cleanWord = (w) => w.replace(/^[^a-zA-Z0-9#]+/, '').replace(/[^a-zA-Z0-9).:]+$/, '');

  // 1. Care Of
  const careOfMatch = joinedLines.match(/\b([swd]\/[o])\s*[:\s-]*\s*([a-z]+)/i);
  if (careOfMatch) {
    careOf = `${careOfMatch[1].toUpperCase()}: ${careOfMatch[2].charAt(0).toUpperCase() + careOfMatch[2].slice(1).toLowerCase()}`;
  }

  // 2. Pincode
  if (pincode && pincode !== 'Not Found') {
    detectedPincode = pincode;
  } else {
    const pinMatch = joinedLines.match(/(?<!\d)([1-9]\d{5})(?!\d)/);
    if (pinMatch) detectedPincode = pinMatch[1];
  }

  // 3. State & District
  const stateKeywords = ['kerala', 'kerela'];
  const distKeywords = ['thiruvananthapuram', 'trivandrum'];

  // 4. Post Office
  const poIndex = rawWords.findIndex(w => /^p\.o\.?$/i.test(cleanWord(w)) || /^pi\.o$/i.test(cleanWord(w)) || /^po$/i.test(cleanWord(w)));
  if (poIndex !== -1 && poIndex > 0) {
    const preWord = cleanWord(rawWords[poIndex - 1]);
    if (preWord.length > 2 && !noiseWords.has(preWord.toLowerCase())) {
      postOfficeName = preWord.charAt(0).toUpperCase() + preWord.slice(1).toLowerCase() + ' P.O.';
    }
  }

  if (postOfficeName) {
    const poBase = postOfficeName.split(' ')[0];
    for (const rw of rawWords) {
      const w = cleanWord(rw);
      if (w.toLowerCase() !== poBase.toLowerCase() && isSimilarWord(w, poBase)) {
        if (w.toLowerCase().endsWith('code') || w.length > poBase.length) {
          postOfficeName = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() + ' P.O.';
          break;
        }
      }
    }
  }

  const middleWords = [];
  const processedWords = [];

  for (const rawWord of rawWords) {
    let word = cleanWord(rawWord);
    if (word.length <= 1) continue;

    if (/^[a-z]+$/.test(word.toLowerCase())) {
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (word.toLowerCase() === 'shri') word = 'Sree';
    if (word.toLowerCase() === 'sri') word = 'Sree';

    const lowerWord = word.toLowerCase();

    if (noiseWords.has(lowerWord)) continue;
    if (careOf && careOf.toLowerCase().includes(lowerWord)) continue;
    if (detectedPincode && lowerWord.includes(detectedPincode)) continue;

    if (stateKeywords.includes(lowerWord)) {
      detectedState = 'Kerala';
      continue;
    }

    if (distKeywords.includes(lowerWord)) {
      detectedDistrict = 'Thiruvananthapuram';
      continue;
    }

    if (postOfficeName && postOfficeName.toLowerCase().includes(lowerWord)) continue;

    let isDup = false;
    for (const existing of processedWords) {
      if (isSimilarWord(existing, word)) {
        isDup = true;
        break;
      }
    }
    if (isDup) continue;

    processedWords.push(word);
    middleWords.push(word);
  }

  const finalParts = [];
  
  // Combine careOf and the first middle word with a space if both exist
  let careOfAndFirst = '';
  let startIdx = 0;
  if (careOf) {
    careOfAndFirst = careOf;
    if (middleWords.length > 0) {
      careOfAndFirst += ' ' + middleWords[0];
      startIdx = 1;
    }
    finalParts.push(careOfAndFirst);
  } else if (middleWords.length > 0) {
    finalParts.push(middleWords[0]);
    startIdx = 1;
  }
  
  let middleAddress = '';
  for (let idx = startIdx; idx < middleWords.length; idx++) {
    const w = middleWords[idx];
    if (middleAddress.length > 0) {
      const prevWord = middleWords[idx - 1].toLowerCase();
      if (['sree', 'sri', 'shree'].includes(prevWord)) {
        middleAddress += ' ' + w;
      } else {
        middleAddress += ', ' + w;
      }
    } else {
      middleAddress += w;
    }
  }

  if (middleAddress.length > 0) {
    middleAddress.split(', ').forEach(part => {
      finalParts.push(part);
    });
  }

  if (postOfficeName) {
    const poBase = postOfficeName.split(' ')[0].toLowerCase();
    const cleanFinalParts = finalParts.filter(p => {
      if (p === careOf) return true;
      return !isSimilarWord(p, poBase);
    });
    finalParts.length = 0;
    cleanFinalParts.forEach(p => finalParts.push(p));

    finalParts.push(postOfficeName);
  }

  if (detectedDistrict) finalParts.push(detectedDistrict);
  if (detectedState) finalParts.push(detectedState);
  if (detectedPincode) finalParts.push(detectedPincode);

  return finalParts.join(', ');
}

async function cleanDatabase() {
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected successfully!');

  const schema = new mongoose.Schema({}, { strict: false });
  const Aadhaar = mongoose.model('Aadhaar', schema, 'aadhaars');

  const records = await Aadhaar.find();
  console.log(`Found ${records.length} records to inspect.`);

  let updatedCount = 0;
  for (const doc of records) {
    const rawTextBack = doc.get('rawTextBack');
    const pincode = doc.get('pincode');
    const oldAddress = doc.get('address');

    if (!rawTextBack) {
      console.log(`Record ${doc._id} has no rawTextBack. Skipping.`);
      continue;
    }

    const newAddress = parseAddressFromRaw(rawTextBack, pincode);
    if (newAddress !== oldAddress) {
      console.log(`Updating Record ID: ${doc._id} (${doc.get('name')})`);
      console.log(`  Old Address: "${oldAddress}"`);
      console.log(`  New Address: "${newAddress}"`);
      doc.set('address', newAddress);
      await doc.save();
      updatedCount++;
    } else {
      console.log(`Record ID: ${doc._id} already matches new format.`);
    }
  }

  console.log(`Database cleanup completed. Updated ${updatedCount} records.`);
  await mongoose.disconnect();
}

cleanDatabase().catch(err => {
  console.error('Error cleaning database:', err);
  process.exit(1);
});
