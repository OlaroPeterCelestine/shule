export const DOC_TEMPLATES: Record<string, string> = {
  'Student ID card': `
      <div class="w-72 mx-auto border-2 rounded-lg overflow-hidden" style="border-color:#14213D">
        <div class="bg-ink text-white text-center py-2">
          <img src="logo.png" class="w-10 h-10 mx-auto rounded-full object-contain bg-white mb-1" />
          <p class="text-[11px] leading-tight">Little Royals Kindergarten &amp; Primary School</p>
        </div>
        <div class="p-4 text-center">
          <div class="w-20 h-20 rounded-full bg-canvas border border-line mx-auto mb-2 flex items-center justify-center text-slate2/30 text-xs">Photo</div>
          <p class="font-display text-ink">Nakiwala Faith</p>
          <p class="text-xs text-slate2/50">S4 East · Adm. No. LR-2291</p>
          <p class="text-xs text-slate2/50 mt-2">Valid: Term 2, 2026</p>
        </div>
      </div>`,
  'Admission letter': `
      <div class="text-sm leading-relaxed">
        <div class="flex items-center gap-3 mb-4"><img src="logo.png" class="w-10 h-10 rounded-full object-contain" /><div><p class="font-display text-ink">Little Royals Kindergarten &amp; Primary School</p><p class="text-xs text-slate2/50">Office of the Registrar</p></div></div>
        <p class="text-xs text-slate2/50 mb-4">9 September 2026</p>
        <p class="mb-3">Dear Parent/Guardian,</p>
        <p class="mb-3"><strong>RE: OFFER OF ADMISSION — KIRABO ALEX</strong></p>
        <p class="mb-3">We are pleased to confirm that <strong>Kirabo Alex</strong> has been offered a place in <strong>Primary One (P1)</strong> for the Term 3, 2026 intake, following successful completion of the admissions process.</p>
        <p class="mb-3">Please confirm acceptance and complete enrollment at the Registrar's office within two weeks of this letter.</p>
        <p class="mt-6">Yours faithfully,<br><strong>The Registrar</strong><br>Little Royals Kindergarten &amp; Primary School</p>
      </div>`,
  'Transfer certificate': `
      <div class="text-sm leading-relaxed text-center">
        <img src="logo.png" class="w-14 h-14 rounded-full object-contain mx-auto mb-2" />
        <p class="font-display text-lg text-ink mb-1">Little Royals Kindergarten &amp; Primary School</p>
        <p class="text-xs text-slate2/50 mb-6 tracking-wide">TRANSFER CERTIFICATE</p>
        <p class="text-left mb-3">This is to certify that <strong>Okello Derrick</strong>, Admission No. <strong>LR-0894</strong>, was a bona fide student of this school in class <strong>S2 East</strong> and is hereby released to join another institution in good standing.</p>
        <p class="text-left mb-3">Conduct: <strong>Good</strong> &nbsp;·&nbsp; Fees: <strong>Cleared</strong> &nbsp;·&nbsp; Date of leaving: <strong>9 Sep 2026</strong></p>
        <div class="mt-8 flex justify-between text-xs text-left"><span>_____________________<br>Class Teacher</span><span>_____________________<br>Head Teacher</span></div>
      </div>`,
  'Completion certificate': `
      <div class="text-sm leading-relaxed text-center border-4 p-6" style="border-color:#C68A1A">
        <img src="logo.png" class="w-14 h-14 rounded-full object-contain mx-auto mb-2" />
        <p class="font-display text-lg text-ink mb-1">Little Royals Kindergarten &amp; Primary School</p>
        <p class="text-xs text-slate2/50 mb-6 tracking-wide">CERTIFICATE OF COMPLETION</p>
        <p class="mb-3">This certifies that</p>
        <p class="font-display text-2xl text-ink mb-3">Kwikiriza M.</p>
        <p class="mb-3">has successfully completed the full course of study for <strong>S6 Sciences</strong> in the academic year <strong>2026</strong>.</p>
        <div class="mt-8 flex justify-between text-xs text-left"><span>_____________________<br>Head Teacher</span><span>_____________________<br>Date</span></div>
      </div>`,
  'Staff payslip': `
      <div class="text-sm">
        <div class="flex items-center justify-between border-b border-line pb-3 mb-3">
          <div class="flex items-center gap-3"><img src="logo.png" class="w-10 h-10 rounded-full object-contain" /><p class="font-display text-ink">Little Royals — Payslip</p></div>
          <p class="text-xs text-slate2/50">September 2026</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs mb-4">
          <p><span class="text-slate2/50">Employee:</span> Ssentongo B.</p>
          <p><span class="text-slate2/50">Role:</span> Teacher — Physics</p>
        </div>
        <table class="w-full text-xs">
          <tbody class="divide-y divide-line">
            <tr><td class="py-1.5">Basic salary</td><td class="py-1.5 text-right">1,800,000</td></tr>
            <tr><td class="py-1.5">Allowances</td><td class="py-1.5 text-right">200,000</td></tr>
            <tr><td class="py-1.5">Deductions (PAYE, NSSF)</td><td class="py-1.5 text-right text-maroon">−312,000</td></tr>
            <tr class="font-semibold text-ink"><td class="py-1.5">Net pay</td><td class="py-1.5 text-right">1,688,000</td></tr>
          </tbody>
        </table>
      </div>`,
  'Visitor badge': `
      <div class="w-56 mx-auto border-2 rounded-lg overflow-hidden" style="border-color:#8A2E3B">
        <div class="text-white text-center py-2" style="background:#8A2E3B">
          <p class="text-xs tracking-wide">VISITOR</p>
        </div>
        <div class="p-4 text-center">
          <p class="font-display text-ink">John Mukasa</p>
          <p class="text-xs text-slate2/50">Textbook delivery</p>
          <p class="text-xs text-slate2/50 mt-2 font-mono">Badge V-0231</p>
          <p class="text-xs text-slate2/40 mt-1">Valid for today only</p>
        </div>
      </div>`,
};
