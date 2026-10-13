// Portfolio visitor card: appends each submission to this Sheet and emails Akhil.
// Deployed as a web app: Execute as Me, Who has access: Anyone.
//
// On/off switch: pick turnOff (or turnOn) in the function menu above and press Run.
// While off, the card disappears from the site and submissions are ignored.
//
// Bot check: each visitor's browser solves a small proof-of-work puzzle (~1-3 s, done
// while they type). Puzzles are signed by this script, expire after 15 minutes, and
// can be used once. Plus a hidden honeypot field and a hard cap of 50 notes a day.
const NOTIFY = 'akhilvallalajs@gmail.com';
const DAILY_MAX = 50;
const BITS = 18;                 // puzzle difficulty: leading zero bits in SHA-256(salt + nonce)
const MAX_AGE_MS = 15 * 60 * 1000;
const REASONS = ['Hiring', 'Want to build something', 'Just looking'];

function turnOff() { PropertiesService.getScriptProperties().setProperty('ENABLED', 'false'); }
function turnOn() { PropertiesService.getScriptProperties().setProperty('ENABLED', 'true'); }
function enabled_() { return PropertiesService.getScriptProperties().getProperty('ENABLED') !== 'false'; }

// GET: is the card on, plus a fresh signed puzzle.
function doGet() {
  if (!enabled_()) return reply_({ enabled: false });
  const salt = Utilities.getUuid().replace(/-/g, '');
  const ts = String(Date.now());
  return reply_({ enabled: true, salt: salt, ts: ts, bits: BITS, sig: sign_(salt + '.' + ts + '.' + BITS) });
}

function doPost(e) {
  try {
    if (!enabled_()) return reply_({ ok: false });
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return reply_({ ok: true }); // honeypot field filled: a bot
    if (!validProof_(d.pow)) return reply_({ ok: false });

    const email = clean_(d.email, 150);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply_({ ok: false });
    const name = clean_(d.name, 100);
    const reason = REASONS.indexOf(d.reason) >= 0 ? d.reason : 'Other';
    const note = clean_(d.note, 1000);

    const props = PropertiesService.getScriptProperties();
    const key = 'n_' + Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
    const n = Number(props.getProperty(key) || 0);
    if (n >= DAILY_MAX) return reply_({ ok: false });
    props.setProperty(key, String(n + 1));

    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
      .appendRow([new Date(), safe_(name), safe_(email), reason, safe_(note)]);
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: 'Portfolio visitor: ' + reason + (name ? ' (' + name + ')' : ''),
      body: 'Name: ' + (name || '-') + '\nEmail: ' + email + '\nReason: ' + reason +
            '\n\n' + (note || '(no note)') + '\n\nReply to this email to answer them directly.'
    });
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false });
  }
}

function validProof_(p) {
  if (!p || typeof p.salt !== 'string' || typeof p.ts !== 'string' || p.bits !== BITS) return false;
  if (sign_(p.salt + '.' + p.ts + '.' + p.bits) !== p.sig) return false;        // issued by this script
  const age = Date.now() - Number(p.ts);
  if (!(age >= 0 && age < MAX_AGE_MS)) return false;                           // not expired
  const cache = CacheService.getScriptCache();
  if (cache.get('used_' + p.salt)) return false;                                // single use
  const h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, p.salt + String(p.nonce), Utilities.Charset.UTF_8);
  if (!leadingZeroBits_(h, BITS)) return false;                                 // puzzle solved
  cache.put('used_' + p.salt, '1', 1800);
  return true;
}

function leadingZeroBits_(bytes, bits) {
  for (let i = 0; i < bits; i++) {
    const b = (bytes[i >> 3] + 256) % 256;
    if (b & (0x80 >> (i & 7))) return false;
  }
  return true;
}

function sign_(text) {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('POW_SECRET');
  if (!secret) { secret = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('POW_SECRET', secret); }
  return Utilities.computeHmacSha256Signature(text, secret)
    .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

function clean_(v, max) { return String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max); }
// Stop spreadsheet formula injection: a cell starting with = + - @ would run as a formula.
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
