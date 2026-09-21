import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/App.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱. حذف بلوک فعلی از case fiscal-year-closing ───
const wrongPlace = `case 'fiscal-year-closing': return (
      <>
        {showOnboarding && (
          <OnboardingTour
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
        <FiscalYearClosing`;

const correctPlace1 = `case 'fiscal-year-closing': return (
        <FiscalYearClosing`;

if (src.includes(wrongPlace)) {
  src = src.replace(wrongPlace, correctPlace1);
  log.push('✅ حذف از case fiscal-year-closing');
} else {
  log.push('⚠️ بلوک اشتباه پیدا نشد');
}

// ─── ۲. افزودن به return اصلی ───
const beforeReturn = `return (
    <AppGuard>
    <div className="flex h-screen overflow-hidden" dir="rtl">`;

const afterReturn = `return (
    <AppGuard>
    {showOnboarding && (
      <OnboardingTour
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    )}
    <div className="flex h-screen overflow-hidden" dir="rtl">`;

if (src.includes(beforeReturn)) {
  src = src.replace(beforeReturn, afterReturn);
  log.push('✅ رندر در return اصلی');
} else if (src.includes(afterReturn)) {
  log.push('⏭ قبلاً اضافه شده');
} else {
  log.push('⚠️ return اصلی پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
