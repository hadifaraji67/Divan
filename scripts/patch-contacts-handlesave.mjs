import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ContactsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── چک قبلی ───
if (src.includes('validateMobile(editing.mobile')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// ─── پیدا کردن handleSave ───
const saveRegex = /const handleSave\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\};/;
const match = src.match(saveRegex);

if (!match) {
  console.log('❌ handleSave پیدا نشد');
  console.log('دنبال الگو: const handleSave = () => { ... }');
  process.exit(1);
}

console.log('متن فعلی handleSave:');
console.log(match[0].slice(0, 300));
console.log('...');

// ─── جایگزینی ───
const newSave = `const handleSave = () => {
    // ─── اعتبارسنجی ───
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

    // ─── نرمال‌سازی ───
    const normalized = {
      ...editing,
      mobile: mobileCheck.normalized || editing.mobile,
      phone: phoneCheck.normalized || editing.phone,
      email: emailCheck.normalized || editing.email,
    };

    setContacts(prev => {
      const exists = prev.find(c => c.id === normalized.id);
      return exists
        ? prev.map(c => c.id === normalized.id ? normalized : c)
        : [...prev, normalized];
    });
    setShowForm(false);
  };`;

src = src.replace(match[0], newSave);
log.push('✅ handleSave با اعتبارسنجی جایگزین شد');

writeFileSync(file, src);
console.log(log.join('\n'));
