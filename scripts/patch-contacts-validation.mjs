import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ContactsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── چک قبلی ───
if (src.includes('validateMobile')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// ─── import ───
if (!src.includes('lib/validation')) {
  if (src.includes("import { notify } from '../../lib/toast';")) {
    src = src.replace(
      "import { notify } from '../../lib/toast';",
      "import { notify } from '../../lib/toast';\nimport { validateMobile, validatePhone, validateEmail, validateNationalId, validatePostalCode } from '../../lib/validation';"
    );
    log.push('  ✅ import');
  } else {
    log.push('  ⚠️ import anchor پیدا نشد');
  }
}

// ─── save ───
const saveRegex = /const save\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\};/;
const match = src.match(saveRegex);

if (match) {
  const newSave = `const save = () => {
    // اعتبارسنجی
    if (!editing.name?.trim()) {
      notify.warning('نام الزامی است');
      return;
    }
    const mobileCheck = validateMobile(editing.mobile || '');
    if (!mobileCheck.valid) {
      notify.warning(mobileCheck.error || 'موبایل نامعتبر');
      return;
    }
    const phoneCheck = validatePhone(editing.phone || '');
    if (!phoneCheck.valid) {
      notify.warning(phoneCheck.error || 'تلفن نامعتبر');
      return;
    }
    const emailCheck = validateEmail(editing.email || '');
    if (!emailCheck.valid) {
      notify.warning(emailCheck.error || 'ایمیل نامعتبر');
      return;
    }
    const nationalCheck = validateNationalId(editing.nationalId || '');
    if (!nationalCheck.valid) {
      notify.warning(nationalCheck.error || 'کد ملی نامعتبر');
      return;
    }
    const normalized = {
      ...editing,
      mobile: mobileCheck.normalized || editing.mobile,
      phone: phoneCheck.normalized || editing.phone,
      email: emailCheck.normalized || editing.email,
    };
    setItems(prev => prev.find(c => c.id === normalized.id)
      ? prev.map(c => c.id === normalized.id ? normalized : c)
      : [...prev, normalized]);
    setShowForm(false);
  };`;
  src = src.replace(match[0], newSave);
  log.push('  ✅ save با اعتبارسنجی');
} else {
  log.push('  ❌ save پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
