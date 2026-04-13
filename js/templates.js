// ── DOCUMENT TEMPLATES ───────────────────────────────────────────────────────
// MyRight Legal Document Templates — Advanced v2.0
// Covers 111+ document types with full Indian law compliance
// Enhanced: smart validation, auto-computation, multi-party support,
//           BNS 2023 references, GST, stamp duty hints, bilingual support

'use strict';

// ── CONFIGURATION ─────────────────────────────────────────────────────────────
const MYRIGHT_CONFIG = {
  appName: 'MyRight',
  version: '2.0.0',
  jurisdiction: 'Kerala, India',
  disclaimer: 'This document is computer-generated for informational purposes. It must be reviewed and authenticated by a qualified advocate before use in any legal proceeding or official submission. MyRight assumes no liability for any consequence arising from the use of this document.',
  notaryDisclaimer: 'To be executed on non-judicial stamp paper of appropriate value as per Kerala Stamp Act and duly notarised by a Notary Public.',
  contactDisclaimer: 'For legal assistance, consult a registered advocate in your district.',
};

// ── NUMBER & CURRENCY HELPERS ──────────────────────────────────────────────────
function toWords(n) {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
             'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen',
             'Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (!n || isNaN(n)) return '';
  n = parseInt(n);
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + toWords(-n);
  if (n < 20) return a[n];
  if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
  if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' and ' + toWords(n%100) : '');
  if (n < 100000) return toWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + toWords(n%1000) : '');
  if (n < 10000000) return toWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + toWords(n%100000) : '');
  return toWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + toWords(n%10000000) : '');
}

/** Format Indian Rupee amount with words */
function amt(n) {
  if (!n || n === '0' || n === 0) return '___';
  const num = parseInt(n);
  return `Rs.${num.toLocaleString('en-IN')}/- (Rupees ${toWords(num)} Only)`;
}

/** Format amount without Rs prefix — for use mid-sentence */
function amtShort(n) {
  if (!n || n === '0') return '___';
  return `Rs.${parseInt(n).toLocaleString('en-IN')}/-`;
}

/** Calculate simple interest */
function calcInterest(principal, rate, months) {
  if (!principal || !rate || !months) return 0;
  return Math.round((parseInt(principal) * parseFloat(rate) * parseInt(months)) / (12 * 100));
}

/** Calculate total repayment with interest */
function calcTotal(principal, rate, months) {
  return parseInt(principal || 0) + calcInterest(principal, rate, months);
}

// ── DATE HELPERS ───────────────────────────────────────────────────────────────
/** Format a date string as "DD Month YYYY" */
function fmtDate(d) {
  if (!d) return '___';
  try {
    const x = new Date(d + 'T00:00:00');
    if (isNaN(x.getTime())) return d;
    return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch(e) { return d; }
}

/** Add months to a date string, return new date string YYYY-MM-DD */
function addMonths(dateStr, months) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + (parseInt(months) || 0));
  return d.toISOString().split('T')[0];
}

/** Add days to a date string */
function addDays(dateStr, days) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + (parseInt(days) || 0));
  return d.toISOString().split('T')[0];
}

/** Get current year */
const THIS_YEAR = new Date().getFullYear();
const today = new Date().toISOString().split('T')[0];
const todayFmt = fmtDate(today);

// ── VALIDATION & VALUE HELPERS ─────────────────────────────────────────────────
/** Return trimmed value or blank placeholder */
function v(x) { return (x && String(x).trim()) ? String(x).trim() : '___'; }

/** Return trimmed value or empty string (no placeholder) */
function vo(x) { return (x && String(x).trim()) ? String(x).trim() : ''; }

/** Capitalise first letter */
function cap(x) { const s = v(x); return s === '___' ? s : s.charAt(0).toUpperCase() + s.slice(1); }

/** Upper-case city for headings */
function city(f) { return v(f.city).toUpperCase(); }

/** Gender-neutral son/daughter/wife string based on field */
function relation(f) {
  const g = vo(f.gender || '').toLowerCase();
  if (g === 'female' || g === 'f') return 'daughter/wife of';
  if (g === 'male' || g === 'm') return 'son of';
  return 'son/daughter/wife of';
}

/** Format age with "years" appended */
function age(f) { const a = v(f.age); return a === '___' ? '___' : a + ' years'; }

/** Generate reference number */
const RN = () => Math.floor(Math.random() * 900) + 100;
const REF = (prefix) => `${prefix}/${THIS_YEAR}/${RN()}-${RN()}`;

// ── LEGAL SECTION BUILDERS ─────────────────────────────────────────────────────
/** Standard arbitration clause */
function arbitrationClause(cityName) {
  return `DISPUTE RESOLUTION
   Any dispute, difference or claim arising out of or in connection with this Agreement, including any question of its existence, validity or termination, shall be settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended. The seat and venue of arbitration shall be at ${v(cityName)}, Kerala. The award of the arbitrator shall be final and binding.`;
}

/** Standard force majeure clause */
const forceMajeureClause = `FORCE MAJEURE
   Neither party shall be in default or liable for any delay or failure to perform its obligations hereunder if such failure is due to causes beyond its reasonable control, including but not limited to Acts of God, flood, fire, earthquake, epidemic, pandemic, war, civil unrest, government actions, or any other event of force majeure. The affected party shall notify the other within 7 days and shall resume performance as soon as reasonably practicable.`;

/** Standard governing law footer */
function govLaw(f, act) {
  return `GOVERNING LAW
   This Agreement shall be governed by and construed in accordance with the laws of India, including ${act || 'applicable Indian statutes'}. Any disputes shall be subject to the exclusive jurisdiction of the competent courts at ${v(f.city)}, Kerala.`;
}

/** Standard witness block — 2 witnesses */
const witnessBlock = `WITNESSES:
1. Name: ________________________  Signature: ________________________
   Address: ________________________

2. Name: ________________________  Signature: ________________________
   Address: ________________________`;

/** Standard notary block */
const notaryBlock = `________________________
Notary Public / Oath Commissioner
(Name, Official Seal & Stamp)
Registration No: _______________
Date: _______________`;

/** Standard disclaimer footer */
function disclaimer(docType) {
  return `─────────────────────────────────────────────────────────────────
IMPORTANT: This ${docType || 'document'} has been generated by ${MYRIGHT_CONFIG.appName} for informational purposes only. ${MYRIGHT_CONFIG.disclaimer}
─────────────────────────────────────────────────────────────────`;
}

/** Build a standard document header box */
function docHeader(title, refPrefix, f) {
  const refNo = refPrefix ? REF(refPrefix) : '';
  const dateStr = fmtDate(f && f.date ? f.date : today);
  return [
    '═'.repeat(65),
    title.toUpperCase().padStart(Math.floor((65 + title.length) / 2)).padEnd(65),
    '═'.repeat(65),
    refNo ? `Ref. No  : ${refNo}` : '',
    `Date     : ${dateStr}`,
    f && f.city ? `Place    : ${v(f.city)}, Kerala` : '',
    '─'.repeat(65),
  ].filter(Boolean).join('\n');
}

// ── SMART STAMP DUTY HINT ─────────────────────────────────────────────────────
function stampHint(docType, amountVal) {
  const hints = {
    rent_agreement: 'Non-judicial stamp paper of Rs.200/- (for tenancy up to 1 year). Registration optional but recommended.',
    loan_agreement: 'Non-judicial stamp paper of appropriate value under Kerala Stamp Act, 1959. Amounts above Rs.5,000 require stamp duty at prescribed rates.',
    property_sale: 'Stamp duty applicable as per Kerala Stamp Act at prescribed rates on market value / consideration (whichever is higher). Mandatory registration under Registration Act, 1908.',
    mortgage_deed: 'Stamp duty at prescribed rates under Kerala Stamp Act. Mandatory registration.',
    partnership_deed: 'Stamp paper of Rs.500/-. Registration with Registrar of Firms recommended.',
    nda: 'Non-judicial stamp paper of Rs.200/-. Notarisation recommended.',
    default: 'Execute on non-judicial stamp paper of appropriate value as per Kerala Stamp Act, 1959.',
  };
  return `STAMP DUTY NOTE: ${hints[docType] || hints.default}`;
}

// ── CORE GENERATE FUNCTION ────────────────────────────────────────────────────
/**
 * generateDoc(id, fields)
 * Main entry point. Renders the template for the given document type ID
 * with the supplied field values. Returns a formatted string document.
 *
 * @param {string} id   - Template key (e.g. 'affidavit', 'rent_agreement')
 * @param {Object} f    - Field values map { fieldName: value }
 * @returns {string}    - Rendered document text
 */
function generateDoc(id, f) {
  // Sanitise all input fields
  const sanitised = {};
  for (const [k, val] of Object.entries(f || {})) {
    sanitised[k] = (val !== null && val !== undefined) ? String(val) : '';
  }

  const fn = TMPL[id];
  if (fn) {
    try {
      const result = fn(sanitised);
      if (result && result.trim()) {
        return result.trim() + '\n\n' + disclaimer(id.replace(/_/g, ' '));
      }
    } catch (e) {
      console.error('[MyRight] Template error for:', id, e);
    }
  }

  // Fallback: auto-format unknown document
  const lines = Object.entries(sanitised)
    .filter(([, val]) => val && val.trim())
    .map(([k, val]) => k.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase()) + ': ' + val)
    .join('\n');

  return [
    docHeader(id.replace(/_/g, ' '), 'DOC', sanitised),
    '',
    lines,
    '',
    `Signature: _______________`,
    `Date     : _______________`,
    '',
    disclaimer(id.replace(/_/g, ' ')),
  ].join('\n');
}

// ── TEMPLATE REGISTRY ─────────────────────────────────────────────────────────
const TMPL = {


affidavit:f=>{
  const relStr = relation(f);
  const extraClauses = vo(f.additionalClauses);
  let clauseNum = 3;
  return `${docHeader('AFFIDAVIT','AFF',f)}

STATE OF KERALA — DISTRICT OF ${city(f)}

I, ${v(f.fullName)}, ${relStr} ${v(f.fatherName)}, aged ${age(f)}, bearing Aadhaar No. ${v(f.aadhaarNo||'XXXX-XXXX-XXXX')}, residing at ${v(f.address)}, ${v(f.city)}, Kerala — ${v(f.pincode||'PIN: ______')}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am a competent adult, fully cognisant of the legal effect of this affidavit, and I make this affidavit from my personal knowledge.

2. ${v(f.declaration)}
${extraClauses ? `
${++clauseNum-1}. ${extraClauses}
` : ''}
${clauseNum++}. I state that all facts set out herein are true, correct and complete to the best of my knowledge, information and belief. No part of this affidavit is false, misleading or fabricated. Nothing material has been concealed, suppressed or distorted.

${clauseNum++}. I state that I am making this affidavit voluntarily, of my own free will, without any force, coercion, threat, misrepresentation or undue influence from any person whatsoever.

${clauseNum++}. I am fully aware that making a false affidavit is a criminal offence punishable under Section 191/193 of the Indian Penal Code, 1860 / Section 222/227 of the Bharatiya Nyaya Sanhita (BNS), 2023, and may also attract contempt of court proceedings.

${clauseNum}. I shall be fully responsible, legally and personally, for all consequences that may arise if any fact stated herein is found to be false, incorrect or misleading.

─────────────────────────────
VERIFICATION
─────────────────────────────
I, ${v(f.fullName)}, the deponent above named, do hereby solemnly verify and declare that the contents of paragraphs 1 to ${clauseNum} of this affidavit are true and correct to the best of my knowledge and belief. No part of this affidavit is false. Nothing material has been concealed or suppressed therefrom.

Verified at ${v(f.city)} on this ${fmtDate(f.date)}.

                              ________________________
                              DEPONENT
                              ${v(f.fullName)}

─────────────────────────────
BEFORE NOTARY
─────────────────────────────
Solemnly affirmed and sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}, Kerala.

${notaryBlock}

${stampHint('default')}`;
},

self_declaration:f=>`SELF DECLARATION

I, ${v(f.fullName)}, son/daughter of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, do hereby solemnly declare as follows:

1. I am an Indian citizen and a resident of ${v(f.city)}, Kerala.

2. ${v(f.purpose)}

3. I further declare that:
   a) All documents and information submitted by me are genuine, authentic and true to the best of my knowledge.
   b) I have not suppressed any material fact or made any misrepresentation.
   c) I have not been convicted of any criminal offence by any court of law in India or abroad.
   d) No criminal proceedings are pending against me before any court of law.
   e) I consent to verification of all facts and documents submitted by me by concerned authorities.
   f) I am fully aware that making a false declaration is punishable under Section 199 of the Indian Penal Code / Section 227 of the Bharatiya Nyaya Sanhita (BNS), 2023.
   g) I shall be solely and personally responsible for all consequences arising from any false statement or misrepresentation contained herein.

4. I make this declaration of my own free will and without any compulsion or undue influence.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this declaration are true and correct to the best of my knowledge and belief and nothing material has been concealed therefrom.

Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DECLARANT
                                        ${v(f.fullName)}`,

character_cert:f=>`CHARACTER CERTIFICATE

Date: ${fmtDate(f.date)}
Ref. No: CC/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that I am personally and well acquainted with ${v(f.fullName)}, son/daughter of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}.

I have known ${v(f.fullName)} for a period of ${v(f.knownFor)} and during this entire period I have consistently found him/her to be a person of exemplary moral character, integrity and upright conduct.

Specifically, I certify that ${v(f.fullName)} is:
✓ Honest, sincere and trustworthy in all dealings
✓ Law-abiding, disciplined and well-behaved
✓ Respectful towards elders, peers and societal norms
✓ Of sound mind and good social standing
✓ Well-respected in the community and among acquaintances

To the best of my knowledge, information and belief, no criminal case, FIR, charge-sheet or any police complaint is pending against ${v(f.fullName)}, and he/she has not been convicted by any court of law for any offence whatsoever.

I recommend ${v(f.fullName)} for the purpose of: ${v(f.purpose)}, without any reservation whatsoever.

This certificate is issued in good faith, based entirely on my personal knowledge, and the contents are true to the best of my knowledge and belief.

                    ________________________
                    ${v(f.issuedBy)}
                    Date: ${fmtDate(f.date)}
                    (Seal / Stamp if applicable)`,

name_change:f=>{
  return `${docHeader('AFFIDAVIT FOR CHANGE OF NAME','NC',f)}

STATE OF KERALA — DISTRICT OF ${city(f)}

I, ${v(f.oldName)}, ${relation(f)} ${v(f.fatherName)}, aged ${age(f)}, presently residing at ${v(f.address)}, ${v(f.city)}, Kerala — PIN ${v(f.pincode||'______')}, Aadhaar No. ${v(f.aadhaarNo||'XXXX-XXXX-XXXX')}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent herein. I am making this affidavit for the purpose of effecting a permanent and lawful change in my name in all official, government, educational, financial, professional and personal records.

2. My present name as recorded in all official documents and records is: ${v(f.oldName)}.

3. I desire to be hereafter known, identified and referred to by my new name: ${v(f.newName)}.

4. The reason for this change of name is: ${v(f.reason)}.

5. With effect from the date of this affidavit, I hereby absolutely, irrevocably and permanently:
   (a) Abandon and relinquish the use of my former name: ${v(f.oldName)};
   (b) Adopt and assume my new name: ${v(f.newName)};
   (c) Declare that I shall henceforth be known in all matters — legal, official, professional, educational, personal and social — exclusively by my new name: ${v(f.newName)}.

6. I request all concerned authorities, government departments, courts, banks, financial institutions, insurance companies, educational institutions, employers and all other persons and organisations to:
   (a) Record and recognise my new name: ${v(f.newName)} in place of my former name: ${v(f.oldName)};
   (b) Make necessary corrections in all existing records accordingly;
   (c) Issue all future documents, certificates and communications in my new name: ${v(f.newName)}.

7. Documents specifically requiring name change include (as applicable):
   ☐ Aadhaar Card          ☐ PAN Card              ☐ Passport
   ☐ Voter ID Card         ☐ Driving Licence        ☐ Ration Card
   ☐ Bank Accounts         ☐ Insurance Policies     ☐ Educational Certificates
   ☐ Service Records       ☐ Revenue / Land Records ☐ All other official records

8. I declare that this name change is not for any fraudulent, illegal, improper or evasive purpose. I am not changing my name to evade any legal liability, criminal prosecution or debt.

9. I am fully aware that making a false affidavit is a criminal offence punishable under Section 191/193 IPC / Section 222 BNS, 2023.

10. I shall be fully and personally responsible for all consequences arising from this name change.

─────────────────────────────
VERIFICATION
─────────────────────────────
I, ${v(f.oldName)} (to be known as ${v(f.newName)}), the deponent above named, do hereby verify on solemn affirmation that the contents of paragraphs 1 to 10 of this affidavit are true, correct and complete to the best of my knowledge and belief. Nothing material has been concealed or suppressed.

Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                              ________________________
                              DEPONENT
                              ${v(f.newName)}
                              (Formerly: ${v(f.oldName)})

Solemnly affirmed before me on ${fmtDate(f.date)}.

${notaryBlock}

─────────────────────────────
NAME CHANGE PROCEDURE GUIDE
─────────────────────────────
Step 1: ✓ Execute this Affidavit before a Notary Public
Step 2: Publish name change notice in two local newspapers (one in Malayalam, one in English)
Step 3: Publish in the Kerala Government Gazette (contact: Director of Printing, Government Press, Thiruvananthapuram)
Step 4: Submit Gazette copy + Affidavit + Newspaper publications to update each document
Step 5: For Aadhaar — visit UIDAI centre with supporting docs
Step 6: For Passport — file fresh application with Gazette and Affidavit
Step 7: For PAN — apply online on NSDL/UTIITSL portal

${stampHint('default')}`;
},

rent_agreement:f=>{
  const months = parseInt(f.duration) || 11;
  const endDate = addMonths(f.startDate, months);
  const rentNum = parseInt(f.rentAmount || 0);
  const depositNum = parseInt(f.deposit || 0);
  const annualRent = rentNum * 12;
  const lateInterestRate = parseInt(f.lateInterest || 18);
  const monthlyLate = Math.round(rentNum * lateInterestRate / (12 * 100));
  return `${docHeader('RENT / TENANCY AGREEMENT','RA',f)}

This Rent / Tenancy Agreement ("Agreement") is entered into on ${fmtDate(f.startDate)}, at ${v(f.city)}, Kerala.

BETWEEN

LANDLORD:
  Full Name    : ${v(f.landlordName)}
  S/o D/o      : ${v(f.landlordFather||'___')}
  Address      : ${v(f.landlordAddress||f.city)}, Kerala
  Contact      : ${v(f.landlordPhone||'___')}
  (hereinafter referred to as "the Landlord")

AND

TENANT:
  Full Name    : ${v(f.tenantName)}
  S/o D/o      : ${v(f.tenantFather||'___')}
  Permanent Addr: ${v(f.tenantAddress||f.city)}, Kerala
  Aadhaar No.  : ${v(f.tenantAadhaar||'XXXX-XXXX-XXXX')}
  Contact      : ${v(f.tenantPhone||'___')}
  (hereinafter referred to as "the Tenant")

SCHEDULE OF PROPERTY
  Premises     : ${v(f.propertyAddress)}, ${v(f.city)}, Kerala
  Property Type: ${v(f.propertyType||'Residential Premises')}
  Floor / Unit : ${v(f.floorUnit||'As described above')}

WHEREAS the Landlord is the lawful owner / authorised agent of the above Premises, possessing full right and authority to lease the same; AND WHEREAS the Tenant is desirous of taking the Premises on rent for the purpose of ${v(f.useType||'residential occupation')} only; NOW, THEREFORE, in consideration of the mutual covenants herein, the parties agree as follows:

1. TERM OF TENANCY
   This tenancy shall be for a period of ${months} (${toWords(months)}) months, commencing on ${fmtDate(f.startDate)} and expiring on ${fmtDate(endDate)}, unless sooner terminated as herein provided.

2. RENT
   (a) Monthly rent : ${amt(f.rentAmount)}, payable on or before the 5th day of each calendar month.
   (b) Mode of payment: ${v(f.paymentMode||'Bank transfer / UPI / Cheque')}.
   (c) Annual Rent  : ${amt(annualRent.toString())} (for reference only).
   (d) Late Payment : A delay beyond the 5th of the month shall attract interest at ${lateInterestRate}% per annum (approximately ${amtShort(monthlyLate.toString())} per month per full month of delay).
   (e) Rent Enhancement: On renewal, rent may be enhanced by a maximum of 10% per annum by mutual written agreement.

3. SECURITY DEPOSIT
   (a) The Tenant has paid / agrees to pay a refundable security deposit of ${amt(f.deposit||'0')} to the Landlord.
   (b) This deposit shall not bear any interest.
   (c) This deposit shall be refunded within 30 (Thirty) days of the Tenant vacating the Premises, after deducting: (i) any outstanding rent or utility dues; (ii) cost of repairs for damage beyond normal wear and tear; (iii) any other lawful charges.

4. USE OF PREMISES
   (a) The Premises shall be used exclusively for ${v(f.useType||'residential')} purposes only.
   (b) No commercial, industrial, illegal, immoral or offensive activity shall be carried on in the Premises.
   (c) The Tenant shall not use the Premises in any manner that violates any law, bye-law, or regulation of any local or government authority.
   (d) Number of occupants shall not exceed ${v(f.maxOccupants||'___')} persons.

5. MAINTENANCE AND REPAIRS
   (a) Minor day-to-day repairs (plumbing fittings, electrical switches, door handles, etc.) costing up to Rs.500/- per instance: Tenant's responsibility.
   (b) Major structural repairs, leakage, roof, foundation, lifts, electrical mains: Landlord's responsibility.
   (c) No structural alterations, additions or modifications shall be made to the Premises without prior written consent of the Landlord.
   (d) Tenant shall maintain the Premises in good and clean condition at all times.
   (e) The Tenant shall hand over vacant possession of the Premises at the end of this Agreement in the same condition as received, subject to normal wear and tear.

6. UTILITIES AND OUTGOINGS
   (a) Electricity, water, gas, internet, cable TV and all other utility charges shall be paid by the Tenant directly to the respective service providers.
   (b) The Tenant shall pay all municipal taxes, property tax and maintenance charges attributable to the Tenancy Period, if applicable.
   (c) Society maintenance charges (if any): ${v(f.maintenanceBy||'As mutually agreed')}.

7. SUBLETTING AND ASSIGNMENT
   The Tenant shall not sublet, underlet, assign, license, mortgage or in any manner part with the Premises or any portion thereof to any third party without prior written consent of the Landlord. Any such unauthorized subletting shall entitle the Landlord to terminate this Agreement forthwith.

8. RIGHT OF INSPECTION
   The Landlord, or his/her authorised representative, shall have the right to inspect the Premises at any reasonable time, with a minimum of 24 hours prior notice to the Tenant.

9. NOTICE PERIOD AND TERMINATION
   (a) Either party may terminate this Agreement before expiry by giving ${v(f.noticePeriod||'One')} calendar month's prior written notice.
   (b) In case of breach of any term by the Tenant, the Landlord may terminate this Agreement immediately without notice, with the right to recover possession.
   (c) On termination, the Tenant shall immediately hand over vacant and peaceful possession of the Premises along with all keys.

10. RENEWAL
    At the expiry of this Agreement, the tenancy may be renewed by mutual written agreement on terms then negotiated. This Agreement shall not be deemed to be renewed automatically.

11. LOCK-IN PERIOD
    ${vo(f.lockIn) ? `This Agreement carries a lock-in period of ${v(f.lockIn)} months from the commencement date, during which neither party may terminate without liability for the remaining lock-in rent.` : 'No lock-in period applies.'}

12. PETS AND ALTERATIONS
    ${vo(f.petsAllowed) && f.petsAllowed.toLowerCase()==='yes' ? 'Pets are permitted subject to the Tenant ensuring no nuisance or damage.' : 'Pets are not permitted in the Premises without prior written consent of the Landlord.'}

13. GOVERNING LAW
    This Agreement is governed by the Transfer of Property Act, 1882, the Kerala Buildings (Lease and Rent Control) Act, 1965, and all other applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

IN WITNESS WHEREOF, both parties have signed this Agreement on the day and year first above written.

________________________          ________________________
LANDLORD                          TENANT
${v(f.landlordName)}              ${v(f.tenantName)}
Date: ${fmtDate(f.startDate)}     Date: ${fmtDate(f.startDate)}

${witnessBlock}

${stampHint('rent_agreement')}`;
},

loan_agreement:f=>{
  const principal = parseInt(f.loanAmount || 0);
  const rate = parseFloat(f.interest || 0);
  const penalRate = Math.min(rate + 6, 24);
  const months = parseInt(f.loanMonths || 0);
  const totalInterest = months > 0 ? calcInterest(principal, rate, months) : 0;
  const totalRepay = principal + totalInterest;
  const hasInterest = rate > 0;
  const hasSecurity = vo(f.security);
  return `${docHeader('LOAN AGREEMENT','LA',f)}

This Loan Agreement ("Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

LENDER:
  Full Name : ${v(f.lenderName)}
  Address   : ${v(f.lenderAddress||f.city)}, Kerala
  Aadhaar / PAN: ${v(f.lenderPan||'___')}
  (hereinafter referred to as "the Lender")

AND

BORROWER:
  Full Name : ${v(f.borrowerName)}
  Address   : ${v(f.borrowerAddress||f.city)}, Kerala
  Aadhaar / PAN: ${v(f.borrowerPan||'___')}
  (hereinafter referred to as "the Borrower")

WHEREAS the Borrower has approached the Lender for a personal / business loan and the Lender has agreed to advance the same on the terms and conditions set forth herein.

─────────────────────────────
LOAN SUMMARY
─────────────────────────────
  Principal Amount : ${amt(f.loanAmount)}
  Rate of Interest : ${hasInterest ? rate+'% per annum' : 'Nil (Interest-free)'}
  Loan Period      : ${months > 0 ? months+' months' : 'As agreed (see Clause 4)'}
  Total Interest   : ${months > 0 && hasInterest ? amt(totalInterest.toString()) : 'To be computed'}
  Total Repayable  : ${months > 0 && hasInterest ? amt(totalRepay.toString()) : amt(f.loanAmount)}
  Repayment Date   : ${fmtDate(f.repaymentDate)}
  Security         : ${hasSecurity ? v(f.security) : 'Nil'}
─────────────────────────────

1. LOAN AMOUNT AND DISBURSEMENT
   (a) The Lender agrees to advance and the Borrower agrees to receive a loan of ${amt(f.loanAmount)} ("Loan").
   (b) The Loan is disbursed on ${fmtDate(f.date)} by ${v(f.disbursementMode||'bank transfer / cash / UPI / cheque')}.
   (c) The Borrower hereby unconditionally acknowledges receipt of the full Loan amount and confirms that the same has been credited to his/her account / received in hand.

2. PURPOSE OF LOAN
   The Loan is advanced for the purpose of: ${v(f.purpose||'personal / business requirements')}.

3. RATE OF INTEREST
   ${hasInterest
     ? `(a) The Borrower shall pay simple / reducing-balance interest at the rate of ${rate}% (${toWords(Math.floor(rate))} percent) per annum on the outstanding principal.
   (b) Interest shall be calculated on a monthly basis and shall be payable ${v(f.interestPayMode||'along with the principal at the time of repayment / monthly')}.`
     : `This Loan is advanced as an interest-free loan as a matter of goodwill. No interest is chargeable unless the Borrower defaults, in which case Clause 6 shall apply.`}

4. REPAYMENT
   (a) The Borrower shall repay the entire outstanding Loan amount, together with all accrued interest, on or before ${fmtDate(f.repaymentDate)}.
   (b) Mode of Repayment: ${v(f.repaymentMode||'Bank transfer / NEFT / UPI / Demand Draft in the name of the Lender')}.
   (c) Part payments shall first be applied to interest due and then to the principal.

5. SECURITY / COLLATERAL
   ${hasSecurity
     ? `(a) As security for the repayment of this Loan, the Borrower has provided / agreed to provide: ${v(f.security)}.
   (b) The Lender shall have the right to enforce this security upon default.
   (c) The security shall be released upon full repayment of the Loan and all dues.`
     : `This Loan is unsecured. No security or collateral has been provided by the Borrower.`}

6. DEFAULT AND REMEDIES
   (a) The Borrower shall be in default if: (i) any repayment is not made on the due date; (ii) the Borrower becomes insolvent or assigns assets for benefit of creditors; (iii) any representation made herein is found to be false.
   (b) On default, the entire outstanding amount (principal + interest) shall immediately become due and payable without any further demand or notice.
   (c) Default shall attract penal interest at ${penalRate}% (${toWords(penalRate)} percent) per annum from the date of default until full payment.
   (d) The Lender shall be entitled to recover the Loan amount, penal interest and all legal costs through proceedings under the Negotiable Instruments Act, 1881 / Recovery of Debts and Bankruptcy Act, 1993 / Code of Civil Procedure, 1908, as applicable.
   (e) The Borrower shall bear all costs, charges and expenses incurred by the Lender in recovering the dues.

7. PREPAYMENT
   The Borrower may prepay the Loan, in full or in part, at any time without any prepayment penalty. On prepayment, interest shall be calculated only up to the date of prepayment.

8. REPRESENTATIONS AND WARRANTIES
   The Borrower represents and warrants that:
   (a) The Borrower has full legal capacity and authority to enter into this Agreement.
   (b) The Loan shall be used only for the stated purpose.
   (c) No material information adverse to the Borrower's financial standing has been concealed.
   (d) No other borrowing is outstanding that may affect the Borrower's repayment capacity, except as disclosed.

9. ${arbitrationClause(f.city)}

10. ${govLaw(f, 'the Indian Contract Act, 1872, the Transfer of Property Act, 1882 (for secured loans), and all other applicable Indian statutes')}

11. MISCELLANEOUS
    (a) This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations.
    (b) Any amendment shall be in writing signed by both parties.
    (c) Waiver of any breach shall not constitute waiver of any subsequent breach.

IN WITNESS WHEREOF, the parties have signed this Agreement on the date first written above.

________________________          ________________________
LENDER                            BORROWER
${v(f.lenderName)}                ${v(f.borrowerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

${witnessBlock}

${stampHint('loan_agreement')}`;
},

nda:f=>{
  const isMutual = vo(f.ndaType) && f.ndaType.toLowerCase().includes('mutual');
  const durMonths = parseInt(f.duration || 24);
  const endDate = addMonths(f.date, durMonths);
  return `${docHeader('NON-DISCLOSURE AGREEMENT (NDA)', 'NDA', f)}

Type: ${isMutual ? 'MUTUAL NON-DISCLOSURE AGREEMENT' : 'ONE-WAY (UNILATERAL) NON-DISCLOSURE AGREEMENT'}

This Non-Disclosure Agreement ("Agreement") is entered into on ${fmtDate(f.date)}, at ${v(f.city)}, between:

PARTY 1 (${isMutual ? 'Disclosing / Receiving Party' : 'DISCLOSING PARTY'}):
  Name    : ${v(f.party1)}
  Address : ${v(f.party1Address||f.city)}, Kerala
  (hereinafter "Party 1")

AND

PARTY 2 (${isMutual ? 'Disclosing / Receiving Party' : 'RECEIVING PARTY'}):
  Name    : ${v(f.party2)}
  Address : ${v(f.party2Address||f.city)}, Kerala
  (hereinafter "Party 2")

PURPOSE OF DISCLOSURE: ${v(f.purpose)}

RECITALS
WHEREAS the parties desire to explore a potential business relationship and, in connection therewith, may disclose certain confidential and proprietary information to each other${isMutual ? ' on a mutual basis' : ''}; AND WHEREAS the parties wish to protect such information from unauthorised disclosure; NOW, THEREFORE, in consideration of the mutual promises herein and for other good and valuable consideration, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   "Confidential Information" means all information, data, know-how, trade secrets, business strategies, financial projections, technical specifications, customer and supplier lists, pricing, source code, software, inventions, designs, processes, personnel data, and any other information disclosed by ${isMutual ? 'either party to the other' : 'the Disclosing Party to the Receiving Party'} — whether orally, in writing, electronically or by any other means — that is: (i) marked "Confidential" or "Proprietary"; or (ii) by its nature, should reasonably be understood to be confidential.

2. OBLIGATIONS OF ${isMutual ? 'EACH PARTY AS RECEIVING PARTY' : 'THE RECEIVING PARTY'}
   ${isMutual ? 'Each party, in its capacity as the Receiving Party,' : 'The Receiving Party'} agrees to:
   (a) Hold all Confidential Information in strict confidence using at least the same degree of care as used to protect its own confidential information (and in no event less than reasonable care);
   (b) Use the Confidential Information solely for the Purpose stated above;
   (c) Not disclose or reveal Confidential Information to any third party without prior written consent of ${isMutual ? 'the other party' : 'the Disclosing Party'};
   (d) Restrict disclosure to employees, contractors or advisors who: (i) have a strict need-to-know; and (ii) are bound by equivalent confidentiality obligations;
   (e) Promptly notify ${isMutual ? 'the other party' : 'the Disclosing Party'} upon becoming aware of any actual or suspected unauthorised disclosure.

3. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
   Obligations of confidentiality shall NOT apply to information that:
   (a) Is or becomes publicly available through no fault of the Receiving Party;
   (b) Was already known to the Receiving Party prior to disclosure (with documentary proof);
   (c) Is independently developed by the Receiving Party without reference to the Confidential Information;
   (d) Is received from a third party who is lawfully entitled to disclose it without restriction;
   (e) Is required to be disclosed by law, court order or regulatory authority — provided the Receiving Party gives immediate prior written notice to ${isMutual ? 'the other party' : 'the Disclosing Party'} and cooperates to obtain a protective order.

4. NO GRANT OF RIGHTS OR LICENSE
   Nothing in this Agreement shall be construed as granting any license, right, title or interest in any Confidential Information, patent, trademark, copyright, trade secret or any other intellectual property right of ${isMutual ? 'either party' : 'the Disclosing Party'}.

5. INTELLECTUAL PROPERTY
   All Confidential Information disclosed remains the exclusive property of the disclosing party. Any inventions, improvements or derivative works created by the Receiving Party using the Confidential Information shall: ${v(f.ipOwnership||'remain the property of the Disclosing Party and shall be promptly disclosed and assigned to the Disclosing Party')}.

6. NON-SOLICITATION
   During the term of this Agreement and for a period of ${v(f.nonSolicitPeriod||'12')} months thereafter, neither party shall, directly or indirectly, solicit or recruit any employee, contractor or consultant of the other party who was introduced or known through this engagement, without prior written consent.

7. RETURN OR DESTRUCTION OF INFORMATION
   Upon request by ${isMutual ? 'either party' : 'the Disclosing Party'} or upon termination of this Agreement, the Receiving Party shall, within 7 days:
   (a) Return all Confidential Information in tangible form to ${isMutual ? 'the other party' : 'the Disclosing Party'}; or
   (b) Securely destroy all Confidential Information (including all copies, notes and extracts) and certify such destruction in writing;
   unless retention is required by law.

8. TERM
   (a) This Agreement is effective from ${fmtDate(f.date)} and shall remain in force for ${durMonths} (${toWords(durMonths)}) months, i.e., until ${fmtDate(endDate)}.
   (b) The confidentiality obligations under Clause 2 shall survive termination of this Agreement for a further period of ${v(f.survivalPeriod||'3')} years.

9. REMEDIES FOR BREACH
   The parties acknowledge that any breach of this Agreement will cause irreparable harm for which monetary damages would be an inadequate remedy. Accordingly, in addition to all other remedies available at law, ${isMutual ? 'the aggrieved party' : 'the Disclosing Party'} shall be entitled to seek immediate injunctive or other equitable relief without the necessity of proving actual damages or posting any bond.

10. ${arbitrationClause(f.city)}

11. ${govLaw(f, 'the Indian Contract Act, 1872, the Information Technology Act, 2000, and all other applicable Indian laws')}

12. MISCELLANEOUS
    (a) This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior discussions.
    (b) Any amendment shall be in writing and signed by authorised representatives of both parties.
    (c) If any provision is held invalid, the remaining provisions shall continue in full force.
    (d) This Agreement may be executed in counterparts, each of which shall be deemed an original.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

________________________          ________________________
PARTY 1                           PARTY 2
${v(f.party1)}                    ${v(f.party2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

${witnessBlock}

${stampHint('nda')}`;
},

partnership_deed:f=>`PARTNERSHIP DEED

This Partnership Deed is made on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala, between:

1. ${v(f.partner1)}, Address: ${v(f.partner1Address||f.city)} ("Partner 1")
2. ${v(f.partner2)}, Address: ${v(f.partner2Address||f.city)} ("Partner 2")
${f.partner3&&f.partner3.trim()?'3. '+v(f.partner3)+' ("Partner 3")':''}

(hereinafter collectively referred to as "the Partners")

WHEREAS the Partners have agreed to carry on business in partnership on the terms set forth herein.

1. FIRM NAME
   The business shall be carried on under the name and style of: M/s ${v(f.businessName)}.

2. PLACE OF BUSINESS
   The principal place of business shall be at: ${v(f.businessAddress)}, ${v(f.city)}, Kerala.

3. NATURE OF BUSINESS
   The Partnership shall carry on the business of: ${v(f.businessNature)}.

4. COMMENCEMENT
   The Partnership shall commence from the date of this Deed.

5. CAPITAL CONTRIBUTION
   Partner 1 (${v(f.partner1)}): ${amt(f.capitalPartner1)}
   Partner 2 (${v(f.partner2)}): ${amt(f.capitalPartner2)}
   Total Capital: ${amt((parseInt(f.capitalPartner1||0)+parseInt(f.capitalPartner2||0)).toString())}

6. PROFIT AND LOSS SHARING
   Profits and losses shall be shared in the ratio of: ${v(f.profitRatio)}.

7. BANKING
   The firm shall maintain bank accounts in its name. Cheques to be signed by Partners as mutually decided.

8. BOOKS OF ACCOUNTS
   True and accurate books of accounts shall be maintained at the principal place of business. Financial year: April 1 to March 31. Annual audit by a Chartered Accountant.

9. MANAGEMENT
   (a) Routine decisions: Any Partner independently.
   (b) Major decisions (capital expenditure above Rs.50,000/-, new contracts, new liabilities, disposal of assets): Unanimous consent of all Partners required in writing.
   (c) Each Partner shall devote full time and skill to the business.

10. DUTIES OF PARTNERS
    Each Partner shall:
    (a) Be just, faithful and honest in all dealings.
    (b) Not engage in any competing business without written consent of other Partners.
    (c) Not use firm's assets for personal benefit.
    (d) Indemnify the firm for losses caused by his/her negligence or willful default.

11. RETIREMENT
    Any Partner may retire by giving 2 months' written notice. Outgoing Partner's share to be settled by agreement or arbitration.

12. DEATH OR INSOLVENCY
    On death or insolvency of any Partner, remaining Partners may continue the business by admitting a new partner or purchasing the deceased/insolvent Partner's share at book value.

13. DISPUTE RESOLUTION
    Disputes shall be resolved by arbitration under the Arbitration and Conciliation Act, 1996. Venue: ${v(f.city)}.

14. GOVERNING LAW
    This Deed is governed by the Indian Partnership Act, 1932.

________________________     ________________________
PARTNER 1                    PARTNER 2
${v(f.partner1)}             ${v(f.partner2)}

WITNESSES:
1. Name: ________________  Signature: ________________
2. Name: ________________  Signature: ________________`,

employment_contract:f=>{
  const gross = parseInt(f.salary || 0);
  const basic = Math.round(gross * 0.4);
  const hra = Math.round(gross * 0.2);
  const da = Math.round(gross * 0.1);
  const allowances = gross - basic - hra - da;
  const annual = gross * 12;
  const probation = parseInt(f.probationMonths || 6);
  const noticePeriod = vo(f.noticePeriod) || '30';
  return `${docHeader('EMPLOYMENT CONTRACT','EC',f)}

This Employment Contract ("Contract") is made on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala, between:

EMPLOYER:
  Company / Firm : ${v(f.companyName)}
  Address        : ${v(f.companyAddress||f.city)}, Kerala
  CIN / PAN      : ${v(f.companyCIN||'___')}
  (hereinafter referred to as "the Employer")

AND

EMPLOYEE:
  Full Name      : ${v(f.employeeName)}
  Address        : ${v(f.employeeAddress||f.city)}, Kerala
  Aadhaar No.    : ${v(f.aadhaarNo||'XXXX-XXXX-XXXX')}
  PAN No.        : ${v(f.panNo||'___')}
  Date of Birth  : ${fmtDate(f.dob)}
  (hereinafter referred to as "the Employee")

WHEREAS the Employer desires to engage the Employee and the Employee has agreed to serve the Employer on the terms and conditions set forth herein; the parties agree as follows:

1. POSITION AND DUTIES
   (a) Designation         : ${v(f.designation)}
   (b) Department          : ${v(f.department||'___')}
   (c) Reporting To        : ${v(f.reportingTo||'Management')}
   (d) Place of Posting    : ${v(f.postingPlace||f.city)}, Kerala
   (e) Date of Joining     : ${fmtDate(f.joiningDate)}
   (f) The Employee shall perform all duties assigned by the Employer and shall devote full time, attention and abilities to the business of the Employer during working hours.

2. PROBATION PERIOD
   (a) The Employee shall be on probation for ${probation} (${toWords(probation)}) months from the date of joining.
   (b) During probation, either party may terminate employment by giving ${v(f.probationNotice||'7')} days' notice.
   (c) On successful completion of probation, the Employer shall issue a confirmation letter. Probation may be extended at the Employer's discretion.

3. COMPENSATION (MONTHLY CTC)
${gross > 0 ? `   Gross Monthly Salary  : ${amt(gross.toString())}
   Annual CTC            : ${amt(annual.toString())}

   Indicative Salary Structure:
   ┌─────────────────────────────┬──────────────┐
   │ Component                   │ Amount (pm)  │
   ├─────────────────────────────┼──────────────┤
   │ Basic Salary                │ Rs.${basic.toLocaleString('en-IN')}    │
   │ House Rent Allowance (HRA)  │ Rs.${hra.toLocaleString('en-IN')}    │
   │ Dearness Allowance (DA)     │ Rs.${da.toLocaleString('en-IN')}    │
   │ Other Allowances            │ Rs.${allowances.toLocaleString('en-IN')}    │
   ├─────────────────────────────┼──────────────┤
   │ TOTAL GROSS                 │ Rs.${gross.toLocaleString('en-IN')}    │
   └─────────────────────────────┴──────────────┘
   Note: TDS, PF, ESI and other statutory deductions shall be made as per applicable law.` : `   Salary: ${v(f.salaryText||'As mutually agreed and set out in the offer letter.')}`}

4. WORKING HOURS AND LEAVE
   (a) Working Hours : ${v(f.workingHours||'9:00 AM to 6:00 PM, Monday to Saturday')} (${v(f.weeklyHours||'48')} hours per week).
   (b) Annual Leave  : ${v(f.annualLeave||'15')} days paid leave per year, accruing at the rate of 1.25 days per month.
   (c) Sick Leave    : ${v(f.sickLeave||'7')} days per year.
   (d) Casual Leave  : ${v(f.casualLeave||'7')} days per year.
   (e) Public Holidays as per Kerala Government Gazette / Company policy.
   (f) Leave encashment and carry-forward as per Company policy.

5. CONFIDENTIALITY
   During and after employment, the Employee shall maintain strict confidentiality of all trade secrets, business plans, customer data, financial information and all other proprietary information of the Employer. Breach shall entitle the Employer to seek injunctive relief and damages.

6. INTELLECTUAL PROPERTY
   All inventions, works, developments, improvements and deliverables created by the Employee in the course of employment shall be the sole and exclusive property of the Employer and are hereby assigned to the Employer.

7. NON-COMPETE AND NON-SOLICITATION
   For a period of ${v(f.nonCompetePeriod||'12')} months after cessation of employment, the Employee shall not:
   (a) Engage in or assist any business that directly competes with the Employer within ${v(f.nonCompeteRadius||'the state of Kerala')};
   (b) Solicit or recruit any employee, customer or supplier of the Employer.

8. CODE OF CONDUCT
   The Employee shall:
   (a) Act with integrity, honesty and professionalism at all times.
   (b) Comply with all Employer policies, rules, regulations and applicable laws.
   (c) Not engage in any activity that causes conflict of interest with the Employer.
   (d) Not accept any bribe, gift or gratification in connection with employment.

9. TERMINATION
   (a) After confirmation, either party may terminate this Contract by giving ${noticePeriod} (${toWords(parseInt(noticePeriod))}) days' written notice, or salary in lieu thereof.
   (b) The Employer may terminate without notice for: misconduct, fraud, dishonesty, wilful negligence, conviction for a criminal offence, or any act prejudicial to the Employer's interests.
   (c) On termination, the Employee shall: (i) hand over all company property; (ii) settle all dues; (iii) cooperate in knowledge transfer; and (iv) maintain confidentiality obligations.

10. BENEFITS
    ${v(f.benefits||'PF, ESI (as applicable), Gratuity (as per Payment of Gratuity Act), and other benefits as per Company policy.')}

11. ${govLaw(f, `the Indian Contract Act, 1872, Industrial Disputes Act, 1947, Shops and Commercial Establishments Act, Payment of Wages Act, Payment of Gratuity Act, Employees\' Provident Funds Act, and all other applicable labour laws`)}

12. ENTIRE AGREEMENT
    This Contract, along with the Offer Letter, constitutes the entire agreement and supersedes all prior negotiations. Any amendment shall be in writing signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Contract on the date first above written.

________________________          ________________________
FOR EMPLOYER                      EMPLOYEE
${v(f.companyName)}               ${v(f.employeeName)}
Authorised Signatory              Date: ${fmtDate(f.joiningDate)}

${witnessBlock}`;
},

offer_letter:f=>`OFFER LETTER

${v(f.employerName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref: ${v(f.employerName).replace(/\s/g,'').substring(0,4).toUpperCase()}/OL/${new Date().getFullYear()}/${RN()}

To,
${v(f.candidateName)}

Dear ${v(f.candidateName)},

SUBJECT: OFFER OF EMPLOYMENT — ${v(f.designation).toUpperCase()}

We are pleased to offer you the position of ${v(f.designation)}${f.department?', '+v(f.department)+' Department,':''} at ${v(f.employerName)}.

1. DESIGNATION: ${v(f.designation)}
2. DATE OF JOINING: ${fmtDate(f.joiningDate)}
3. WORK LOCATION: ${v(f.workLocation||v(f.city))}
4. COMPENSATION: ${v(f.salary)}
5. PROBATION: ${v(f.probation||'3-6 months')} from date of joining.
6. LEAVE: As per Company Leave Policy.
7. CONDITIONS: This offer is subject to satisfactory background verification, medical examination, and submission of original certificates.

Please confirm your acceptance by signing and returning a copy of this letter on or before ${fmtDate(f.joiningDate)}.

We look forward to welcoming you to our team.

Yours sincerely,

________________________
${v(f.hrName||'Authorised Signatory')}
${v(f.employerName)}
Date: ${fmtDate(f.date)}

ACCEPTANCE:
I, ${v(f.candidateName)}, accept this offer on the terms stated above.
Signature: _______________ Date: _______________`,

experience_cert:f=>`EXPERIENCE CERTIFICATE

${v(f.employerName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: EXP/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.employeeName)} was employed with ${v(f.employerName)} from ${fmtDate(f.fromDate)} to ${fmtDate(f.toDate)}.

Designation: ${v(f.designation)}
${f.responsibilities&&f.responsibilities.trim()?'Key Responsibilities:\n'+v(f.responsibilities):''}

During this period, ${v(f.employeeName)}'s performance and conduct have been ${v(f.conduct||'satisfactory')}. He/She has demonstrated dedication, professionalism and a positive attitude.

All dues are settled. No amounts are outstanding from our end.

We wish ${v(f.employeeName)} all the best in future endeavours.

________________________
Authorised Signatory
${v(f.employerName)}
(Company Seal)`,

legal_notice:f=>{
  const deadline = vo(f.responseDeadline) || '15';
  const deadlineDate = addDays(f.date || today, parseInt(deadline));
  return `${docHeader('LEGAL NOTICE','LN',f)}

SENT BY: Registered Post A.D. / Speed Post / E-mail with Read Receipt

FROM:
${v(f.senderName)}
${v(f.senderAddress)}, ${v(f.city)}, Kerala — ${v(f.senderPincode||'___')}
Mobile: ${v(f.senderPhone||'___')}
Email: ${v(f.senderEmail||'___')}

Date: ${fmtDate(f.date)}

TO,
${v(f.recipientName)}
${v(f.recipientAddress||'___')}

SUBJECT: LEGAL NOTICE — ${v(f.subject||'DEMAND FOR COMPLIANCE / PAYMENT / REDRESSAL')}

Under instructions from and on behalf of my client, ${v(f.senderName)}, I do hereby serve upon you this Legal Notice as follows:

1. BACKGROUND AND FACTS
   ${v(f.facts)}

2. CAUSE OF ACTION
   ${v(f.causeOfAction||'The above acts / omissions constitute a legal wrong / breach of contract / statutory violation giving rise to the present cause of action against you.')}

3. LEGAL BASIS
   My client's claim is founded on the following legal provisions:
   ${v(f.legalBasis||'(a) Indian Contract Act, 1872 — breach of contract; (b) Bharatiya Nyaya Sanhita (BNS), 2023; (c) Consumer Protection Act, 2019 — deficiency in service; (d) Any other applicable law.')}

4. DEMAND
   In view of the above, I, on behalf of my client, hereby demand that you, within ${deadline} (${toWords(parseInt(deadline))}) days from the date of receipt of this notice (i.e., on or before ${fmtDate(deadlineDate)}), take the following steps:
   ${v(f.demand)}

5. CONSEQUENCE OF NON-COMPLIANCE
   Please take notice that if you fail or neglect to comply with this Notice within the stipulated period, my client shall be constrained, without any further notice, to initiate appropriate legal proceedings against you, including but not limited to:
   (a) A civil suit for recovery of dues and damages.
   (b) A criminal complaint under applicable provisions of the Bharatiya Nyaya Sanhita (BNS), 2023 / Negotiable Instruments Act, 1881.
   (c) A consumer complaint before the District / State / National Consumer Disputes Redressal Commission.
   (d) Any other remedy available under law.
   All costs of such proceedings shall be recoverable from you.

6. RESERVATION OF RIGHTS
   This notice is issued without prejudice to any other right, remedy or cause of action available to my client in law or equity, all of which are expressly reserved.

7. ACCEPTANCE OF SERVICE
   Please acknowledge receipt of this notice by return post / email within 48 hours.

Thanking you,

________________________
${v(f.advocateName||f.senderName)}
${vo(f.advocateName) ? 'Advocate — Enrolment No: '+v(f.advocateEnrolment||'___') : ''}
On behalf of: ${v(f.senderName)}
Place: ${v(f.city)}, Kerala
Date: ${fmtDate(f.date)}

─────────────────────────────
DISPATCH DETAILS (for office record)
─────────────────────────────
Sent by   : Registered Post A.D. / Speed Post
Sent on   : ${fmtDate(f.date)}
Postal Ref: _______________
Delivered : _______________  Signature: _______________`;
},

marriage_affidavit:f=>`JOINT MARRIAGE AFFIDAVIT

STATE OF KERALA — DISTRICT OF ${v(f.city).toUpperCase()}

We, the undersigned, do hereby jointly solemnly affirm and state on oath as follows:

HUSBAND: ${v(f.husbandName)}, son of ${v(f.husbandFather)}, aged ${v(f.husbandAge)} years.
WIFE: ${v(f.wifeName)}, daughter of ${v(f.wifeFather)}, aged ${v(f.wifeAge)} years.

1. We state that we were married to each other on ${fmtDate(f.marriageDate)} at ${v(f.marriagePlace)}, in accordance with ${v(f.marriageType)} rites and ceremonies, in the presence of family members and friends.

2. At the time of our marriage:
   (a) The Husband was above 21 years of age.
   (b) The Wife was above 18 years of age.
   (c) Both of us were of sound mind and competent to contract marriage.

3. Neither of us was married to any other person at the time of this marriage. No subsisting valid marriage existed with any other person. We are not within the prohibited degrees of relationship under applicable personal law.

4. Our marriage was solemnised with the free and full consent of both parties and their families.

5. We have been living together as husband and wife since the date of our marriage at: ${v(f.address)}.

6. This affidavit is being made for: marriage certificate, name change in official documents, opening joint bank account, and all other legal / official purposes.

VERIFICATION: Verified at ${v(f.marriagePlace||f.city)} on ${fmtDate(f.date)}.

________________________     ________________________
HUSBAND                      WIFE
${v(f.husbandName)}          ${v(f.wifeName)}

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public / Oath Commissioner (Seal & Stamp)`,

gap_certificate:f=>`AFFIDAVIT / GAP CERTIFICATE

STATE OF KERALA

I, ${v(f.studentName)}, son/daughter of ${v(f.fatherName)}, residing at ${v(f.address)}, do hereby solemnly affirm and state on oath as follows:

1. I have completed my ${v(f.lastQualification)} from ${v(f.lastInstitution)}.

2. I state that there has been a gap in my academic career from ${v(f.gapFrom)} to ${v(f.gapTo)}.

3. The reason for the above gap is: ${v(f.gapReason)}.

4. I state that during the said gap period:
   (a) I was not enrolled as a regular student in any educational institution.
   (b) I was not involved in any activities that are anti-national, criminal or unlawful.
   (c) No criminal case or FIR has been filed or is pending against me.
   (d) I was engaged in activities related to the reason stated above.

5. I am now ready to resume my studies and am committed to completing the same successfully.

6. This affidavit is being submitted for the purpose of seeking admission / application and may be placed on record accordingly.

7. I am fully aware that any false statement is punishable under applicable law.

VERIFICATION: Verified at _______ on ${fmtDate(f.date)}.

________________________     ________________________
DEPONENT (STUDENT)           PARENT / GUARDIAN
${v(f.studentName)}

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public (Seal & Stamp)`,

money_receipt:f=>`MONEY RECEIPT

Receipt No: MR-${new Date().getFullYear()}-${RN()}${RN()}
Date: ${fmtDate(f.date)}

RECEIVED WITH THANKS FROM: ${v(f.payerName)}

AMOUNT RECEIVED: ${amt(f.amount)}

MODE OF PAYMENT: ${v(f.paymentMode)}

PURPOSE / BEING PAYMENT FOR: ${v(f.purpose)}

I, ${v(f.receiverName)}, hereby acknowledge receipt of the above amount from ${v(f.payerName)}.

This receipt is valid subject to realisation of the amount in case of cheque payment.

                    ________________________
                    ${v(f.receiverName)}
                    Date: ${fmtDate(f.date)}`,

rent_receipt:f=>`HOUSE RENT RECEIPT

Receipt No: RR-${new Date().getFullYear()}-${RN()}${RN()}
Date: ${fmtDate(f.date)}

Received from:    ${v(f.tenantName)}
Amount:           ${amt(f.rentAmount)}
Being rent for:   ${v(f.month)}
For property:     ${v(f.propertyAddress)}
Payment mode:     ${v(f.paymentMode)}

Rent Due:         ${amt(f.rentAmount)}
Amount Received:  ${amt(f.rentAmount)}
Balance:          NIL

I, ${v(f.landlordName)}, acknowledge receipt of the above rent.

                    ________________________
                    ${v(f.landlordName)} (Landlord)
                    Date: ${fmtDate(f.date)}`,

noc:f=>`NO OBJECTION CERTIFICATE (NOC)

Date: ${fmtDate(f.date)}
Ref. No: NOC/${new Date().getFullYear()}/${RN()}
${f.validUntil&&f.validUntil.trim()?'Valid Until: '+fmtDate(f.validUntil):''}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that I / We, ${v(f.issuedBy)}${f.issuedByDesig&&f.issuedByDesig.trim()?', '+v(f.issuedByDesig)+',':''} residing / having office at ${v(f.address)}, ${v(f.city)}, hereby issue this No Objection Certificate in favour of ${v(f.issuedTo)}.

PURPOSE: ${v(f.purpose)}

I / We hereby unequivocally declare and confirm that I / We have NO OBJECTION WHATSOEVER to ${v(f.issuedTo)} proceeding with / undertaking the purpose stated above.

CONDITIONS: ${f.conditions&&f.conditions.trim()?v(f.conditions):'This NOC is issued unconditionally.'}

TERMS:
1. This NOC is issued solely for the purpose mentioned above and shall not confer any other right beyond what is expressly stated.
2. The issuing authority shall not be liable for any third-party claims arising from activities undertaken pursuant to this NOC.
3. ${f.validUntil&&f.validUntil.trim()?'Valid until: '+fmtDate(f.validUntil):'Valid for the duration of the stated purpose.'}

Issued at ${v(f.city)} on ${fmtDate(f.date)}.

                    ________________________
                    ${v(f.issuedBy)}
                    ${f.issuedByDesig&&f.issuedByDesig.trim()?v(f.issuedByDesig):''}
                    (Seal / Stamp if applicable)`,

cheque_bounce_notice:f=>{
  const bounceDate = vo(f.bounceDate) || v(f.date);
  const deadline30 = addDays(f.bounceDate || f.date, 30);
  const deadline15 = addDays(deadline30, 15);
  return `${docHeader('LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881','NI138',f)}

SENT BY: Registered Post A.D. (Mandatory for Section 138 proceedings)

FROM:
${v(f.senderName)}
${v(f.senderAddress)}, ${v(f.city)}, Kerala — ${v(f.senderPincode||'___')}
Mobile: ${v(f.senderPhone||'___')}

Date of Notice: ${fmtDate(f.date)}

TO,
${v(f.recipientName)}
${v(f.recipientAddress||'___')}

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 — CHEQUE NO. ${v(f.chequeNumber)} DATED ${fmtDate(f.chequeDate)} FOR ${amt(f.chequeAmount)} RETURNED UNPAID — DEMAND FOR PAYMENT WITHIN 15 DAYS

Sir / Madam,

Under instructions from and on behalf of my client, ${v(f.senderName)}, I hereby serve upon you this statutory legal notice under Section 138 read with Section 142 of the Negotiable Instruments Act, 1881, as under:

─────────────────────────────
CHEQUE PARTICULARS
─────────────────────────────
  Cheque Number   : ${v(f.chequeNumber)}
  Drawn on Bank   : ${v(f.bankName)}, ${v(f.bankBranch||f.city)} Branch
  Cheque Date     : ${fmtDate(f.chequeDate)}
  Cheque Amount   : ${amt(f.chequeAmount)}
  Memo / Reason   : ${v(f.chequeReason||'in discharge of a legally enforceable debt / liability')}
  Date Presented  : ${fmtDate(f.presentationDate||f.chequeDate)}
  Date of Return  : ${fmtDate(bounceDate)}
  Return Reason   : ${v(f.returnReason||'Insufficient Funds / Funds Insufficient / Account Closed / Signature Mismatch')}
─────────────────────────────

1. FACTS AND BACKGROUND
   My client ${v(f.senderName)} and you had entered into a transaction / arrangement whereby you are indebted to my client in a sum of ${amt(f.chequeAmount)} in respect of: ${v(f.debtDescription||'a legally enforceable debt / liability')}.

2. THE DISHONOURED CHEQUE
   In partial / full discharge of the above legally enforceable liability, you issued Cheque No. ${v(f.chequeNumber)} dated ${fmtDate(f.chequeDate)} for ${amt(f.chequeAmount)}, drawn on ${v(f.bankName)}, ${v(f.bankBranch||f.city)} Branch, in favour of my client.

3. DISHONOUR
   When the said cheque was presented for encashment on ${fmtDate(f.presentationDate||f.chequeDate)}, it was returned unpaid by your bank on ${fmtDate(bounceDate)} with the memo: "${v(f.returnReason||'Insufficient Funds')}".

4. LEGAL POSITION
   (a) The dishonour of the said cheque constitutes a criminal offence under Section 138 of the Negotiable Instruments Act, 1881 (as amended by the Negotiable Instruments (Amendment) Act, 2018), punishable with imprisonment of up to 2 years, or fine up to twice the cheque amount, or both.
   (b) This notice is being issued within 30 days of the date of receipt of the dishonour memo, in strict compliance with the proviso to Section 138(b) of the NI Act.
   (c) You are hereby given 15 days from receipt of this notice to make payment — in compliance with Section 138(c) of the NI Act.

5. STATUTORY DEMAND
   You are hereby called upon to pay my client the sum of ${amt(f.chequeAmount)}, being the cheque amount, together with:
   (a) Bank charges incurred on dishonour: ${amt(f.bankCharges||'___')}
   (b) Interest at 18% per annum from the date of dishonour
   within 15 (Fifteen) days from the date of receipt of this notice, i.e., on or before approximately ${fmtDate(deadline15)}.

6. CONSEQUENCE OF NON-PAYMENT
   If you fail to make payment within the above period, my client shall be constrained, without any further notice, to file a criminal complaint against you under Section 138 / 141 of the Negotiable Instruments Act, 1881 before the competent Judicial Magistrate / Metropolitan Magistrate at ${v(f.city)}, Kerala, and also pursue all civil remedies including filing a money suit for recovery with interest and costs. You shall be solely responsible for all legal consequences and costs.

Yours faithfully,

________________________
${v(f.advocateName||f.senderName)}
${vo(f.advocateName) ? 'Advocate, Bar Enrolment No: '+v(f.advocateEnrolment||'___') : ''}
On behalf of: ${v(f.senderName)}
Place: ${v(f.city)}, Kerala
Date: ${fmtDate(f.date)}

─────────────────────────────
OFFICE RECORD
─────────────────────────────
Registered Post No. : _______________
Sent on             : ${fmtDate(f.date)}
30-day limit expires: ${fmtDate(deadline30)}
15-day reply deadline: ${fmtDate(deadline15)}
─────────────────────────────
⚠ CRITICAL: File criminal complaint within 30 days from expiry of 15-day notice period if payment not received.`;
},

consumer_complaint:f=>{
  const forum = parseInt(f.claimAmount || 0) <= 5000000 ? 'District Consumer Disputes Redressal Commission' :
                parseInt(f.claimAmount || 0) <= 20000000 ? 'State Consumer Disputes Redressal Commission' :
                'National Consumer Disputes Redressal Commission (NCDRC)';
  return `${docHeader('CONSUMER COMPLAINT','CC',f)}

BEFORE THE ${forum.toUpperCase()}
${v(f.city).toUpperCase()}, KERALA

Consumer Complaint No: _______________

IN THE MATTER OF:

COMPLAINANT:
  ${v(f.complainantName)}
  ${v(f.complainantAddress)}, ${v(f.city)}, Kerala
  Mobile: ${v(f.complainantPhone||'___')}
  Email : ${v(f.complainantEmail||'___')}
  (hereinafter referred to as "the Complainant")

VERSUS

OPPOSITE PARTY / RESPONDENT:
  ${v(f.oppPartyName)}
  ${v(f.oppPartyAddress||'___')}
  (hereinafter referred to as "the Opposite Party")

─────────────────────────────
COMPLAINT UNDER SECTIONS 34/35/58 OF THE CONSUMER PROTECTION ACT, 2019
─────────────────────────────

RESPECTFULLY SHOWETH:

1. JURISDICTION
   The Complainant's claim amounts to ${amt(f.claimAmount)}, which is within the pecuniary jurisdiction of this Hon'ble ${forum}. The cause of action arose at ${v(f.city)}, Kerala, within the territorial jurisdiction of this Forum.

2. STATUS OF COMPLAINANT
   The Complainant is a "consumer" as defined under Section 2(7) of the Consumer Protection Act, 2019, having purchased goods / availed services from the Opposite Party for consideration for personal use and not for commercial resale.

3. TRANSACTION DETAILS
   ${v(f.transactionDetails)}
   Date of Purchase / Service: ${fmtDate(f.transactionDate)}
   Invoice / Order No.: ${v(f.invoiceNumber||'___')}
   Amount Paid: ${amt(f.amountPaid||f.claimAmount)}

4. GRIEVANCE / DEFICIENCY
   ${v(f.grievance)}

   The above acts / omissions of the Opposite Party constitute:
   (a) "Deficiency in service" as defined under Section 2(11) of the Consumer Protection Act, 2019;
   (b) "Unfair trade practice" as defined under Section 2(47) of the Act;
   (c) Supply of defective goods under Section 2(10) of the Act (if applicable).

5. PREVIOUS COMPLAINT / NOTICE
   The Complainant had previously brought the grievance to the notice of the Opposite Party on ${fmtDate(f.previousComplaintDate||'___')} vide: ${v(f.previousComplaintRef||'verbal complaint / written complaint / email')}. The Opposite Party has either not responded or has failed to provide a satisfactory resolution.

6. RELIEF CLAIMED
   In view of the above, the Complainant most respectfully prays that this Hon'ble Commission may be pleased to:
   (a) ${v(f.primaryRelief||'Direct the Opposite Party to refund the amount paid with interest @ 18% p.a.')}
   (b) Award compensation of ${amt(f.compensationClaimed||'0')} for mental agony, harassment, inconvenience and loss suffered.
   (c) Award punitive damages under Section 39(1)(d) of the Consumer Protection Act, 2019.
   (d) Award costs of this complaint including advocate's fees.
   (e) Pass such other and further orders as this Hon'ble Commission deems fit and proper in the interest of justice.

TOTAL CLAIM: ${amt(f.claimAmount)}

7. LIMITATION
   The cause of action arose on ${fmtDate(f.transactionDate||f.date)} and this complaint is filed within 2 years thereof as required under Section 69 of the Consumer Protection Act, 2019.

8. DECLARATION
   The Complainant declares that:
   (a) This complaint is not filed for any vexatious or frivolous purpose.
   (b) The matter is not pending before any other court or forum.
   (c) All facts stated herein are true and correct to the best of the Complainant's knowledge.

PRAYER: It is, therefore, most respectfully prayed that this Hon'ble Commission may be pleased to allow this complaint with costs.

Date: ${fmtDate(f.date)}
Place: ${v(f.city)}, Kerala

________________________
${v(f.complainantName)}
COMPLAINANT

Enclosures:
1. Copy of invoice / bill / order confirmation
2. Copy of previous complaint / correspondence
3. Copy of warranty card (if applicable)
4. Photographs / evidence of defect (if applicable)
5. Any other supporting documents`;
},

poa_general:f=>{
  const isMutual = false;
  const powers = vo(f.specificPowers) || 'all matters as set out below';
  return `${docHeader('GENERAL POWER OF ATTORNEY','GPA',f)}

KNOW ALL MEN BY THESE PRESENTS that I, ${v(f.principalName)}, ${relation({gender:f.principalGender})} ${v(f.principalFather||'___')}, aged ${age({age:f.age})}, residing at ${v(f.principalAddress||f.city)}, ${v(f.city)}, Kerala, Aadhaar No. ${v(f.principalAadhaar||'XXXX-XXXX-XXXX')} (hereinafter referred to as "the Principal"), do hereby nominate, constitute and appoint:

MY ATTORNEY:
  Full Name    : ${v(f.attorneyName)}
  ${relation({gender:f.attorneyGender})} : ${v(f.attorneyFather||'___')}
  Address      : ${v(f.attorneyAddress||f.city)}, Kerala
  Aadhaar No.  : ${v(f.attorneyAadhaar||'XXXX-XXXX-XXXX')}
  (hereinafter referred to as "my Attorney" or "the Attorney-in-Fact")

as my true and lawful Attorney to act on my behalf for the following purposes:

PURPOSE / REASON FOR POWER OF ATTORNEY:
${v(f.purpose)}

POWERS GRANTED

The Attorney is hereby authorised and empowered to do, execute and perform all or any of the following acts, deeds and things on my behalf:

${v(f.specificPowers || `A. GENERAL POWERS
   1. To represent me before all courts, tribunals, authorities and government offices in all proceedings.
   2. To sign, execute, verify and file all plaints, written statements, petitions, appeals, applications, affidavits and other documents.
   3. To appoint and engage advocates, pleaders and agents as the Attorney deems fit.
   4. To receive notices, summons and correspondence on my behalf.

B. FINANCIAL POWERS
   5. To operate my bank accounts, sign cheques, demand drafts and withdrawal forms.
   6. To receive and give receipts for all monies due to me.
   7. To execute, sign and deliver all financial instruments.

C. PROPERTY POWERS
   8. To manage, let, lease, sell, mortgage, charge or otherwise deal with my immovable property.
   9. To sign, execute and register all deeds, agreements and documents relating to property.
   10. To take or give possession of property on my behalf.

D. GENERAL
   11. To do all such other acts, deeds and things as may be necessary or incidental to the above.`)}

RATIFICATION
I hereby agree to ratify and confirm all acts done by my Attorney in the exercise of the powers hereby granted.

INDEMNITY
I shall be bound by and shall indemnify all persons dealing with my Attorney in good faith in reliance of this Power of Attorney.

REVOCATION
This Power of Attorney shall remain in force until revoked by me by a registered instrument sent to my Attorney. ${vo(f.expiryDate) ? `This Power of Attorney shall automatically expire on ${fmtDate(f.expiryDate)}.` : 'This Power of Attorney is valid until further notice.'}

IN WITNESS WHEREOF, I, the above-named Principal, have subscribed my signature and set my hand to this Power of Attorney at ${v(f.city)}, Kerala, on this ${fmtDate(f.date)}.

                              ________________________
                              PRINCIPAL
                              ${v(f.principalName)}
                              Date: ${fmtDate(f.date)}

${witnessBlock}

─────────────────────────────
ACCEPTANCE BY ATTORNEY
─────────────────────────────
I, ${v(f.attorneyName)}, hereby accept this Power of Attorney and the powers conferred upon me and agree to act faithfully within the scope of authority so granted.

________________________
ATTORNEY-IN-FACT
${v(f.attorneyName)}
Date: _______________

─────────────────────────────
NOTARY ATTESTATION
─────────────────────────────
${notaryBlock}

${stampHint('default')}
⚠ For property transactions, this POA MUST be registered with the Sub-Registrar's Office under the Registration Act, 1908.`;
},

address_proof:f=>`AFFIDAVIT FOR PROOF OF RESIDENTIAL ADDRESS

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.currentAddress)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and I am fully competent to swear this affidavit. I make this affidavit from my personal knowledge.

2. That I am an Indian national and a permanent resident of the State of Kerala.

3. That my current and permanent residential address is:
   ${v(f.currentAddress)}, ${v(f.city)}, Kerala.

4. That I have been continuously and uninterruptedly residing at the above stated address since the year ${v(f.sinceYear)}, and the said address is my true, actual and permanent place of residence.

5. That I am residing at the above address in my capacity as owner / tenant / family member / paying guest (as applicable).

6. That I declare that the above stated address is correct and genuine. All official correspondence, notices and communications addressed to me at the above address shall be received by me.

7. That I undertake to inform the concerned authority / institution immediately in writing of any change in my residential address in the future.

8. That I am submitting this affidavit for official purposes — including but not limited to — applying for Aadhaar Card, Passport, Bank Account, Voter ID, Government Employment, or any other official purpose as may be required.

9. That all facts stated herein are true and correct to the best of my knowledge, information and belief. No part of this affidavit is false and nothing material has been concealed or suppressed therefrom.

10. I am fully aware that making a false affidavit is a punishable offence under Section 191 read with Section 193 of the Indian Penal Code / Section 218 read with Section 221 of the Bharatiya Nyaya Sanhita (BNS), 2023.

VERIFICATION

I, ${v(f.fullName)}, the deponent above named, do hereby verify on solemn affirmation that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Verified at ${v(f.city)} on this ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}
                                        S/o D/o W/o: ${v(f.fatherName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala`,

income_affidavit:f=>`AFFIDAVIT DECLARING ANNUAL INCOME

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, occupation: ${v(f.occupation)}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit and I make it from my personal knowledge.

2. That I am presently engaged in / employed as: ${v(f.occupation)}.

3. That my source(s) of income is/are: ${v(f.incomeSource)}.

4. That my total annual income from all sources for the current financial year is:
   ${amt(f.annualIncome)}
   (Rupees ${toWords(parseInt(f.annualIncome||0))} Only)

5. Breakup of Annual Income:
   (a) Income from salary / business / profession / agriculture: Rs. ${parseInt(f.annualIncome||0).toLocaleString('en-IN')}/-
   (b) Income from house property: Rs. Nil / As applicable
   (c) Income from other sources: Rs. Nil / As applicable
   (d) TOTAL ANNUAL INCOME: ${amt(f.annualIncome)}

6. That I declare that the above stated income figure is true, complete and correct to the best of my knowledge. I have not concealed any source of income or suppressed any material information.

7. That I am responsible for the payment of all applicable income taxes, if any, on the above income as per the provisions of the Income Tax Act, 1961.

8. That I am not an income-tax assessee / I am an income-tax assessee bearing PAN No. ___________ (as applicable).

9. That I am making this affidavit for the purpose of: obtaining income certificate / admission in educational institution / applying for government scheme / subsidy / any other official purpose as required.

10. That all facts stated herein are true and correct to the best of my knowledge, information and belief. No part of this affidavit is false.

VERIFICATION

I, ${v(f.fullName)}, the deponent above named, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala`,

auth_letter:f=>`LETTER OF AUTHORIZATION

Date: ${fmtDate(f.date)}
Ref. No: AUTH/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

I, ${v(f.principalName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, hereby authorize and empower ${v(f.agentName)}, ${v(f.agentRelation)}, to act as my authorized representative for the specific purposes stated below.

DETAILS OF AUTHORIZED REPRESENTATIVE:
Full Name: ${v(f.agentName)}
Relationship to me: ${v(f.agentRelation)}

SCOPE OF AUTHORIZATION:
${v(f.purpose)}

TERMS AND CONDITIONS OF THIS AUTHORIZATION:

1. The authorized representative, ${v(f.agentName)}, is hereby empowered to sign, execute, submit, present, receive and collect all documents, papers, applications, receipts, cheques, drafts, correspondence and other instruments related to the above-stated purpose on my behalf.

2. All acts, deeds and things done or caused to be done by ${v(f.agentName)} within the scope of this authorization shall be binding upon me as if I had personally done them. I hereby ratify and confirm all acts lawfully done pursuant to this letter.

3. ${v(f.agentName)} shall act strictly within the scope of this authorization and shall not exceed the authority granted herein without my prior written consent.

4. This Letter of Authorization is valid ${f.validUntil && f.validUntil.trim() ? `from ${fmtDate(f.date)} until ${fmtDate(f.validUntil)}` : `until the completion of the stated purpose, or until revoked in writing by me`}, whichever is earlier.

5. I reserve the absolute right to revoke this authorization at any time by giving written notice to all concerned parties.

6. This authorization is issued for the specific purpose mentioned above only and shall not be construed to grant any general authority or power over my affairs.

7. Third parties acting in good faith on the basis of this authorization shall not be held liable for acts done by my authorized representative within the scope hereof.

Signed at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        AUTHORIZING PERSON
                                        Name: ${v(f.principalName)}
                                        Address: ${v(f.address)}, ${v(f.city)}

WITNESS:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

ACKNOWLEDGEMENT BY AUTHORIZED REPRESENTATIVE:
I, ${v(f.agentName)}, hereby acknowledge receipt of this Letter of Authorization and confirm that I understand and accept the responsibilities delegated to me.

Signature: _______________________  Date: _______________`,

domicile_affidavit:f=>`AFFIDAVIT OF DOMICILE / RESIDENTIAL STATUS

STATE OF KERALA
DISTRICT OF ${v(f.district).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, aged ${v(f.age)} years, presently residing at ${v(f.address)}, ${v(f.district)}, ${v(f.state)}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That I am an Indian national by birth / by naturalisation (as applicable).

3. That I am a bona fide domicile of the State of ${v(f.state)} having been born in / residing in the said State since the year ${v(f.sinceYear)}.

4. That my permanent residential address is:
   ${v(f.address)}, ${v(f.district)}, ${v(f.state)}.

5. That I have been continuously and uninterruptedly residing in the State of ${v(f.state)} since ${v(f.sinceYear)} and my domicile is in the State of ${v(f.state)}.

6. That I am not a domicile of any other State or Union Territory and I have not acquired domicile in any other State or country.

7. That I am making this affidavit for the purpose of: ${v(f.reason)}, and for all other connected official purposes.

8. That all the above facts are true, correct and to the best of my knowledge and belief. No part of this affidavit is false and nothing material has been concealed therefrom.

VERIFICATION

I, ${v(f.fullName)}, the deponent above named, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed or suppressed therefrom.

Verified at ${v(f.district)} on this ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.district)}, ${v(f.state)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.district)}, ${v(f.state)}`,

dob_affidavit:f=>`AFFIDAVIT REGARDING DATE OF BIRTH

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter of ${v(f.fatherName)} and ${v(f.motherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am making this affidavit from my personal knowledge and the knowledge of my family.

2. That my correct and actual date of birth is: ${fmtDate(f.dob)}.

3. That I was born at: ${v(f.birthPlace)}.

4. That the reason for swearing this affidavit regarding my date of birth is: ${v(f.reason)}.

5. That due to the above stated reason, a birth certificate recording my correct date of birth is not available / there is a discrepancy in the recorded date of birth in official documents, and I am therefore filing this affidavit to establish my correct date of birth.

6. That my parents, namely ${v(f.fatherName)} (Father) and ${v(f.motherName)} (Mother), have confirmed and certified that my date of birth is ${fmtDate(f.dob)} as stated above.

7. That based on my date of birth as stated above, I am currently ___ years of age.

8. That I request all concerned government authorities, educational institutions, banks, employers and all other bodies to record my date of birth as ${fmtDate(f.dob)} in their records.

9. That I am making this affidavit voluntarily and in good faith. No part of this affidavit is false or motivated by any fraudulent intention.

10. That all facts stated herein are true and correct to the best of my knowledge and belief. Nothing material has been concealed therefrom.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

CONFIRMATION BY PARENT(S):
We, ${v(f.fatherName)} and ${v(f.motherName)}, confirm that the date of birth of ${v(f.fullName)} stated above is correct.

________________________          ________________________
Father: ${v(f.fatherName)}         Mother: ${v(f.motherName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

single_status:f=>`AFFIDAVIT OF SINGLE / UNMARRIED STATUS

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter of ${v(f.fatherName)}, aged ${v(f.age)} years, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That I am an Indian national and a citizen of India.

3. That I am currently UNMARRIED / SINGLE and have never been married to any person, at any time, under any law, custom or religion applicable to me.

4. That I am not a widower / widow.

5. That I am not a divorcee. No divorce decree has been passed against me or in my favour by any court of law.

6. That I am not living in any live-in relationship or domestic partnership with any person.

7. That no matrimonial proceedings / divorce proceedings are pending against me or filed by me in any court of law in India or abroad.

8. That I am not within the degrees of prohibited relationship with any person I intend to marry under the applicable law.

9. That I am making this affidavit for the purpose of: ${v(f.purpose)}.

10. That all facts stated herein are true and correct to the best of my knowledge and belief. I am fully aware that making a false affidavit is punishable under Section 193 of the Indian Penal Code / Section 221 of the Bharatiya Nyaya Sanhita (BNS), 2023 and also under Section 13 of the Hindu Marriage Act, 1955 / applicable personal law.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}
                                        S/o D/o: ${v(f.fatherName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala`,

nationality_affidavit:f=>`AFFIDAVIT REGARDING INDIAN NATIONALITY / CITIZENSHIP

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter of ${v(f.fatherName)}, aged ___ years, residing at ${v(f.address)}, ${v(f.city)}, Kerala, India, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That I am a citizen of India by birth. I was born on ${fmtDate(f.dob)} at ${v(f.birthPlace)}.

3. That I have been residing in India continuously. My permanent residential address in India is:
   ${v(f.address)}, ${v(f.city)}, Kerala, India.

4. That I hold the following Indian identity documents (as applicable):
   (a) Aadhaar Card No.: XXXX-XXXX-____
   (b) PAN Card No.: __________
   (c) Passport No.: __________ (if applicable)
   (d) Voter ID No.: __________ (if applicable)

5. That I have not acquired citizenship of any other country. I have not renounced my Indian citizenship. I do not hold dual citizenship.

6. That I am making this affidavit for the purpose of: ${v(f.purpose)}.

7. That I am not involved in any activities against the sovereignty, integrity or security of India.

8. That all facts stated herein are true and correct to the best of my knowledge, information and belief. No part of this affidavit is false and nothing material has been concealed therefrom.

9. I am fully aware that a false declaration regarding citizenship is an offence punishable under the Citizenship Act, 1955 and other applicable laws.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala`,

caste_affidavit:f=>`AFFIDAVIT REGARDING CASTE / COMMUNITY / CATEGORY

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am making this affidavit from my personal knowledge and the knowledge of my family.

2. That I belong to the ${v(f.caste)} community / sub-caste, which falls under the ${v(f.category)} category as per the relevant Central Government / State Government lists and notifications issued under the Constitution of India.

3. That my caste / community has been duly notified and included in the official list of Scheduled Castes / Scheduled Tribes / Other Backward Classes / Economically Weaker Sections, as applicable, for the State of Kerala, by the competent government authority.

4. That neither I nor any member of my immediate family has obtained any employment or educational benefit by falsely claiming to belong to any other caste or category.

5. That I have never been debarred or prevented from claiming the benefits of the ${v(f.category)} category by any government authority or court of law.

6. That I am making this affidavit for the purpose of: ${v(f.purpose)}.

7. That a formal Caste Certificate / Community Certificate from the competent authority is either attached or shall be submitted separately.

8. That I fully understand that submission of a false caste certificate or false affidavit is a cognizable criminal offence punishable under the Indian Penal Code / Bharatiya Nyaya Sanhita, 2023, and shall also result in cancellation of any benefits obtained thereby.

9. That all facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

ews_affidavit:f=>`AFFIDAVIT FOR ECONOMICALLY WEAKER SECTION (EWS) CERTIFICATE

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That my family does not belong to any Scheduled Caste (SC), Scheduled Tribe (ST), Other Backward Classes (OBC - Central List), or any other category notified for reservations as per existing Government orders.

3. That my family's gross annual income from all sources for the preceding financial year is:
   ${amt(f.annualIncome)}
   (Rupees ${toWords(parseInt(f.annualIncome||0))} Only)
   This includes income from all sources — salary, agriculture, business, and all other sources.

4. That my family does not own or possess any of the following assets:
   (a) Five (5) acres or more of agricultural land; AND
   (b) Residential flat / house of 1000 square feet or more; AND
   (c) Residential plot of 100 square yards or more in notified municipal areas; AND
   (d) Residential plot of 200 square yards or more in non-notified / rural areas.

   Description of assets owned by my family:
   ${v(f.assets)}

5. That based on the above, I satisfy the criteria prescribed under OM No. 36039/1/2019-Estt(Res) dated 31st January 2019 issued by the Department of Personnel and Training, Government of India, for the Economically Weaker Sections category.

6. That I am making this affidavit for the purpose of: ${v(f.purpose)}.

7. That I am fully aware that providing false information for obtaining EWS reservation benefits is a criminal offence under the Bharatiya Nyaya Sanhita, 2023, and shall result in cancellation of all benefits and legal prosecution.

8. That all facts stated herein are true and correct to the best of my knowledge, information and belief. Nothing material has been concealed therefrom.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

[Note: This affidavit must be supported by an income certificate from the competent revenue authority. The EWS certificate shall be issued by a competent authority as notified by the Government of Kerala.]`,

id_theft_affidavit:f=>`AFFIDAVIT REGARDING LOSS / THEFT OF IDENTITY DOCUMENTS

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and I make this affidavit from my personal knowledge.

2. That the following identity and important documents belonging to me have been lost / stolen / misplaced under the circumstances described below:

   DOCUMENTS LOST / STOLEN:
   ${v(f.lostDocuments)}

3. That the circumstances under which the above documents were lost / stolen are as follows:
   ${v(f.circumstances)}

4. ${f.firNumber && f.firNumber.trim() ? `That I have filed a complaint / FIR at ${v(f.policeStation)} Police Station, bearing FIR No. ${v(f.firNumber)}, regarding the loss / theft of the above documents.` : `That I have reported the matter to ${v(f.policeStation||'the concerned police station')} and have taken steps to prevent any misuse of the said documents.`}

5. That I hereby solemnly declare that:
   (a) The above documents have NOT been pledged, mortgaged, deposited or handed over to any person for any purpose.
   (b) I have not applied for or obtained duplicate copies of the said documents from any authority before making this declaration.
   (c) The above documents are not being used by me or any other person for any unauthorized purpose.
   (d) I shall not use the original documents if found in the future, and I shall immediately surrender them to the issuing authority.

6. That I hereby request the concerned authorities to:
   (a) Issue duplicate / fresh copies of the above documents.
   (b) Cancel and invalidate the lost / stolen documents in their records to prevent misuse.
   (c) Not honour any transaction, application or request made using the said lost / stolen documents without verifying my identity in person.

7. That if the original documents are found in the future, I undertake to surrender them immediately to the issuing authority.

8. That all facts stated herein are true and correct. I am fully aware of the legal consequences of misuse of identity documents and the offence of identity theft under the Information Technology Act, 2000 (Section 66C) and the Bharatiya Nyaya Sanhita, 2023.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

[Note: Enclose a copy of the FIR / complaint receipt if available. This affidavit along with the FIR copy is accepted by most issuing authorities for duplicate document applications.]`,

// ── ALSO FIX THE 3 MINOR BUGS IN EXISTING TEMPLATES ─────────────────────────
// Fix self_declaration — add proper VERIFICATION clause (override existing)
// Fix nda — add WITNESSES block
// Fix employment_contract — add WITNESSES block
// These are handled by appending corrected versions below
// ═══════════════════════════════════════════════════════════════
// PHASE 2 TEMPLATES — PROPERTY DOCUMENTS (13 docs)
// ═══════════════════════════════════════════════════════════════

lease_agreement:f=>`COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.startDate)}, at ${v(f.city)}, Kerala.

BETWEEN

LESSOR:
Name: ${v(f.lessorName)}
Address: ${v(f.lessorAddress||f.city)}
(hereinafter referred to as "the Lessor", which expression shall include heirs, executors, administrators, legal representatives and permitted assigns)

                                    — AND —

LESSEE:
Name / Company: ${v(f.lesseeName)}
Address: ${v(f.lesseeAddress||f.city)}
(hereinafter referred to as "the Lessee", which expression shall include heirs, executors, administrators, legal representatives and permitted assigns)

SCHEDULE OF PROPERTY:
${v(f.propertyAddress)}, ${v(f.city)}, Kerala
(hereinafter referred to as "the Leased Premises")

WHEREAS the Lessor is the absolute owner and is in lawful possession of the Leased Premises, AND the Lessee desires to take the Leased Premises on lease for the purpose of ${v(f.propertyUse)}, AND the Lessor has agreed to grant the lease on the terms and conditions hereinafter stated.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. LEASE PERIOD
   The Lessor hereby grants and the Lessee hereby accepts a lease of the Leased Premises for a period of ${v(f.leaseDuration)} (${toWords(parseInt(f.leaseDuration)||1)}) years, commencing from ${fmtDate(f.startDate)}.

2. MONTHLY RENT
   The Lessee shall pay to the Lessor a monthly rent of ${amt(f.rentAmount)}, payable in advance on or before the 5th day of each calendar month. In the event of failure to pay rent by the due date, the Lessee shall be liable to pay simple interest at 18% per annum on the overdue rent from the date it fell due until actual payment.

3. RENT ESCALATION
   The monthly rent shall be increased by 5% (Five percent) per annum at the completion of every 12 months of the lease period. The escalated rent shall be effective from the first day of the 13th month, 25th month, and so on.

4. SECURITY DEPOSIT
   The Lessee has paid to the Lessor a refundable interest-free security deposit of ${amt(f.deposit||'0')}. This deposit shall be refunded to the Lessee within 30 days of vacating the Leased Premises, after deducting any outstanding rent, utility bills, damages beyond fair wear and tear, or any other lawfully recoverable amounts.

5. PERMITTED USE
   The Leased Premises shall be used solely and exclusively for the purpose of ${v(f.propertyUse)} and for no other purpose whatsoever, without the prior written consent of the Lessor.

6. MAINTENANCE AND REPAIRS
   (a) The Lessee shall maintain the Leased Premises in good, clean and tenantable condition throughout the lease period.
   (b) Routine day-to-day maintenance and minor repairs shall be carried out by and at the sole cost of the Lessee.
   (c) Major structural repairs and repairs to the building fabric shall be the responsibility of the Lessor, subject to the Lessee providing advance written notice of the same.
   (d) The Lessee shall not make any structural additions, alterations, modifications or improvements to the Leased Premises without the prior written consent of the Lessor.
   (e) At the expiry or earlier termination of this Agreement, the Lessee shall handover the Premises to the Lessor in its original condition, subject to fair wear and tear.

7. UTILITIES AND OUTGOINGS
   All charges including electricity, water, telephone, internet, gas, professional tax, and all other utility charges and levies pertaining to the use of the Leased Premises during the lease period shall be borne solely by the Lessee. The Lessee shall ensure no dues are outstanding at the time of vacation.

8. SUBLETTING AND ASSIGNMENT
   The Lessee shall not sublet, underlet, assign, transfer or otherwise part with the possession of the Leased Premises or any part thereof to any other person, firm or company without the prior written consent of the Lessor.

9. INSPECTION
   The Lessor or their authorised representative shall be entitled to inspect the Leased Premises at any reasonable time after giving at least 48 hours prior notice to the Lessee.

10. NOTICE PERIOD FOR TERMINATION
    Either party may terminate this Agreement after the expiry of the initial lock-in period by giving three (3) months prior written notice to the other party.

11. LOCK-IN PERIOD
    There shall be a lock-in period of 12 (Twelve) months from the date of commencement, during which neither party shall be entitled to terminate this Agreement. In the event of premature termination during the lock-in period, the terminating party shall be liable to pay rent equivalent to the remaining lock-in period.

12. BREACH
    In the event of breach of any terms herein by the Lessee, the Lessor shall be entitled to terminate this Agreement forthwith and recover possession of the Premises through appropriate legal proceedings, without prejudice to any other remedy available in law.

13. GOVERNING LAW AND JURISDICTION
    This Agreement shall be governed by and construed in accordance with the Transfer of Property Act, 1882, the Registration Act, 1908, and all other applicable laws of India. All disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the Courts at ${v(f.city)}, Kerala.

14. REGISTRATION
    This Agreement, if for a period exceeding 11 months, shall be compulsorily registered under Section 17 of the Registration Act, 1908. Stamp duty and registration charges shall be borne by the Lessee / as mutually agreed.

IN WITNESS WHEREOF, the parties have hereunto set their hands on the date first above written.

________________________          ________________________
LESSOR                            LESSEE
${v(f.lessorName)}                ${v(f.lesseeName)}
Date: ${fmtDate(f.startDate)}     Date: ${fmtDate(f.startDate)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

leave_license:f=>`LEAVE AND LICENSE AGREEMENT

This Leave and License Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.startDate)}, at ${v(f.city)}, Kerala.

BETWEEN

LICENSOR:
Name: ${v(f.licensorName)}
(hereinafter referred to as "the Licensor", which expression shall include heirs, legal representatives and assigns)

                                    — AND —

LICENSEE:
Name / Company: ${v(f.licenseeName)}
(hereinafter referred to as "the Licensee", which expression shall include heirs, legal representatives and assigns)

PREMISES:
${v(f.propertyAddress)}, ${v(f.city)}, Kerala
(hereinafter referred to as "the Premises")

WHEREAS the Licensor is the absolute owner and is in exclusive possession of the above Premises, AND the Licensee desires to use the Premises for the purpose of ${v(f.propertyUse)}, AND the Licensor has agreed to grant Leave and License to use the Premises on the following terms.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. GRANT OF LICENSE — NATURE OF AGREEMENT
   The Licensor hereby grants Leave and License to the Licensee to use and occupy the Premises for the purpose of ${v(f.propertyUse)} for a period of ${v(f.duration)} months commencing from ${fmtDate(f.startDate)}.

   IMPORTANT: This Agreement is a LEAVE AND LICENSE only and does NOT create any tenancy or lease or any other interest in favour of the Licensee in the Premises. The Licensor's title, ownership and right to possession of the Premises are not affected in any manner whatsoever. The Licensee shall not claim any tenancy rights or protection under any Rent Control Act by virtue of this Agreement.

2. LICENSE FEES
   The Licensee shall pay to the Licensor a monthly license fee of ${amt(f.licenseAmount)}, payable in advance on or before the 5th day of each calendar month. Delayed payment shall attract interest at 18% per annum.

3. REFUNDABLE DEPOSIT
   The Licensee has paid a refundable security deposit of ${amt(f.deposit||'0')} to the Licensor. This shall be refunded within 30 days of vacating after adjusting lawful dues.

4. PERMITTED USE
   The Premises shall be used solely for ${v(f.propertyUse)} only. No other use is permitted without prior written consent of the Licensor.

5. MAINTENANCE
   (a) Minor day-to-day repairs: Licensee's responsibility.
   (b) No structural alterations without prior written consent of Licensor.
   (c) Premises to be handed over in original condition on expiry.

6. UTILITIES
   All utility charges during the License period shall be borne by the Licensee.

7. SUBLICENSING
   The Licensee shall not sublicense, sublet, or part with possession of the Premises or any part thereof to any third party under any circumstances.

8. REVOCATION
   The Licensor may revoke this License at any time by giving 30 days written notice. On revocation or expiry, the Licensee shall vacate immediately without any further notice or legal proceedings. The Licensee's obligation to vacate is absolute and unconditional.

9. INSPECTION
   The Licensor or their representative may inspect the Premises with 24 hours prior notice.

10. GOVERNING LAW
    This Agreement is governed by Section 52 of the Indian Easements Act, 1882 and all applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

IN WITNESS WHEREOF, the parties sign this Agreement on the date first written above.

________________________          ________________________
LICENSOR                          LICENSEE
${v(f.licensorName)}              ${v(f.licenseeName)}
Date: ${fmtDate(f.startDate)}     Date: ${fmtDate(f.startDate)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

property_sale:f=>{
  const saleAmt = parseInt(f.saleAmount || 0);
  const advance = parseInt(f.advanceAmount || 0);
  const balance = saleAmt - advance;
  const stampDuty = Math.round(saleAmt * 0.08);  // Kerala: 8% approx
  const regFee = Math.round(saleAmt * 0.02);      // 2% registration fee
  return `${docHeader('SALE DEED','SD',f)}

THIS SALE DEED ("Deed") is executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

VENDOR / SELLER:
  Full Name    : ${v(f.vendorName)}
  ${relation({gender:f.vendorGender})} : ${v(f.vendorFather||'___')}
  Address      : ${v(f.vendorAddress||f.city)}, Kerala
  Aadhaar No.  : ${v(f.vendorAadhaar||'XXXX-XXXX-XXXX')}
  PAN No.      : ${v(f.vendorPan||'___')}
  (hereinafter referred to as "the Vendor")

AND

PURCHASER / BUYER:
  Full Name    : ${v(f.purchaserName)}
  ${relation({gender:f.purchaserGender})} : ${v(f.purchaserFather||'___')}
  Address      : ${v(f.purchaserAddress||f.city)}, Kerala
  Aadhaar No.  : ${v(f.purchaserAadhaar||'XXXX-XXXX-XXXX')}
  PAN No.      : ${v(f.purchaserPan||'___')}
  (hereinafter referred to as "the Purchaser")

─────────────────────────────
SCHEDULE OF PROPERTY
─────────────────────────────
Survey No.    : ${v(f.surveyNumber)}
Village       : ${v(f.village||'___')}
Taluk         : ${v(f.taluk||'___')}
District      : ${v(f.city||'___')}
State         : Kerala
Extent        : ${v(f.extent)} (${v(f.extentUnit||'Cents / Sq.ft / Acres')})
Boundaries    :
  North : ${v(f.northBoundary||'___')}
  South : ${v(f.southBoundary||'___')}
  East  : ${v(f.eastBoundary||'___')}
  West  : ${v(f.westBoundary||'___')}
Property Description: ${v(f.propertyDescription)}
─────────────────────────────

─────────────────────────────
FINANCIAL SUMMARY
─────────────────────────────
  Sale Consideration  : ${amt(f.saleAmount)}
  Advance Paid        : ${advance > 0 ? amt(f.advanceAmount) : 'Nil'}
  Balance Payable     : ${balance > 0 ? amt(balance.toString()) : 'Nil (Full payment received)'}
  Estimated Stamp Duty: ${amt(stampDuty.toString())} (approx. 8% — verify with SRO)
  Registration Fee    : ${amt(regFee.toString())} (approx. 2% — verify with SRO)
─────────────────────────────

RECITALS

WHEREAS the Vendor is the absolute owner of the above described property ("the Property"), having acquired the same by virtue of: ${v(f.titleOrigin||'inheritance / purchase / gift — details in title deeds')};

AND WHEREAS the Vendor and the Purchaser have agreed that the Vendor shall sell, transfer, convey and assure the Property to the Purchaser absolutely and forever at the agreed sale consideration of ${amt(f.saleAmount)};

AND WHEREAS the Purchaser has agreed to purchase the same at the said price;

NOW, THEREFORE, in consideration of the sale consideration of ${amt(f.saleAmount)} (Rupees ${toWords(saleAmt)} Only) paid by the Purchaser to the Vendor as follows:
  ${advance > 0 ? `(i) Advance of ${amt(f.advanceAmount)} paid on ${fmtDate(f.advanceDate||f.date)}.
  (ii) Balance of ${amt(balance.toString())} paid on ${fmtDate(f.date)} by ${v(f.paymentMode||'bank transfer / demand draft / cash')}.` : `Full amount of ${amt(f.saleAmount)} paid on ${fmtDate(f.date)} by ${v(f.paymentMode||'bank transfer / demand draft / cash')}.`}

The receipt of the above consideration is hereby acknowledged by the Vendor;

NOW THIS DEED WITNESSES as follows:

1. SALE AND CONVEYANCE
   In consideration of the above, the Vendor hereby sells, transfers, conveys, assigns and assures unto the Purchaser, his/her heirs, executors, administrators and assigns, ALL THAT the Property described in the Schedule above, TO HAVE AND TO HOLD the same absolutely and forever.

2. TITLE AND OWNERSHIP
   (a) The Vendor hereby declares that he/she is the absolute and lawful owner of the Property, having full right, title, interest and authority to sell the same.
   (b) The title of the Vendor is clear, absolute, free from all encumbrances, charges, liens, mortgages, claims or demands of any nature whatsoever.
   (c) The Property is not subject to any attachments, court orders, injunctions or government acquisition proceedings.
   (d) All property taxes, land revenue, local body taxes and dues have been paid up to date.
   (e) The Vendor has not entered into any prior agreement of sale, mortgage, lease or any other deal with respect to the Property.

3. ENCUMBRANCE CERTIFICATE
   The Vendor confirms that an Encumbrance Certificate has been obtained from the Sub-Registrar's Office for the period from ${v(f.ecFromYear||'___')} to ${v(f.ecToYear||'___')}, confirming nil encumbrance.

4. POSSESSION
   The Vendor has delivered vacant and peaceful possession of the Property to the Purchaser on the date of execution of this Deed. The Purchaser has inspected and accepted the Property in its present "as-is" condition.

5. INDEMNITY
   The Vendor hereby covenants with the Purchaser to indemnify and keep the Purchaser indemnified against any loss, cost, claims or damages arising from:
   (a) Any defect in the Vendor's title to the Property.
   (b) Any undisclosed encumbrance, lien or charge on the Property.
   (c) Any claim by any third party to the Property.

6. GENERAL COVENANTS
   The Vendor shall, on demand, execute all further documents, deeds and assurances as may be necessary to perfect the title of the Purchaser.

7. GST / TAX
   ${v(f.gstNote||'This is a sale of immovable property and is not subject to GST. TDS under Section 194IA of the Income Tax Act, 1961 (1% on sale consideration above Rs.50 Lakhs) is the Purchaser responsibility.')}

8. ${govLaw(f, 'the Transfer of Property Act, 1882, Registration Act, 1908, Kerala Stamp Act, 1959, and all other applicable laws')}

IN WITNESS WHEREOF, the parties hereto have hereunto set their respective hands and seals on the day and year first above written.

________________________          ________________________
VENDOR                            PURCHASER
${v(f.vendorName)}                ${v(f.purchaserName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

${witnessBlock}

${stampHint('property_sale')}

⚠ THIS DOCUMENT MUST BE EXECUTED ON APPROPRIATE STAMP PAPER AND REGISTERED AT THE OFFICE OF THE SUB-REGISTRAR HAVING JURISDICTION. NON-REGISTRATION RENDERS THIS DEED INADMISSIBLE AS EVIDENCE OF TITLE TRANSFER.`;
},

property_affidavit:f=>`AFFIDAVIT REGARDING PROPERTY OWNERSHIP

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and I am fully competent to make this affidavit.

2. That I am the absolute, lawful and sole owner of the following property:
   ${v(f.propertyAddress)}, ${v(f.city)}, Kerala
   (hereinafter referred to as "the Said Property")

3. That I acquired the Said Property by way of: ${v(f.ownershipBasis)}, and my title to the Said Property is clear, valid and marketable.

4. That the Said Property is free from all encumbrances, charges, mortgages, liens, attachments, claims, disputes, litigation and liabilities of any nature whatsoever.

5. That no suit, case, appeal, revision or proceedings are pending in any court of law, tribunal or authority in respect of the Said Property.

6. That all property taxes, water charges, electricity charges and other statutory dues in respect of the Said Property are fully paid up to date.

7. That no other person has any right, title, interest, claim or demand whatsoever over the Said Property.

8. That the title documents relating to the Said Property are genuine, valid and subsisting and have not been deposited with any bank, financial institution or any other person as security.

9. That I have not entered into any Agreement to Sell, mortgage, exchange, gift, or any other agreement to transfer the Said Property to any other person.

10. That I undertake to indemnify and keep indemnified any person dealing with the Said Property on the basis of this affidavit against all losses, claims and damages arising from any defect in title or any third-party claim.

11. That all facts stated herein are true and correct to the best of my knowledge and belief. Nothing material has been concealed therefrom.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

property_declaration:f=>`DECLARATION OF PROPERTY OWNERSHIP

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly declare as follows:

1. PROPERTY DETAILS:
   ${v(f.propertyDescription)}, ${v(f.city)}, Kerala.

2. BASIS OF OWNERSHIP:
   I acquired the above property by: ${v(f.ownershipDetails)}.

3. I declare that:
   (a) I am the absolute, lawful and sole owner of the above property.
   (b) The property is free from all encumbrances, charges, mortgages, litigation and claims.
   (c) All property taxes, water charges and other statutory dues are fully paid up to date.
   (d) No third party has any right, title, interest or claim over the said property.
   (e) The title documents are genuine and have not been deposited with any bank or other party as security.
   (f) I have not entered into any agreement to sell, gift, mortgage or otherwise transfer the said property to any other person.

4. This declaration is made for official purposes and may be relied upon by all concerned authorities.

5. I fully understand that making a false declaration is a punishable offence under applicable law.

Place: ${v(f.city)}
Date: ${fmtDate(f.date)}

                                        ________________________
                                        Declarant
                                        ${v(f.fullName)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

possession_letter:f=>`POSSESSION HANDOVER LETTER

Date: ${fmtDate(f.date)}
Ref. No: POSS/${new Date().getFullYear()}/${RN()}

FROM:
${v(f.sellerName)}

TO,
${v(f.buyerName)}

SUBJECT: HANDING OVER OF POSSESSION — ${v(f.propertyAddress)}, ${v(f.city)}

Dear ${v(f.buyerName)},

With reference to the Agreement to Sell / Sale Deed executed between us with respect to the above property, we hereby inform you that the property is now ready for possession and is being formally handed over to you with effect from ${fmtDate(f.possessionDate)}.

PROPERTY DETAILS:
${v(f.propertyAddress)}, ${v(f.city)}, Kerala

DATE OF POSSESSION: ${fmtDate(f.possessionDate)}

ITEMS HANDED OVER:
${v(f.handoverDetails)}

We hereby confirm and declare that:
1. Vacant and peaceful physical possession of the above property is being handed over to you on ${fmtDate(f.possessionDate)}.
2. All original title documents, encumbrance certificates, tax receipts and other property-related documents are being handed over to you simultaneously.
3. All outstanding dues — electricity, water, property tax and maintenance charges — have been cleared up to the date of possession.
4. The property is being handed over free from all encumbrances and with clear title.
5. All keys, access cards and other items belonging to the property are being handed over as listed above.
6. From the date of this possession letter, all rights, liabilities, risks and responsibilities with respect to the property shall stand transferred to you.

You are requested to take over possession of the property and confirm the same by signing and returning a copy of this letter.

Thanking you,

________________________
${v(f.sellerName)}
Date: ${fmtDate(f.date)}

ACKNOWLEDGEMENT OF POSSESSION:
I, ${v(f.buyerName)}, hereby acknowledge having received peaceful and vacant possession of the above property along with all the items listed above on ${fmtDate(f.possessionDate)}.

________________________
${v(f.buyerName)}
Date: ${fmtDate(f.possessionDate)}`,

tenant_verify:f=>`TENANT VERIFICATION AFFIDAVIT
(For Police Verification — As per Local Police / Government Requirements)

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.landlordName)}, the owner of the property at ${v(f.propertyAddress)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows and submit the following details of my tenant for police verification:

TENANT DETAILS:
Full Name: ${v(f.tenantName)}
Date of Birth: ${fmtDate(f.tenantDOB)}
Mobile Number: ${v(f.tenantMobile)}
Aadhaar / ID No.: ${v(f.tenantAadhaar||'As per ID submitted')}
Permanent Address: ${v(f.tenantPermanentAddress)}

TENANCY DETAILS:
Rental Property Address: ${v(f.propertyAddress)}, ${v(f.city)}, Kerala
Move-in Date: ${fmtDate(f.moveInDate)}
Landlord Name: ${v(f.landlordName)}
Landlord Mobile: ${v(f.landlordMobile)}

I, ${v(f.landlordName)}, hereby declare and affirm that:

1. I have verified the identity and address of the above-named tenant through original identity documents submitted by the tenant, copies of which are enclosed herewith.

2. The above-named tenant has taken the above property on rent / leave and license from me with effect from ${fmtDate(f.moveInDate)} for bona fide residential / commercial purposes.

3. The tenant details provided above are true and correct to the best of my knowledge.

4. I undertake to inform the concerned Police Station immediately:
   (a) If the tenant vacates the premises.
   (b) If any suspicious activity, person or material is found at the premises.
   (c) If the tenant changes or any new person occupies the premises.

5. I shall be responsible for any default in reporting changes in tenancy.

6. I am aware of my obligations under the local Police Act and relevant notifications regarding tenant verification.

TENANT'S DECLARATION:
I, ${v(f.tenantName)}, hereby confirm that the details provided above are true and correct. I consent to police verification.

________________________          ________________________
LANDLORD                          TENANT
${v(f.landlordName)}              ${v(f.tenantName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

Solemnly affirmed before me on this ${fmtDate(f.date)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

Enclosures:
1. Copy of Tenant's Aadhaar Card / Passport / Voter ID
2. Copy of Tenant's Permanent Address Proof
3. Recent Passport Photograph of Tenant`,

property_will:f=>`LAST WILL AND TESTAMENT

I, ${v(f.testatorName)}, aged ${v(f.testatorAge)} years, residing at ${v(f.testatorAddress)}, Kerala, being of sound mind, good health, and disposing memory, and not acting under any undue influence, duress, fraud or misrepresentation, do hereby make, publish and declare this as my LAST WILL AND TESTAMENT, hereby revoking all former Wills and codicils made by me.

1. DECLARATION
   I declare that this is my last Will and Testament. I am making this Will voluntarily and with full understanding of its legal consequences.

2. EXECUTOR
   I hereby appoint ${v(f.executor)} as the Executor of this Will. If the named Executor is unable or unwilling to act, the matter shall be decided by the competent court. The Executor shall have full authority to collect my assets, pay my debts, and distribute my estate as directed in this Will.

3. DESCRIPTION OF PROPERTY AND ASSETS
   I am currently the owner of the following properties and assets:
   ${v(f.propertyDetails)}

4. DISTRIBUTION OF ESTATE
   I hereby bequeath my entire estate, as described above, to the following beneficiaries in the manner stated below:
   ${v(f.beneficiaries)}

5. SPECIAL CONDITIONS AND INSTRUCTIONS
   ${f.specialConditions && f.specialConditions.trim() ? v(f.specialConditions) : 'None specified.'}

6. DEBTS AND LIABILITIES
   All my just and lawful debts, funeral expenses and estate administration costs shall be paid out of my estate by the Executor before distribution to beneficiaries.

7. RESIDUARY ESTATE
   Any property or assets not specifically mentioned or disposed of in this Will shall pass to the beneficiaries mentioned above in proportion to their stated shares.

8. GUARDIAN (if minor beneficiaries)
   In the event any beneficiary is a minor at the time of my death, the Executor shall hold the said beneficiary's share in trust until the beneficiary attains 18 years of age.

9. REVOCATION
   This Will revokes and supersedes all previous Wills, codicils and testamentary dispositions made by me at any time.

10. GOVERNING LAW
    This Will is governed by the Indian Succession Act, 1925, and the applicable personal law (Hindu Succession Act, 1956 / Indian Succession Act, 1925).

ATTESTATION AND SIGNATURE

In Witness whereof, I, ${v(f.testatorName)}, have signed this my Last Will and Testament at ${v(f.city)}, Kerala, on this ${fmtDate(f.date)}, in the presence of the two witnesses named below who have signed in my presence and in the presence of each other.

                                        ________________________
                                        TESTATOR / WILL MAKER
                                        ${v(f.testatorName)}
                                        Date: ${fmtDate(f.date)}

WITNESSES:
(Both witnesses must be present simultaneously and sign in the presence of the Testator and each other)

1. I, _______________________, residing at _______________________, hereby certify that the Testator signed this Will in my presence and in the presence of the other witness.
   Signature: _______________________  Date: _______________

2. I, _______________________, residing at _______________________, hereby certify that the Testator signed this Will in my presence and in the presence of the other witness.
   Signature: _______________________  Date: _______________

[IMPORTANT LEGAL NOTE: This Will is governed by the Indian Succession Act, 1925. A Will by a Hindu, Buddhist, Sikh or Jain is also governed by the Hindu Succession Act, 1956. A Will does NOT require registration but REGISTRATION IS STRONGLY RECOMMENDED for avoiding future disputes. It can be registered at the Sub-Registrar's office at any time during the Testator's lifetime. A registered Will is given higher evidentiary weight in courts.]`,

mutation_affidavit:f=>`AFFIDAVIT FOR PROPERTY MUTATION / KHATA TRANSFER

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and I am fully competent to make this affidavit.

2. That I have acquired the following property:
   ${v(f.propertyAddress)}, ${v(f.city)}, Kerala
   (hereinafter referred to as "the Said Property")

3. That I acquired the Said Property by: ${v(f.purchaseDetails)}.

4. That I am now the absolute and lawful owner of the Said Property and I am in peaceful possession and enjoyment thereof.

5. That the property tax and other municipal dues of the Said Property were previously assessed in the name of the previous owner.

6. That I hereby apply for mutation / khata transfer of the Said Property in my name in the records of the concerned local body / panchayat / municipality / corporation.

7. That all property taxes, water charges and other statutory dues of the Said Property are fully paid up to date, and no dues are outstanding.

8. That no person other than me has any right, title, interest or claim over the Said Property.

9. That the Said Property is free from all encumbrances, litigation and disputes.

10. That the documents submitted along with this affidavit are genuine and correct.

11. That all facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

Enclosures:
1. Copy of Sale Deed / Gift Deed / Will / other title document
2. Copy of latest property tax receipt
3. Copy of Encumbrance Certificate
4. Copy of applicant's Aadhaar Card / identity proof`,

encumbrance_cert:f=>`AFFIDAVIT / DECLARATION OF NO ENCUMBRANCE

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and I am the absolute and lawful owner of the following property:
   ${v(f.propertyAddress)}, ${v(f.city)}, Kerala
   (hereinafter referred to as "the Said Property")

2. ${v(f.declaration)}

3. I specifically declare that the Said Property is:
   (a) FREE from all mortgages, charges, hypothecation, pledges and encumbrances of every nature and kind.
   (b) FREE from all loans, advances, or liabilities taken against the property from any bank, financial institution, money lender, or any other person.
   (c) FREE from any lis pendens, attachment, execution, injunction, receiver, writ or court order.
   (d) FREE from all disputes, litigation, suits, claims and demands of any nature whatsoever.
   (e) FREE from all arrears of property tax, water charges, electricity charges and other statutory dues.

4. That the title documents relating to the Said Property are in my custody, are original and genuine, and have not been deposited as security with any person.

5. That I have not entered into any Agreement to Sell, mortgage deed, or any other document transferring or encumbering the Said Property.

6. That if any encumbrance or claim is discovered at any future date, I shall be personally responsible for the same and shall indemnify all parties affected thereby.

7. That all facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

property_gift:f=>`GIFT DEED

This Gift Deed (hereinafter referred to as "the Deed") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

DONOR:
Name: ${v(f.donorName)}
S/o D/o W/o: ${v(f.donorFather)}
Address: ${v(f.donorAddress)}
(hereinafter referred to as "the Donor")

                                    — AND —

DONEE:
Name: ${v(f.doneeName)}
Relationship with Donor: ${v(f.doneeRelation)}
Address: ${v(f.doneeAddress)}
(hereinafter referred to as "the Donee")

DESCRIPTION OF GIFT:
${v(f.giftDescription)}, ${v(f.city)}, Kerala
Estimated Market Value: ${f.marketValue && f.marketValue.trim() && f.marketValue !== '0' ? amt(f.marketValue) : 'As per current market value'}
(hereinafter referred to as "the Gifted Property / Asset")

RECITALS:
WHEREAS the Donor is the absolute owner of the Gifted Property / Asset, AND the Donor desires to gift the same to the Donee out of natural love, affection and goodwill for the Donee, AND the Donee has agreed to accept the same.

NOW THIS DEED WITNESSES AS FOLLOWS:

1. GIFT
   The Donor hereby absolutely, irrevocably and unconditionally gifts, transfers, conveys and assures the Gifted Property / Asset to the Donee, TO HOLD the same as the Donee's own absolute property forever, free from all conditions and encumbrances.

2. CONSIDERATION
   This Gift is made purely out of natural love, affection and goodwill of the Donor for the Donee. No monetary consideration has passed or shall pass from the Donee to the Donor.

3. ACCEPTANCE
   The Donee hereby accepts the gift of the Gifted Property / Asset and takes possession of the same.

4. DELIVERY OF POSSESSION
   The Donor hereby delivers and the Donee hereby takes possession of the Gifted Property / Asset on the date of execution of this Deed.

5. TITLE AND WARRANTY
   (a) The Donor warrants that the Gifted Property / Asset is the Donor's own absolute property and the Donor has full and absolute right to make this gift.
   (b) The Gifted Property / Asset is free from all encumbrances, mortgages, charges, liens, litigation and third-party claims.
   (c) The Donor shall defend the Donee's title to the Gifted Property against all adverse claims.

6. FURTHER ASSURANCE
   The Donor shall, at the request and cost of the Donee, execute all such further documents as may be necessary to perfect the Donee's title to the Gifted Property.

7. IRREVOCABILITY
   This Gift is irrevocable except in cases provided under Section 126 of the Transfer of Property Act, 1882 (e.g., if the Donee is guilty of gross ingratitude).

8. GOVERNING LAW
   This Deed is governed by Sections 122 to 129 of the Transfer of Property Act, 1882, and all applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

IN WITNESS WHEREOF, the Donor and Donee have signed this Gift Deed on the date first above written.

________________________          ________________________
DONOR                             DONEE
${v(f.donorName)}                 ${v(f.doneeName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

[IMPORTANT: This Gift Deed must be stamped with appropriate stamp duty under the Kerala Stamp Act and registered at the Sub-Registrar's office as required under Section 123 of the Transfer of Property Act, 1882. Gift of immovable property without registration is void.]`,

society_noc:f=>`NO OBJECTION CERTIFICATE
(From Housing Society / Residents' Association)

Date: ${fmtDate(f.date)}
Ref. No: NOC/${new Date().getFullYear()}/${RN()}

FROM:
${v(f.societyName)}
[Society / Association Stamp]

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.memberName)}, the owner of Flat / Unit No. ${v(f.flatNo)}, located in the premises of ${v(f.societyName)}, has applied for a No Objection Certificate for the purpose stated below.

PURPOSE OF NOC: ${v(f.purpose)}

After due consideration, the Managing Committee / Governing Body of ${v(f.societyName)} hereby issues this NO OBJECTION CERTIFICATE in favour of ${v(f.memberName)}, Flat / Unit No. ${v(f.flatNo)}, for the above stated purpose.

We hereby confirm that:
1. ${v(f.memberName)} is a bona fide member / flat owner of ${v(f.societyName)}.
2. All maintenance charges, dues, and outstanding amounts payable to the Society up to the date of this NOC have been fully paid / cleared by the said member.
3. No disciplinary action or proceeding is pending against the above member in the Society.
4. The Society has NO OBJECTION to ${v(f.memberName)} proceeding with the above stated purpose.

CONDITIONS (if any):
1. This NOC is issued for the specific purpose mentioned above only.
2. This NOC does not confer any right beyond what is expressly stated herein.
3. The Society shall not be responsible for any consequences arising from the use of this NOC.
4. This NOC is valid as on the date of issue.

Issued at ${v(f.city)} on ${fmtDate(f.date)}.

________________________          ________________________
Secretary                         Chairman / President
${v(f.secretaryName)}             ${v(f.societyName)}

[Society Seal / Stamp]`,

property_indemnity:f=>`INDEMNITY BOND — PROPERTY

This Indemnity Bond (hereinafter referred to as "the Bond") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BY:
${v(f.indemnifierName)}
(hereinafter referred to as "the Indemnifier")

IN FAVOUR OF:
${v(f.indemnifiedName)}
(hereinafter referred to as "the Indemnified Party")

PROPERTY DETAILS:
${v(f.propertyAddress)}, ${v(f.city)}, Kerala
(hereinafter referred to as "the Said Property")

WHEREAS the Indemnified Party has agreed to deal with / purchase / lend against / take on rent / register / execute a document in respect of the Said Property, AND the Indemnifier desires to indemnify the Indemnified Party against all claims, losses and liabilities as detailed herein.

NOW THIS BOND WITNESSES AS FOLLOWS:

1. INDEMNITY
   The Indemnifier hereby covenants and undertakes to indemnify, defend and hold harmless the Indemnified Party from and against:
   ${v(f.indemnityScope)}

2. SPECIFIC INDEMNITY COVERAGE
   The Indemnifier specifically indemnifies the Indemnified Party against:
   (a) Any defect in the title of the Said Property arising from any past transaction, decree, encumbrance or charge not disclosed.
   (b) Any claim or demand from any heir, legal representative, creditor or third party in relation to the Said Property.
   (c) Any loss arising from non-disclosure of any mortgage, lien, lease, pending litigation or encumbrance on the Said Property.
   (d) Any loss due to Government acquisition, requisition or any statutory claim on the Said Property.
   (e) Any liability arising from outstanding property tax, utilities or statutory dues not cleared.

3. DURATION
   This indemnity is valid and binding indefinitely and shall not be affected by the death or insolvency of the Indemnifier. The obligation shall be binding on the heirs, legal representatives and estate of the Indemnifier.

4. ENFORCEMENT
   In the event the Indemnified Party suffers any loss or incurs any liability covered by this Bond, the Indemnifier shall make good such loss immediately on demand. If the Indemnifier fails, the Indemnified Party may enforce this Bond as a money decree.

5. GOVERNING LAW
   This Bond is governed by Section 124 of the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}, Kerala.

IN WITNESS WHEREOF, the Indemnifier has signed this Bond on the date first written above.

                                        ________________________
                                        INDEMNIFIER
                                        ${v(f.indemnifierName)}
                                        Date: ${fmtDate(f.date)}

ACCEPTED BY:
                                        ________________________
                                        INDEMNIFIED PARTY
                                        ${v(f.indemnifiedName)}
                                        Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,


// ═══════════════════════════════════════════════════════════════
// PHASE 3 TEMPLATES — FINANCIAL DOCUMENTS (12 docs)
// Maximum detail — advanced Indian financial law clauses
// ═══════════════════════════════════════════════════════════════

promissory_note:f=>{
  const principal = parseInt(f.amount || 0);
  const rate = parseFloat(f.interest || 0);
  const daysToRepay = vo(f.repaymentDays) ? parseInt(f.repaymentDays) : 0;
  const dueDate = daysToRepay > 0 ? addDays(f.date, daysToRepay) : null;
  const hasInterest = rate > 0;
  return `${docHeader('PROMISSORY NOTE','PN',f)}

Rs. ${principal.toLocaleString('en-IN')}/-

${v(f.city)}, Kerala
Date: ${fmtDate(f.date)}

I, ${v(f.makerName)}, ${relation({gender:f.makerGender})} ${v(f.makerFather||'___')}, aged ${age({age:f.makerAge})}, residing at ${v(f.makerAddress||f.city)}, Kerala, Aadhaar No. ${v(f.makerAadhaar||'XXXX-XXXX-XXXX')} (hereinafter referred to as "the Maker"), hereby promise to pay to ${v(f.payeeName)}, residing at ${v(f.payeeAddress||f.city)}, Kerala (hereinafter referred to as "the Payee"), or order, on demand${dueDate ? ` / on ${fmtDate(dueDate)}` : ''}, the sum of ${amt(f.amount)}${hasInterest ? ` together with interest thereon at the rate of ${rate}% (${toWords(Math.floor(rate))} percent) per annum from the date of this Note until the date of actual payment` : ''}, for value received.

─────────────────────────────
PARTICULARS
─────────────────────────────
  Principal Amount : ${amt(f.amount)}
  Rate of Interest : ${hasInterest ? rate+'% per annum' : 'Nil (Interest-free)'}
  Repayment On     : ${dueDate ? fmtDate(dueDate) : 'On Demand'}
  Mode of Payment  : ${v(f.paymentMode||'Cash / Bank Transfer / UPI')}
  Place of Payment : ${v(f.paymentPlace||f.city)}, Kerala
  Consideration    : ${v(f.consideration||'for value received / loan advanced')}
─────────────────────────────

TERMS:

1. On default of payment on the due date, this Promissory Note shall carry penal interest at ${Math.min(rate + 6, 24)}% per annum from the date of default until realisation.

2. In the event of default, the Payee shall be entitled to recover the full amount with interest and costs through legal proceedings, including proceedings under the Negotiable Instruments Act, 1881.

3. This Promissory Note is governed by the Negotiable Instruments Act, 1881, and is payable at ${v(f.paymentPlace||f.city)}, Kerala.

4. All costs, charges and expenses of recovery, including advocate's fees, shall be borne by the Maker.

5. The Maker waives all defences and objections to payment except actual payment.

________________________
MAKER / EXECUTANT
${v(f.makerName)}
Place: ${v(f.city)}
Date : ${fmtDate(f.date)}

Revenue Stamp: Rs.1/- (Mandatory for Promissory Notes under Stamp Act)

─────────────────────────────
WITNESS TO SIGNATURE
─────────────────────────────
1. Name: ________________________  Signature: ________________________
   Address: ________________________

2. Name: ________________________  Signature: ________________________
   Address: ________________________

─────────────────────────────
ACCEPTANCE BY PAYEE
─────────────────────────────
I, ${v(f.payeeName)}, hereby acknowledge receipt of this Promissory Note for ${amt(f.amount)}.

________________________
PAYEE: ${v(f.payeeName)}
Date: ${fmtDate(f.date)}

⚠ A Promissory Note must bear a revenue stamp of Rs.1/- affixed and cancelled by the Maker. It must be signed in the presence of two witnesses.`;
},

payment_agreement:f=>`PAYMENT AGREEMENT

This Payment Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

PAYER:
Name: ${v(f.party1)}
(hereinafter referred to as "the Payer")

                                    — AND —

RECEIVER / PAYEE:
Name: ${v(f.party2)}
(hereinafter referred to as "the Receiver")

WHEREAS the Payer is indebted to / owes a sum of money to the Receiver in respect of: ${v(f.purpose)}, AND both parties have agreed to settle the payment on the terms and conditions set out herein.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. TOTAL AMOUNT PAYABLE
   The Payer acknowledges and agrees that the total amount due and payable to the Receiver is:
   ${amt(f.totalAmount)}
   (Rupees ${toWords(parseInt(f.totalAmount||0))} Only)

2. PAYMENT SCHEDULE
   The Payer agrees to make payment to the Receiver strictly as per the following schedule:
   ${v(f.paymentSchedule)}

3. MODE OF PAYMENT
   All payments shall be made by cash / account payee cheque / RTGS / NEFT / UPI as mutually agreed. The Receiver shall issue proper signed receipts for each payment received.

4. INTEREST ON DELAYED PAYMENT
   In the event of any delay in payment beyond the scheduled date, the Payer shall pay interest at the rate of 18% (Eighteen percent) per annum on the delayed amount from the due date until the date of actual payment.

5. ACCELERATION ON DEFAULT
   If the Payer fails to make any scheduled payment within 7 days of the due date, the entire outstanding balance shall, at the option of the Receiver, become immediately due and payable without any further notice.

6. FULL AND FINAL SETTLEMENT CERTIFICATE
   On receipt of the full payment as per this Agreement, the Receiver shall issue a Full and Final Settlement Certificate to the Payer within 7 days, confirming that all dues have been paid and no further claims exist.

7. NON-WAIVER
   The Receiver's acceptance of any part payment shall not constitute a waiver of the right to receive the full amount due under this Agreement.

8. LEGAL ACTION
   In the event of default, the Receiver shall be entitled to initiate civil / criminal proceedings including proceedings under Section 138 of the Negotiable Instruments Act, 1881 (in case of cheque dishonour), and to recover the full outstanding amount together with interest and costs.

9. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872 and all applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
PAYER                             RECEIVER / PAYEE
${v(f.party1)}                    ${v(f.party2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

debt_settlement:f=>`DEBT SETTLEMENT AGREEMENT

This Debt Settlement Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

CREDITOR:
Name: ${v(f.creditorName)}
(hereinafter referred to as "the Creditor")

                                    — AND —

DEBTOR:
Name: ${v(f.debtorName)}
(hereinafter referred to as "the Debtor")

RECITALS:
WHEREAS the Debtor is indebted to the Creditor for a total outstanding amount of ${amt(f.originalDebt)}, arising from loans / dues / goods / services / as per earlier agreement, AND the Debtor has represented to the Creditor that he/she is unable to pay the full outstanding amount due to financial difficulties, AND the Creditor, having considered the Debtor's circumstances, has agreed to settle the entire outstanding debt for a reduced sum as set out below, on the strict condition that the settlement amount is paid by the stipulated date.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. ORIGINAL DEBT
   The Debtor acknowledges and admits the total outstanding debt of:
   ${amt(f.originalDebt)}
   as on the date of this Agreement.

2. SETTLEMENT AMOUNT
   In full, complete and final settlement of the entire outstanding debt of ${amt(f.originalDebt)}, the Creditor agrees to accept a reduced settlement amount of:
   ${amt(f.settledAmount)}
   (Rupees ${toWords(parseInt(f.settledAmount||0))} Only)
   being a reduction / waiver of Rs. ${(parseInt(f.originalDebt||0)-parseInt(f.settledAmount||0)).toLocaleString('en-IN')}/- by the Creditor.

3. PAYMENT TERMS
   ${v(f.settlementTerms)}
   Final date for payment of settlement amount: ${fmtDate(f.paymentDate)}.
   Mode of payment: Account payee cheque / RTGS / NEFT / as mutually agreed.

4. FULL AND FINAL RELEASE
   Upon the Creditor's receipt of the settlement amount of ${amt(f.settledAmount)} in full, the Creditor hereby agrees to:
   (a) Accept the said amount as complete, full and final settlement of the entire outstanding debt of ${amt(f.originalDebt)}.
   (b) Release and forever discharge the Debtor from all claims, demands, actions, suits, proceedings, causes of action, liabilities, debts and obligations arising out of or related to the said debt.
   (c) Return all original documents, cheques, promissory notes or security instruments held as collateral, if any.
   (d) Withdraw / not initiate any legal proceedings against the Debtor in relation to the said debt.

5. CONDITION PRECEDENT
   This settlement is conditional upon the Debtor making full payment of the settlement amount on or before ${fmtDate(f.paymentDate)}. In the event of failure, this Agreement shall be void and the Creditor shall be entitled to recover the full original amount of ${amt(f.originalDebt)} with interest and costs.

6. WAIVER OF BALANCE
   The Creditor's waiver of Rs. ${(parseInt(f.originalDebt||0)-parseInt(f.settledAmount||0)).toLocaleString('en-IN')}/- shall not be construed as a precedent for any other transaction, and shall apply only to the specific debt mentioned herein.

7. REPRESENTATIONS BY DEBTOR
   The Debtor represents that:
   (a) He/She has not filed any insolvency petition.
   (b) No court proceedings are pending that would affect this settlement.
   (c) He/She has full authority to enter into this Agreement.

8. CONFIDENTIALITY
   Both parties agree to maintain confidentiality of the terms of this settlement and shall not disclose the same to any third party.

9. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872. Any dispute shall be subject to the jurisdiction of Courts at ${v(f.city)}, Kerala.

________________________          ________________________
CREDITOR                          DEBTOR
${v(f.creditorName)}              ${v(f.debtorName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

loan_repayment:f=>`LOAN REPAYMENT SCHEDULE AGREEMENT

This Loan Repayment Schedule Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

LENDER:
Name: ${v(f.lenderName)}
(hereinafter referred to as "the Lender")

                                    — AND —

BORROWER:
Name: ${v(f.borrowerName)}
(hereinafter referred to as "the Borrower")

WHEREAS the Borrower had borrowed a sum of ${amt(f.loanAmount)} from the Lender, AND the Borrower desires to repay the said loan in equated monthly installments as set out herein, AND the Lender has agreed to the same.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. OUTSTANDING LOAN AMOUNT
   The Borrower acknowledges the outstanding loan amount as on the date of this Agreement:
   ${amt(f.loanAmount)}
   (Rupees ${toWords(parseInt(f.loanAmount||0))} Only)

2. EQUATED MONTHLY INSTALLMENT (EMI)
   The Borrower agrees to repay the outstanding loan by way of Equated Monthly Installments (EMI) as follows:
   Monthly EMI Amount: ${amt(f.monthlyEMI)}
   Commencement Date: ${fmtDate(f.startDate)}
   Total Number of Installments: ${v(f.totalMonths)} months
   Total Repayment Amount: ${amt((parseInt(f.monthlyEMI||0)*parseInt(f.totalMonths||0)).toString())}

3. DUE DATE
   Each monthly installment shall be paid on or before the 5th day of each calendar month, commencing from ${fmtDate(f.startDate)}.

4. MODE OF PAYMENT
   Payments shall be made by account payee cheque / RTGS / NEFT / UPI / cash as mutually agreed. The Lender shall issue a signed receipt for each installment received.

5. REPAYMENT SCHEDULE TABLE
   Month 1  — Due: ${fmtDate(f.startDate)} — Amount: ${amt(f.monthlyEMI)}
   Month 2  — Due: [Next month] — Amount: ${amt(f.monthlyEMI)}
   (Continuing monthly until all ${v(f.totalMonths)} installments are paid)
   Final Installment: Month ${v(f.totalMonths)}

6. PREPAYMENT
   The Borrower may prepay the outstanding loan amount in part or full at any time before the due date without incurring any prepayment penalty. Any prepayment shall be first applied toward accrued interest and then toward the principal.

7. LATE PAYMENT CHARGES
   In the event of failure to pay any installment on the due date, the Borrower shall pay:
   (a) Late payment charge at the rate of 2% per month on the overdue installment amount.
   (b) All costs incurred by the Lender in recovering the overdue amount.

8. DEFAULT AND ACCELERATION
   If the Borrower fails to pay 2 (Two) consecutive installments, the entire outstanding loan amount shall become immediately due and payable at the option of the Lender, without any further notice to the Borrower.

9. NO-DUES CERTIFICATE
   Upon full repayment of all installments and clearance of all dues, the Lender shall issue a No-Dues Certificate to the Borrower within 7 working days.

10. GOVERNING LAW AND JURISDICTION
    This Agreement is governed by the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
LENDER                            BORROWER
${v(f.lenderName)}                ${v(f.borrowerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

installment_agreement:f=>`INSTALLMENT PAYMENT AGREEMENT

This Installment Payment Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

SELLER / RECEIVER:
Name: ${v(f.party2)}
(hereinafter referred to as "the Seller")

                                    — AND —

BUYER / PAYER:
Name: ${v(f.party1)}
(hereinafter referred to as "the Buyer")

SUBJECT MATTER: ${v(f.description)}

WHEREAS the Seller has agreed to sell / provide the above goods / services / property to the Buyer, AND the Buyer desires to pay the total consideration in installments as set out herein, AND the Seller has agreed to accept payment in installments subject to the terms and conditions hereinafter stated.

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. TOTAL CONSIDERATION
   The total price / consideration for ${v(f.description)} is:
   ${amt(f.totalAmount)}
   (Rupees ${toWords(parseInt(f.totalAmount||0))} Only)

2. INSTALLMENT SCHEDULE
   The Buyer agrees to pay the total consideration in ${v(f.numberOfInstallments)} (${toWords(parseInt(f.numberOfInstallments||0))}) installments as follows:
   Each Installment Amount: ${amt(f.installmentAmount)}
   First Installment Due Date: ${fmtDate(f.startDate)}
   Subsequent installments: On the same date of each succeeding month.
   Total Installments: ${v(f.numberOfInstallments)}
   Total Amount Payable: ${amt((parseInt(f.installmentAmount||0)*parseInt(f.numberOfInstallments||0)).toString())}

3. TRANSFER OF TITLE / OWNERSHIP
   Title and ownership of the goods / property shall remain vested with the Seller until the Buyer has made full payment of all installments. The Buyer shall obtain title only upon payment of the final installment.

4. POSSESSION
   Possession of the goods / property shall be given to the Buyer on the date of this Agreement / on payment of the first installment, subject to title remaining with the Seller until full payment.

5. DEFAULT IN PAYMENT
   (a) If the Buyer fails to pay any installment within 7 days of the due date, the Seller shall be entitled to:
       (i) Charge late payment penalty at 2% per month on the overdue amount.
       (ii) Demand the entire outstanding balance immediately.
       (iii) Repossess the goods / property after giving 15 days written notice.
   (b) All installments paid shall be subject to forfeiture at the Seller's option in case of default.

6. RECEIPT AND ACKNOWLEDGEMENT
   The Seller shall issue a proper receipt for each installment paid by the Buyer.

7. EARLY PAYMENT
   The Buyer may pay any installment early without penalty. Early payment shall not entitle the Buyer to any discount unless separately agreed in writing.

8. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872, the Sale of Goods Act, 1930, and applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
SELLER / RECEIVER                 BUYER / PAYER
${v(f.party2)}                    ${v(f.party1)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

advance_receipt:f=>`ADVANCE PAYMENT RECEIPT

Receipt No: ADV-${new Date().getFullYear()}-${RN()}${RN()}
Date: ${fmtDate(f.date)}

RECEIVED WITH THANKS FROM: ${v(f.payerName)}

ADVANCE AMOUNT RECEIVED: ${amt(f.amount)}
(Rupees ${toWords(parseInt(f.amount||0))} Only)

PURPOSE OF ADVANCE: ${v(f.purpose)}

MODE OF PAYMENT: ${v(f.paymentMode)}

${f.balanceAmount && f.balanceAmount.trim() && f.balanceAmount !== '0'
  ? `BALANCE AMOUNT REMAINING: ${amt(f.balanceAmount)}\n(Rupees ${toWords(parseInt(f.balanceAmount||0))} Only)`
  : ''}

TERMS AND CONDITIONS:

1. This receipt acknowledges payment of the above advance amount by ${v(f.payerName)} to ${v(f.receiverName)}.

2. The above advance amount is received as part / full advance payment for: ${v(f.purpose)}.

3. ADJUSTMENT OF ADVANCE:
   This advance amount shall be adjusted / set off against the final invoice / total consideration payable upon completion / delivery.

4. REFUND POLICY:
   ${v(f.purpose).toLowerCase().includes('property') || v(f.purpose).toLowerCase().includes('house') || v(f.purpose).toLowerCase().includes('flat') || v(f.purpose).toLowerCase().includes('land')
     ? `In the event the transaction does not proceed due to default by the receiver / seller, the advance shall be refunded with interest. In the event of default by the payer / buyer, the advance amount shall be liable to forfeiture.`
     : `Refund of this advance shall be governed by the terms of the main agreement / contract between the parties.`}

5. This receipt is valid subject to realisation of the amount in the case of cheque / draft payment.

6. This advance payment does not constitute a concluded contract unless a separate written agreement is executed.

I, ${v(f.receiverName)}, hereby acknowledge receipt of the above advance amount.

                                        ________________________
                                        Signature
                                        Name: ${v(f.receiverName)}
                                        Date: ${fmtDate(f.date)}

PAYER'S ACKNOWLEDGEMENT:
I, ${v(f.payerName)}, confirm payment of the above advance.
Signature: _______________________  Date: _______________`,

loan_acknowledgement:f=>`LOAN ACKNOWLEDGEMENT LETTER

Date: ${fmtDate(f.date)}
Place: ${v(f.city)}, Kerala

To,
${v(f.lenderName)}
${v(f.city)}

Dear ${v(f.lenderName)},

SUBJECT: ACKNOWLEDGEMENT OF RECEIPT OF LOAN AMOUNT OF ${amt(f.loanAmount)}

I, ${v(f.borrowerName)}, hereby ACKNOWLEDGE and CONFIRM having received from you a sum of:
${amt(f.loanAmount)}
(Rupees ${toWords(parseInt(f.loanAmount||0))} Only)

as a loan on ${fmtDate(f.receivedDate)}, by way of cash / cheque / bank transfer / UPI (as applicable).

REPAYMENT TERMS:
${f.terms && f.terms.trim() ? v(f.terms) : 'The loan shall be repaid as mutually agreed between the parties.'}

I HEREBY UNDERTAKE AND CONFIRM THAT:

1. I have received the above loan amount in good faith and for legitimate personal / business purposes.

2. I shall repay the said loan amount together with interest (if any) strictly as per the repayment terms stated above.

3. I acknowledge that this loan is being extended to me in good faith by ${v(f.lenderName)} and I shall not use the loan amount for any illegal or speculative purpose.

4. In the event of my failure to repay the loan on the due date, the lender shall be entitled to recover the full outstanding amount together with interest and costs through appropriate legal proceedings.

5. I confirm that I have full capacity and authority to borrow this loan and it does not violate any agreement, court order or obligation binding on me.

6. This acknowledgement letter shall be treated as prima facie evidence of my liability to repay the above loan amount.

Yours faithfully,

________________________
${v(f.borrowerName)}
Date: ${fmtDate(f.date)}
Place: ${v(f.city)}

WITNESS:
1. Name: _______________________  Signature: _______________________`,

surety_bond:f=>`SURETY BOND / GUARANTEE BOND

This Surety Bond (hereinafter referred to as "the Bond") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

KNOW ALL MEN BY THESE PRESENTS THAT:

PRINCIPAL DEBTOR:
Name: ${v(f.principalName)}
(hereinafter referred to as "the Principal")

SURETY / GUARANTOR:
Name: ${v(f.suretyName)}
(hereinafter referred to as "the Surety")

IN FAVOUR OF:
Name: ${v(f.creditorName)}
(hereinafter referred to as "the Creditor / Beneficiary")

PURPOSE: ${v(f.purpose)}
SURETY AMOUNT: ${amt(f.amount)}

WHEREAS the Creditor has agreed to extend certain facilities / loan / benefit to the Principal, subject to the Principal furnishing adequate security, AND the Surety has agreed to stand as surety and guarantor for the Principal on the terms and conditions set out herein.

NOW THIS BOND WITNESSES AS FOLLOWS:

1. GUARANTEE
   The Surety hereby unconditionally and irrevocably guarantees to the Creditor the due and punctual performance by the Principal of all obligations and the repayment of all amounts due by the Principal to the Creditor in respect of: ${v(f.purpose)}, up to the maximum amount of:
   ${amt(f.amount)}

2. NATURE OF LIABILITY
   (a) The liability of the Surety under this Bond is co-extensive with that of the Principal.
   (b) The Surety's liability is PRIMARY and not merely secondary — the Creditor may proceed against the Surety without first proceeding against the Principal or exhausting remedies against the Principal.
   (c) The Surety waives the benefit of discussion (the right to require the Creditor to first exhaust remedies against the Principal).

3. CONTINUING GUARANTEE
   This is a CONTINUING GUARANTEE and shall cover all present and future obligations of the Principal to the Creditor in respect of the above purpose, subject to the maximum surety amount.

4. DEMAND ON SURETY
   On receipt of a written demand from the Creditor, the Surety shall pay the demanded amount within 7 days without raising any objection or dispute. The Surety shall not be entitled to delay payment on the ground of any dispute between the Principal and Creditor.

5. PRESERVATION OF LIABILITY
   The Surety's liability under this Bond shall not be discharged or affected by:
   (a) Any indulgence, time or forbearance granted by the Creditor to the Principal.
   (b) Any variation in the terms of the agreement between the Principal and the Creditor.
   (c) The insolvency, death or incapacity of the Principal.
   (d) Any other dealing between the Principal and the Creditor.

6. SURETY'S RIGHT OF INDEMNITY
   Upon paying the Creditor any amount under this Bond, the Surety shall be entitled to be indemnified by the Principal for the full amount paid.

7. GOVERNING LAW
   This Bond is governed by Sections 126 to 147 of the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}, Kerala.

                                        ________________________
                                        SURETY / GUARANTOR
                                        ${v(f.suretyName)}
                                        Date: ${fmtDate(f.date)}

ACCEPTED BY CREDITOR:
                                        ________________________
                                        ${v(f.creditorName)}
                                        Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

indemnity_bond:f=>`INDEMNITY BOND

This Indemnity Bond (hereinafter referred to as "the Bond") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BY:
${v(f.indemnifierName)}
(hereinafter referred to as "the Indemnifier")

IN FAVOUR OF:
${v(f.indemnifiedName)}
(hereinafter referred to as "the Indemnified Party")

SUBJECT MATTER: ${v(f.indemnityScope)}
BOND AMOUNT: ${amt(f.bondAmount)}

WHEREAS the Indemnified Party has agreed to proceed with certain acts / transactions / dealings in favour of the Indemnifier subject to the Indemnifier furnishing this Indemnity Bond, AND the Indemnifier desires to indemnify the Indemnified Party against all losses, claims, damages, costs and expenses as detailed herein.

NOW THIS BOND WITNESSES AS FOLLOWS:

1. INDEMNITY COVENANT
   The Indemnifier hereby covenants, undertakes and agrees to indemnify, defend, protect and hold harmless the Indemnified Party from and against all actions, claims, demands, proceedings, losses, damages, costs, charges, expenses, taxes and liabilities arising out of or in connection with:
   ${v(f.indemnityScope)}

2. SPECIFIC INDEMNITY COVERAGE
   Without limiting the generality of Clause 1 above, the Indemnifier specifically indemnifies the Indemnified Party against:
   ${v(f.conditions)}

3. MAXIMUM LIABILITY
   The maximum liability of the Indemnifier under this Bond shall be limited to:
   ${amt(f.bondAmount)}

4. PAYMENT ON DEMAND
   Upon receipt of a written demand from the Indemnified Party stating the nature and quantum of loss, the Indemnifier shall make good the same within 15 (Fifteen) days.

5. DURATION AND PERPETUITY
   This Indemnity Bond is valid indefinitely from the date of execution and shall not be affected by the death, insolvency or dissolution of the Indemnifier. The obligations under this Bond shall be binding on the heirs, legal representatives, successors and estate of the Indemnifier.

6. SURVIVAL
   The obligations of this Bond shall survive the completion of the transaction / purpose for which it is given.

7. GOVERNING LAW
   This Bond is governed by Section 124 of the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}, Kerala.

                                        ________________________
                                        INDEMNIFIER
                                        ${v(f.indemnifierName)}
                                        Date: ${fmtDate(f.date)}

ACCEPTED BY:
                                        ________________________
                                        INDEMNIFIED PARTY
                                        ${v(f.indemnifiedName)}
                                        Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

mortgage_deed:f=>`SIMPLE MORTGAGE DEED
(Under Section 58(b) of the Transfer of Property Act, 1882)

This Simple Mortgage Deed (hereinafter referred to as "the Deed") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

MORTGAGOR:
Name: ${v(f.mortgagorName)}
(hereinafter referred to as "the Mortgagor")

                                    — AND —

MORTGAGEE:
Name: ${v(f.mortgageeName)}
(hereinafter referred to as "the Mortgagee")

PRINCIPAL AMOUNT: ${amt(f.loanAmount)}
RATE OF INTEREST: ${v(f.interest)}% per annum
REPAYMENT DATE: ${fmtDate(f.repaymentDate)}

MORTGAGED PROPERTY:
${v(f.propertyDetails)}, ${v(f.city)}, Kerala
(hereinafter referred to as "the Mortgaged Property")

WHEREAS the Mortgagor is the absolute owner of the Mortgaged Property and desires to borrow the above amount from the Mortgagee, AND the Mortgagee has agreed to advance the said amount subject to the Mortgagor mortgaging the above property as security, the parties agree as follows:

1. ADVANCE OF LOAN
   The Mortgagee has this day advanced to the Mortgagor a sum of ${amt(f.loanAmount)} (hereinafter referred to as "the Principal Amount"), receipt of which the Mortgagor hereby acknowledges.

2. RATE OF INTEREST
   The Mortgagor shall pay interest on the Principal Amount at the rate of ${v(f.interest)}% (${toWords(parseInt(f.interest||0))} percent) per annum, calculated on monthly reducing balance. Interest shall be paid on or before the 5th of each month.

3. REPAYMENT
   The Mortgagor shall repay the entire Principal Amount along with all accrued interest to the Mortgagee on or before ${fmtDate(f.repaymentDate)}, failing which the Mortgagee shall be entitled to enforce the mortgage.

4. MORTGAGE OF PROPERTY
   As security for repayment of the Principal Amount and interest, the Mortgagor hereby mortgages, charges and encumbers the Mortgaged Property in favour of the Mortgagee. The Mortgagor binds himself/herself and the Mortgaged Property to repay the Principal Amount with interest.

5. NATURE OF MORTGAGE
   This is a SIMPLE MORTGAGE under Section 58(b) of the Transfer of Property Act, 1882. The Mortgagor does not deliver possession of the Mortgaged Property to the Mortgagee.

6. COVENANTS OF MORTGAGOR
   The Mortgagor covenants with the Mortgagee that:
   (a) The Mortgaged Property is the Mortgagor's absolute property with clear and marketable title.
   (b) The Mortgaged Property is free from all prior encumbrances and charges.
   (c) The Mortgagor shall not create any further encumbrance on the Mortgaged Property without prior written consent.
   (d) The Mortgagor shall pay all property taxes and statutory dues of the Mortgaged Property.
   (e) The Mortgagor shall insure the Mortgaged Property against fire and other risks.

7. DEFAULT AND ENFORCEMENT
   In the event of the Mortgagor's failure to repay the loan on the due date:
   (a) The Mortgagee shall be entitled to file a suit for enforcement of the mortgage under Order XXXIV of the Code of Civil Procedure, 1908.
   (b) The Mortgagee shall be entitled to obtain a decree for sale of the Mortgaged Property.
   (c) Default shall attract additional penal interest at ${Math.min(parseInt(f.interest||0)+6,24)}% per annum from the date of default.

8. REDEMPTION
   Upon full repayment of the Principal Amount and all accrued interest, the Mortgagee shall execute a Deed of Reconveyance / Discharge of Mortgage in favour of the Mortgagor within 15 days.

9. GOVERNING LAW
   This Deed is governed by the Transfer of Property Act, 1882, the Registration Act, 1908, and all applicable Indian laws. This Deed must be compulsorily registered. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
MORTGAGOR                         MORTGAGEE
${v(f.mortgagorName)}             ${v(f.mortgageeName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

[IMPORTANT: A Simple Mortgage Deed must be compulsorily registered under Section 17 of the Registration Act, 1908. An unregistered mortgage deed is void against any subsequent transferee and has no legal effect. Stamp duty is payable under the Kerala Stamp Act at the applicable rate on the loan amount.]`,

financial_affidavit:f=>`AFFIDAVIT OF FINANCIAL STATUS

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear this affidavit.

2. That I am making this affidavit for the purpose of: ${v(f.purpose)}.

3. FINANCIAL STATUS DECLARATION:
   ${v(f.financialDetails)}

4. That I specifically declare:
   (a) INCOME: My gross annual income from all sources is as stated above.
   (b) ASSETS: All movable and immovable assets owned by me are as stated above.
   (c) LIABILITIES: All my outstanding loans, dues and liabilities are as stated above.
   (d) BANK ACCOUNTS: I maintain bank accounts in my name / jointly with others as stated.

5. That the financial information stated herein is true, complete and accurate as of the date of this affidavit.

6. That I have not concealed any income, asset, liability or financial transaction that is material to the purpose for which this affidavit is made.

7. That no insolvency proceedings are pending against me in any court or authority.

8. That I am not a declared insolvent or an undischarged bankrupt.

9. That I am making this affidavit in full knowledge that it may be relied upon by concerned authorities and financial institutions for the purpose stated above.

10. That all facts stated herein are true and correct to the best of my knowledge and belief. I am aware that a false financial affidavit may attract proceedings under Section 191 / 193 of the Indian Penal Code / Sections 218 / 221 of the Bharatiya Nyaya Sanhita, 2023 and the Insolvency and Bankruptcy Code, 2016.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

bank_guarantee:f=>`PERSONAL GUARANTEE LETTER
(To Bank / Financial Institution / Creditor)

Date: ${fmtDate(f.date)}
Place: ${v(f.city)}, Kerala
Ref. No: PG/${new Date().getFullYear()}/${RN()}

To,
The Manager / Authorised Officer
${v(f.beneficiaryName)}
${v(f.city)}

Dear Sir / Madam,

SUBJECT: PERSONAL GUARANTEE FOR ${v(f.principalName)} — AMOUNT: ${amt(f.amount)}

PURPOSE: ${v(f.purpose)}

I, ${v(f.guarantorName)}, residing at ${v(f.city)}, Kerala, do hereby offer myself as Personal Guarantor for the above-mentioned purpose in favour of ${v(f.principalName)} (hereinafter referred to as "the Borrower / Principal").

1. GUARANTEE
   In consideration of you granting the above facility to ${v(f.principalName)}, I hereby unconditionally and irrevocably guarantee to you the repayment of all amounts due by ${v(f.principalName)} in respect of the above facility, up to a maximum amount of:
   ${amt(f.amount)}
   together with all interest, charges, costs and expenses.

2. NATURE OF LIABILITY
   (a) My liability as Guarantor is joint and several with that of the Borrower.
   (b) My liability is primary and not merely secondary — you may proceed against me directly without first proceeding against the Borrower or any security.
   (c) I waive the right to require you to first exhaust remedies against the Borrower (benefit of discussion).

3. DEMAND
   On receipt of your written demand, I shall pay the demanded amount within 7 (Seven) days without any objection or dispute.

4. CONTINUING GUARANTEE
   This guarantee is a continuing obligation and shall cover all advances, renewals, variations and extensions of the facility.

5. NON-DISCHARGE
   My liability as Guarantor shall not be discharged by:
   (a) Any indulgence, time or concession granted to the Borrower.
   (b) Any variation in the terms of the facility.
   (c) The Borrower's insolvency, death, dissolution or change in constitution.
   (d) Any failure to enforce security taken from the Borrower.

6. REPRESENTATIONS
   I confirm that:
   (a) I have full knowledge of the Borrower's financial affairs.
   (b) I have the financial capacity to honour this guarantee.
   (c) This guarantee does not conflict with any legal obligation binding on me.
   (d) I am not under any legal incapacity to give this guarantee.

7. GOVERNING LAW
   This guarantee is governed by Sections 126 to 147 of the Indian Contract Act, 1872 and all applicable banking regulations including RBI guidelines.

Yours faithfully,

________________________
GUARANTOR
Name: ${v(f.guarantorName)}
Date: ${fmtDate(f.date)}
Place: ${v(f.city)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

[Note: Personal Guarantee letters are governed by the Indian Contract Act, 1872. Banks and financial institutions typically require this guarantee to be executed on stamp paper and notarised. The guarantor's liability may be enforced through civil suit and / or proceedings under the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest (SARFAESI) Act, 2002.]`,


// ═══════════════════════════════════════════════════════════════
// PHASE 4 — BUSINESS DOCUMENTS (16 docs) — Maximum Detail
// ═══════════════════════════════════════════════════════════════

service_agreement:f=>{
  const fee = parseInt(f.serviceFee || 0);
  const gstRate = parseFloat(f.gstRate || 18);
  const gstAmt = Math.round(fee * gstRate / 100);
  const totalWithGst = fee + gstAmt;
  const hasGst = vo(f.gstApplicable) && f.gstApplicable.toLowerCase() !== 'no';
  return `${docHeader('SERVICE AGREEMENT','SA',f)}

This Service Agreement ("Agreement") is entered into on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala, between:

SERVICE PROVIDER:
  Name / Entity  : ${v(f.providerName)}
  Address        : ${v(f.providerAddress||f.city)}, Kerala
  GST No.        : ${v(f.providerGST||'Not Registered / ___')}
  PAN No.        : ${v(f.providerPan||'___')}
  (hereinafter referred to as "the Service Provider")

AND

CLIENT:
  Name / Entity  : ${v(f.clientName)}
  Address        : ${v(f.clientAddress||f.city)}, Kerala
  GST No.        : ${v(f.clientGST||'Not Registered / ___')}
  PAN No.        : ${v(f.clientPan||'___')}
  (hereinafter referred to as "the Client")

WHEREAS the Client desires to engage the Service Provider to render the services described herein, and the Service Provider agrees to render the same on the terms and conditions set out below:

1. SCOPE OF SERVICES
   The Service Provider shall provide the following services ("the Services"):
   ${v(f.scopeOfServices)}

   Deliverables: ${v(f.deliverables||'As mutually agreed and set out in the project brief.')}
   Milestones  : ${v(f.milestones||'As agreed between the parties from time to time in writing.')}

2. TERM
   This Agreement commences on ${fmtDate(f.startDate||f.date)} and shall continue until ${fmtDate(f.endDate||'')||v(f.duration)||'completion of the Services'}, unless terminated earlier as provided herein.

3. FEES AND PAYMENT
─────────────────────────────────────────────────────
  Service Fee (excluding GST) : ${amt(f.serviceFee)}
  ${hasGst ? `GST @ ${gstRate}%              : ${amt(gstAmt.toString())}
  Total Payable (incl. GST)   : ${amt(totalWithGst.toString())}` : `GST                         : Not Applicable`}
  Payment Schedule            : ${v(f.paymentSchedule||'As mutually agreed')}
  Payment Mode                : ${v(f.paymentMode||'Bank transfer / UPI / Cheque')}
  Late Payment Interest       : 18% per annum on overdue amounts
─────────────────────────────────────────────────────
   TDS Deduction: ${v(f.tdsApplicable||'The Client shall deduct TDS at applicable rates under the Income Tax Act, 1961, and issue Form 16A / TDS certificate promptly.')}

4. OBLIGATIONS OF SERVICE PROVIDER
   (a) Perform the Services with professional care, skill and diligence.
   (b) Comply with all applicable laws and regulations.
   (c) Assign qualified personnel to the project.
   (d) Keep the Client reasonably informed of progress.
   (e) Maintain confidentiality of all Client data and information.

5. OBLIGATIONS OF CLIENT
   (a) Provide timely instructions, materials, approvals and access necessary for performance of the Services.
   (b) Make payments as per the agreed schedule.
   (c) Not unreasonably withhold approval of deliverables that meet agreed specifications.

6. INTELLECTUAL PROPERTY
   ${v(f.ipClause||`(a) All pre-existing intellectual property of each party remains that party's property.
   (b) All deliverables created specifically for the Client under this Agreement shall, upon full payment, vest in the Client.
   (c) The Service Provider retains the right to use the Client's name as a portfolio reference.`)}

7. CONFIDENTIALITY
   Both parties shall maintain strict confidentiality of all Confidential Information disclosed during the term of this Agreement and for 3 years thereafter. This clause survives termination.

8. LIMITATION OF LIABILITY
   (a) The Service Provider's total liability under this Agreement shall not exceed the total fees paid for the specific service that caused the loss.
   (b) Neither party shall be liable for indirect, special, consequential or punitive damages.

9. ${forceMajeureClause}

10. TERMINATION
    (a) Either party may terminate this Agreement by giving ${v(f.terminationNotice||'30')} days' written notice.
    (b) The Client may terminate immediately for material breach by the Service Provider that is not cured within 7 days of notice.
    (c) The Service Provider may terminate immediately for non-payment beyond 30 days of due date.
    (d) On termination, the Client shall pay for all Services satisfactorily rendered up to the date of termination.

11. ${arbitrationClause(f.city)}

12. ${govLaw(f, 'the Indian Contract Act, 1872, Information Technology Act, 2000, and all other applicable laws')}

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

________________________          ________________________
SERVICE PROVIDER                  CLIENT
${v(f.providerName)}              ${v(f.clientName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

${witnessBlock}`;
},

vendor_agreement:f=>`VENDOR SUPPLY AGREEMENT

This Vendor Supply Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

VENDOR:
Name / Company: ${v(f.vendorName)}
(hereinafter referred to as "the Vendor")

                                    — AND —

BUYER / COMPANY:
Name / Company: ${v(f.buyerName)}
(hereinafter referred to as "the Buyer")

WHEREAS the Buyer desires to procure goods / services from the Vendor, and the Vendor agrees to supply the same on the terms and conditions set out below.

1. SCOPE OF SUPPLY
   The Vendor agrees to supply the following goods / services:
   ${v(f.goodsServices)}
   Total Contract Value: ${amt(f.amount)}

2. DELIVERY TERMS
   ${v(f.deliveryTerms)}
   Delivery period: ${v(f.duration)} months from ${fmtDate(f.startDate)}.
   Delivery shall be at the Buyer's premises / as mutually agreed. Risk passes to Buyer on delivery.

3. PAYMENT TERMS
   ${v(f.paymentTerms)}
   All invoices must be GST-compliant. TDS shall be deducted as per applicable provisions of the Income Tax Act, 1961, and TDS certificates shall be issued.

4. QUALITY AND SPECIFICATIONS
   (a) All goods / services shall conform to the agreed specifications, drawings and standards.
   (b) The Vendor shall supply goods that are free from defects in material and workmanship.
   (c) The Buyer reserves the right to inspect and reject non-conforming goods.

5. WARRANTY
   The Vendor warrants all goods supplied against defects in material and workmanship for a period of 12 months from the date of delivery. Defective goods shall be replaced or repaired at the Vendor's cost within 7 days of notice.

6. PENALTIES FOR DELAY
   Delayed delivery shall attract a penalty of 0.5% (Half percent) of the invoice value per week of delay, subject to a maximum of 5% of the total order value.

7. INDEMNITY
   The Vendor shall indemnify the Buyer against all claims, losses, damages and costs arising from:
   (a) Defective goods / services supplied.
   (b) Infringement of any third-party patent, trademark or intellectual property.
   (c) The Vendor's employees' negligence or misconduct on the Buyer's premises.

8. STATUTORY COMPLIANCE
   The Vendor shall comply with all applicable laws including GST, Labour Laws, Factories Act, Environmental Laws, and all other applicable statutes. The Vendor shall provide all statutory registrations and compliances on request.

9. CONFIDENTIALITY
   The Vendor shall treat all information relating to the Buyer's business as confidential and shall not disclose the same to any third party.

10. TERMINATION
    (a) Either party may terminate with 30 days written notice.
    (b) Buyer may terminate immediately on material breach, insolvency or persistent delays.
    (c) On termination, the Buyer shall pay for goods / services actually delivered and accepted.

11. GOVERNING LAW AND JURISDICTION
    This Agreement is governed by the Indian Contract Act, 1872, the Sale of Goods Act, 1930, and applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
VENDOR                            BUYER / COMPANY
${v(f.vendorName)}                ${v(f.buyerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

freelance_contract:f=>`FREELANCE / INDEPENDENT CONTRACTOR AGREEMENT

This Freelance Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

CLIENT:
Name / Company: ${v(f.clientName)}
(hereinafter referred to as "the Client")

                                    — AND —

FREELANCER / INDEPENDENT CONTRACTOR:
Name: ${v(f.freelancerName)}
(hereinafter referred to as "the Freelancer")

1. PROJECT DESCRIPTION
   The Freelancer agrees to complete the following project for the Client:
   ${v(f.projectDescription)}
   (hereinafter referred to as "the Project")

2. PROJECT TIMELINE
   Project Commencement: ${fmtDate(f.date)}
   Project Deadline: ${fmtDate(f.deadline)}
   Revisions Included: ${v(f.revisions)}

3. PROJECT FEE
   Total Project Fee: ${amt(f.projectFee)}
   Payment Schedule: ${v(f.paymentSchedule)}
   Invoices to be paid within 7 days of submission. Delayed payment attracts 18% per annum interest.

4. INDEPENDENT CONTRACTOR STATUS
   (a) The Freelancer is an INDEPENDENT CONTRACTOR and NOT an employee of the Client.
   (b) This Agreement does not create any employer-employee relationship.
   (c) The Freelancer is responsible for all applicable taxes on fees received, including income tax and GST (if applicable).
   (d) The Client shall not be liable for any statutory benefits, PF, ESI, gratuity or any other employment benefit.

5. INTELLECTUAL PROPERTY
   (a) All deliverables, work product, designs, code, content and other material created by the Freelancer specifically for this Project shall, upon receipt of full payment, become the exclusive property of the Client.
   (b) The Freelancer assigns all copyright, design rights and intellectual property in the deliverables to the Client upon full payment.
   (c) The Freelancer retains the right to display the work in his/her portfolio with prior written consent of the Client.
   (d) The Freelancer warrants that the deliverables do not infringe any third-party intellectual property rights.

6. REVISIONS AND CHANGES
   (a) ${v(f.revisions)} are included in the project fee.
   (b) Additional revisions beyond the included rounds shall be charged separately at a mutually agreed rate.
   (c) Changes to the project scope must be agreed in writing and may attract additional fees.

7. CONFIDENTIALITY
   The Freelancer shall maintain strict confidentiality of all information, data, business plans and trade secrets of the Client shared during this engagement. This obligation continues for 2 years after project completion.

8. KILL FEE / CANCELLATION
   (a) If the Client cancels the project after work has commenced, the Client shall pay for all work completed up to the cancellation date, at a pro-rata rate.
   (b) The Freelancer shall promptly deliver all completed work product on cancellation.

9. WARRANTIES
   The Freelancer warrants that:
   (a) The work will be original and not plagiarised.
   (b) The work will not infringe any third-party rights.
   (c) The Freelancer has full authority to enter into this Agreement.

10. LIMITATION OF LIABILITY
    The Freelancer's maximum liability shall not exceed the total fees paid under this Agreement.

11. GOVERNING LAW AND JURISDICTION
    This Agreement is governed by the Indian Contract Act, 1872. Jurisdiction: ${v(f.city)}.

________________________          ________________________
CLIENT                            FREELANCER
${v(f.clientName)}                ${v(f.freelancerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}`,

partnership_dissolution:f=>`DEED OF DISSOLUTION OF PARTNERSHIP FIRM

This Deed of Dissolution (hereinafter referred to as "the Deed") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

1. ${v(f.partner1)} ("Partner 1")
2. ${v(f.partner2)} ("Partner 2")

(hereinafter collectively referred to as "the Partners")

FIRM: M/s ${v(f.firmName)}, ${v(f.city)}, Kerala

RECITALS:
WHEREAS the Partners have been carrying on business in partnership under the firm name M/s ${v(f.firmName)} pursuant to a Partnership Deed executed earlier, AND the Partners have mutually agreed to dissolve the said Partnership Firm with effect from ${fmtDate(f.dissolutionDate)}.

NOW THIS DEED WITNESSES AS FOLLOWS:

1. DISSOLUTION
   The Partnership Firm M/s ${v(f.firmName)} is hereby dissolved by mutual consent of all Partners with effect from ${fmtDate(f.dissolutionDate)} (hereinafter referred to as "the Dissolution Date").

2. SETTLEMENT OF ACCOUNTS
   (a) A final account of the Firm has been / shall be prepared as on the Dissolution Date.
   (b) All assets of the Firm shall be realised and all liabilities shall be discharged.
   ${v(f.settlementTerms)}

3. DISTRIBUTION OF ASSETS AND LIABILITIES
   After payment of all debts and liabilities of the Firm (including to third parties), the remaining assets / surplus shall be distributed between the Partners as per their agreed profit-sharing ratio / as mutually agreed:
   ${v(f.settlementTerms)}

4. OUTSTANDING LIABILITIES
   All outstanding liabilities, debts, obligations and dues of the Firm as on the Dissolution Date shall be jointly settled by the Partners. Each Partner shall bear their proportionate share of any liability not yet settled.

5. BANK ACCOUNTS
   All partnership bank accounts shall be operated jointly by the Partners for winding-up purposes. After settlement of all dues, all bank accounts shall be closed.

6. FIRM NAME
   After the Dissolution Date, no Partner shall use the firm name M/s ${v(f.firmName)} or any derivative thereof for any purpose whatsoever.

7. PUBLIC NOTICE
   The Partners shall jointly publish a notice of dissolution in a local newspaper circulating in ${v(f.city)} within 30 days of the Dissolution Date, as required under Section 45 of the Indian Partnership Act, 1932.

8. ROF INTIMATION
   The Partners shall jointly file an application with the Registrar of Firms for recording the dissolution of the Firm under Section 63 of the Indian Partnership Act, 1932.

9. PENDING CONTRACTS
   All contracts entered into by the Firm before the Dissolution Date shall be completed or wound up by the Partners jointly. Neither Partner shall enter into new contracts in the Firm's name after the Dissolution Date.

10. MUTUAL RELEASE
    Upon completion of settlement, each Partner shall release and discharge the other from all claims, liabilities and demands relating to the Firm and its business.

11. GOVERNING LAW
    This Deed is governed by the Indian Partnership Act, 1932 and the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
PARTNER 1                         PARTNER 2
${v(f.partner1)}                  ${v(f.partner2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

vendor_payment:f=>`VENDOR PAYMENT AGREEMENT

This Vendor Payment Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

VENDOR:
Name / Company: ${v(f.vendorName)}
GST No.: ${v(f.gstNumber||'As applicable')}
(hereinafter referred to as "the Vendor")

                                    — AND —

BUYER / COMPANY:
Name / Company: ${v(f.buyerName)}
(hereinafter referred to as "the Buyer")

SUBJECT / GOODS / SERVICES: ${v(f.goodsServices)}
TOTAL PAYABLE AMOUNT: ${amt(f.amount)}

1. PAYMENT OBLIGATION
   The Buyer acknowledges and agrees to pay the Vendor the sum of ${amt(f.amount)} for the goods / services described above.

2. PAYMENT SCHEDULE
   ${v(f.paymentTerms)}

3. GST AND INVOICING
   (a) The Vendor shall raise GST-compliant invoices for all payments due.
   (b) All amounts stated above are exclusive of GST, which shall be charged additionally at the applicable rate.
   (c) The Buyer shall be entitled to Input Tax Credit (ITC) on valid GST invoices raised by the Vendor.

4. TDS DEDUCTION
   The Buyer shall deduct Tax Deducted at Source (TDS) as applicable under the Income Tax Act, 1961 (Section 194C for contracts, Section 194J for professional fees, or as applicable), and shall issue TDS certificates (Form 16A) within the prescribed time.

5. CREDIT PERIOD AND LATE PAYMENT
   Invoices shall be paid within the credit period agreed above. In case of late payment, the Vendor shall be entitled to charge interest at 18% per annum on the overdue amount.

6. DISPUTE OF INVOICES
   If the Buyer disputes any invoice, it shall notify the Vendor within 7 days. Undisputed portions shall be paid within the credit period. Disputed amounts shall be resolved within 15 days of notification.

7. FULL AND FINAL SETTLEMENT
   Upon payment of the full amount under this Agreement, the Vendor shall issue a No-Dues Certificate confirming full and final settlement.

8. MSME PROVISIONS
   If the Vendor is an MSME registered under the MSMED Act, 2006, the Buyer agrees to pay within 45 days of acceptance of goods / services as required under Section 15 of the MSMED Act, 2006. Delayed payment to MSME shall attract compound interest at three times the bank rate notified by the RBI.

9. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872, the MSMED Act, 2006, and applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
VENDOR                            BUYER / COMPANY
${v(f.vendorName)}                ${v(f.buyerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

mou:f=>`MEMORANDUM OF UNDERSTANDING (MOU)

This Memorandum of Understanding (hereinafter referred to as "the MOU") is entered into on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

PARTY 1:
Name / Organisation: ${v(f.party1)}
Address: ${v(f.party1Address)}
(hereinafter referred to as "Party 1")

                                    — AND —

PARTY 2:
Name / Organisation: ${v(f.party2)}
Address: ${v(f.party2Address)}
(hereinafter referred to as "Party 2")

(Party 1 and Party 2 are hereinafter collectively referred to as "the Parties")

PURPOSE / SUBJECT:
${v(f.purpose)}

WHEREAS the Parties desire to formally record their mutual understanding regarding the above subject and to outline the framework for their collaboration / cooperation.

NOW THE PARTIES RECORD THEIR UNDERSTANDING AS FOLLOWS:

1. PURPOSE OF THIS MOU
   This MOU sets out the broad framework of understanding and cooperation between the Parties in relation to: ${v(f.purpose)}.

2. OBLIGATIONS OF PARTY 1
   ${v(f.obligations1)}

3. OBLIGATIONS OF PARTY 2
   ${v(f.obligations2)}

4. JOINT OBLIGATIONS
   Both Parties agree to:
   (a) Act in good faith and in the spirit of cooperation.
   (b) Maintain regular communication and share relevant information.
   (c) Promptly notify the other Party of any material change in circumstances.
   (d) Not take any unilateral action that adversely affects the other Party's interests under this MOU.

5. DURATION
   This MOU shall be effective from the date of signing and shall remain valid for a period of ${v(f.duration)} months, unless earlier terminated by mutual written consent or by either Party with 30 days written notice.

6. NON-BINDING NATURE
   This MOU is a statement of intent only. UNLESS EXPRESSLY STATED OTHERWISE, this MOU does not create legally binding obligations and shall not constitute a formal contract or agreement. Formal agreements, if required, shall be executed separately.
   [Note: Clauses 7 (Confidentiality) and 8 (Governing Law) are binding on the Parties.]

7. CONFIDENTIALITY (BINDING)
   All information, data and discussions exchanged pursuant to this MOU shall be treated as strictly confidential by both Parties and shall not be disclosed to any third party without prior written consent of the other Party.

8. GOVERNING LAW (BINDING)
   This MOU is governed by Indian law. Jurisdiction: Courts at ${v(f.city)}.

9. AMENDMENT
   This MOU may be amended only by a written document signed by authorised representatives of both Parties.

10. ENTIRE UNDERSTANDING
    This MOU represents the entire understanding between the Parties on the subject matter and supersedes all prior discussions and understandings.

________________________          ________________________
PARTY 1                           PARTY 2
${v(f.party1)}                    ${v(f.party2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

distributor_agreement:f=>`DISTRIBUTOR / DEALER AGREEMENT

This Distributor Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

SUPPLIER / MANUFACTURER:
Name / Company: ${v(f.supplierName)}
(hereinafter referred to as "the Supplier")

                                    — AND —

DISTRIBUTOR / DEALER:
Name / Company: ${v(f.distributorName)}
(hereinafter referred to as "the Distributor")

1. APPOINTMENT
   The Supplier hereby appoints the Distributor as its authorised distributor / dealer for the sale and distribution of the following products / product range:
   ${v(f.products)}
   in the following territory:
   ${v(f.territory)}
   This appointment is NON-EXCLUSIVE unless expressly stated otherwise in writing.

2. TERM
   This Agreement shall be valid for a period of ${v(f.duration)} months from ${fmtDate(f.date)}, renewable by mutual written consent.

3. DISTRIBUTOR'S OBLIGATIONS
   The Distributor agrees to:
   (a) Actively promote and sell the Supplier's products in the Territory.
   (b) Maintain adequate stock levels to meet market demand.
   (c) Not sell or promote competing products without prior written consent.
   (d) Meet the minimum purchase targets: ${v(f.targets||'As mutually agreed in writing')}
   (e) Maintain a proper sales network and after-sales support.
   (f) Not modify, repackage or relabel the Supplier's products without consent.
   (g) Comply with all applicable laws including GST, Shops & Establishments Act, etc.

4. SUPPLIER'S OBLIGATIONS
   The Supplier agrees to:
   (a) Supply products of agreed quality and specifications.
   (b) Provide necessary product training and marketing support.
   (c) Maintain consistent supply to meet the Distributor's orders.
   (d) Not appoint another distributor for the same Territory without giving the Distributor 60 days notice.

5. PRICING AND PAYMENT
   (a) Products shall be supplied at the Supplier's distributor price list as revised from time to time.
   (b) Payment Terms: ${v(f.paymentTerms)}
   (c) All invoices shall be GST-compliant. TDS shall be deducted as applicable.

6. INTELLECTUAL PROPERTY
   The Distributor is authorised to use the Supplier's trademarks, logos and brand materials solely for the purpose of selling and promoting the products in the Territory. All intellectual property rights remain with the Supplier.

7. TERMINATION
   (a) Either party may terminate with 60 days written notice.
   (b) The Supplier may terminate immediately on material breach, insolvency, or persistent failure to meet targets.
   (c) On termination, the Distributor shall immediately stop using the Supplier's brand materials and return unsold stock (subject to credit / refund at the Supplier's option).

8. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872, the Competition Act, 2002 and applicable laws. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
SUPPLIER / MANUFACTURER           DISTRIBUTOR / DEALER
${v(f.supplierName)}              ${v(f.distributorName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

agency_agreement:f=>`AGENCY / COMMISSION AGREEMENT

This Agency Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

PRINCIPAL:
Name / Company: ${v(f.principalName)}
(hereinafter referred to as "the Principal")

                                    — AND —

AGENT:
Name / Company: ${v(f.agentName)}
(hereinafter referred to as "the Agent")

1. APPOINTMENT OF AGENT
   The Principal hereby appoints the Agent as its authorised agent for the following purpose:
   Products / Services: ${v(f.products)}
   Territory: ${v(f.territory)}

2. TERM
   This Agreement is valid for ${v(f.duration)} months from ${fmtDate(f.date)}, renewable by mutual written consent.

3. AGENT'S DUTIES
   ${v(f.agentDuties)}
   The Agent shall additionally:
   (a) Diligently promote and solicit orders for the Principal's products / services.
   (b) Act solely in the best interests of the Principal.
   (c) Not represent any competing principal without prior written consent.
   (d) Provide regular reports on sales, market feedback and customer inquiries.
   (e) Not commit the Principal to any contract without prior written approval.
   (f) Not collect payments on behalf of the Principal unless expressly authorised.

4. COMMISSION
   The Agent shall be entitled to commission at the rate of: ${v(f.commission)}
   Commission shall be calculated on net sales (excluding GST and returns) actually realised by the Principal from orders procured by the Agent in the Territory.
   Commission shall be payable within 15 days of receipt of payment from the customer.

5. EXPENSES
   The Agent shall bear all expenses incurred in performing duties under this Agreement, unless expressly agreed otherwise.

6. INDEPENDENT CONTRACTOR
   The Agent is an independent contractor and NOT an employee of the Principal. The Agent has no authority to bind the Principal contractually without express written approval.

7. INTELLECTUAL PROPERTY
   The Agent may use the Principal's brand, trademark and marketing material only for the purpose of this Agreement. All intellectual property rights remain with the Principal.

8. CONFIDENTIALITY
   The Agent shall maintain strict confidentiality of the Principal's pricing, customer data, trade secrets and business information during and after this Agreement.

9. TERMINATION
   Either party may terminate with 30 days written notice. The Principal may terminate immediately on material breach or disloyalty.

10. GOVERNING LAW
    This Agreement is governed by the Indian Contract Act, 1872, and the Specific Relief Act, 1963. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
PRINCIPAL                         AGENT
${v(f.principalName)}             ${v(f.agentName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

sale_of_business:f=>`BUSINESS / SHOP SALE AGREEMENT

This Business Sale Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

SELLER / CURRENT OWNER:
Name: ${v(f.sellerName)}
(hereinafter referred to as "the Seller")

                                    — AND —

BUYER:
Name: ${v(f.buyerName)}
(hereinafter referred to as "the Buyer")

BUSINESS DETAILS:
Name: ${v(f.businessName)}
Address: ${v(f.businessAddress)}
Nature: ${v(f.businessDetails)}

WHEREAS the Seller is the owner of the above Business and desires to sell and transfer the Business along with all its assets and goodwill to the Buyer, AND the Buyer desires to purchase the same.

1. SALE OF BUSINESS
   The Seller agrees to sell and the Buyer agrees to purchase the Business as a going concern, including all assets listed herein, for a total consideration of:
   ${amt(f.saleAmount)}

2. PAYMENT TERMS
   Advance paid on signing: ${amt(f.advance||'0')}
   Balance payable on handover date: Rs. ${(parseInt(f.saleAmount||0)-parseInt(f.advance||0)).toLocaleString('en-IN')}/-
   Mode of payment: Account payee cheque / RTGS / NEFT.

3. ASSETS INCLUDED IN SALE
   The following assets are included in the sale:
   ${v(f.assetsIncluded)}
   Including all furniture, fixtures, equipment, stock-in-trade, trade receivables (if any), customer goodwill, trade name (${v(f.businessName)}), and all licenses / registrations transferred as legally permissible.

4. LIABILITIES
   ${f.liabilities && f.liabilities.trim() ? `The following liabilities shall be transferred to the Buyer:\n   ${v(f.liabilities)}` : `All existing liabilities, debts and dues of the Business up to the handover date shall be the sole responsibility of the Seller and shall be cleared before handover.`}

5. HANDOVER DATE
   The Seller shall hand over the Business with all assets, books, licenses, keys and other materials to the Buyer on: ${fmtDate(f.handoverDate)}.

6. GOODWILL AND NON-COMPETE
   (a) The Seller sells the goodwill of M/s ${v(f.businessName)} to the Buyer.
   (b) For a period of 2 years from the handover date, the Seller shall not carry on the same or similar business within _____ km radius of the Business location.
   (c) The Seller shall not solicit existing customers or employees of the Business.

7. WARRANTIES BY SELLER
   The Seller warrants that:
   (a) The Seller is the absolute and lawful owner of the Business.
   (b) All assets are free from encumbrances and third-party claims.
   (c) All statutory compliances (GST, labour laws, licenses) are up to date.
   (d) No pending disputes, litigation or regulatory proceedings exist against the Business.

8. TRANSITION ASSISTANCE
   The Seller agrees to assist the Buyer for a period of 30 days after handover for smooth transition, including introduction to suppliers, customers and staff.

9. GOVERNING LAW AND JURISDICTION
   This Agreement is governed by the Indian Contract Act, 1872, the Transfer of Property Act, 1882, and applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
SELLER                            BUYER
${v(f.sellerName)}                ${v(f.buyerName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

business_dissolution:f=>`BUSINESS CLOSURE / WINDING UP LETTER

Date: ${fmtDate(f.date)}
Ref. No: WIND/${new Date().getFullYear()}/${RN()}

FROM:
${v(f.ownerName)}
Proprietor / Owner
${v(f.businessName)}
${v(f.city)}, Kerala

TO ALL CONCERNED PARTIES / CUSTOMERS / SUPPLIERS / CREDITORS

SUBJECT: NOTICE OF CLOSURE OF BUSINESS — M/s ${v(f.businessName)}

This is to formally notify all concerned persons, organisations, banks, government authorities, vendors, customers, creditors and all other stakeholders that:

M/s ${v(f.businessName)}, carrying on the business of ${v(f.reason)}, has CEASED OPERATIONS with effect from ${fmtDate(f.closureDate)}.

REASON FOR CLOSURE:
${v(f.reason)}

PLEASE NOTE THE FOLLOWING:

1. CESSATION OF BUSINESS
   The business of M/s ${v(f.businessName)} has permanently ceased operations on ${fmtDate(f.closureDate)}. No new transactions, orders or commitments shall be entered into after this date.

2. OUTSTANDING DUES AND LIABILITIES
   ${f.outstandingDues && f.outstandingDues.trim() ? v(f.outstandingDues) : 'All outstanding dues, liabilities and obligations of the business will be settled at the earliest.'}
   All creditors are requested to submit their claims / invoices within 30 days of this notice.

3. REGULATORY COMPLIANCES
   (a) GST Registration cancellation proceedings have been / shall be initiated with the GST authorities.
   (b) All pending GST returns shall be filed up to the date of closure.
   (c) Trade licenses and other registrations shall be surrendered to the concerned authorities.
   (d) Final accounts of the business shall be prepared as on the closure date.

4. CONTACT FOR CLAIMS
   All claims, dues and inquiries may be addressed to:
   ${v(f.ownerName)}, ${v(f.city)}, Kerala.

5. LEGAL EFFECT
   After the closure date, ${v(f.ownerName)} shall not be responsible for any business transaction, obligation or liability incurred in the name of M/s ${v(f.businessName)} by any unauthorised person.

                                        ________________________
                                        ${v(f.ownerName)}
                                        Proprietor / Owner
                                        M/s ${v(f.businessName)}
                                        Date: ${fmtDate(f.date)}`,

non_compete:f=>`NON-COMPETE AGREEMENT

This Non-Compete Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

COMPANY / EMPLOYER:
Name / Company: ${v(f.party2)}
(hereinafter referred to as "the Company")

                                    — AND —

EMPLOYEE / EX-PARTNER / CONTRACTOR:
Name: ${v(f.party1)}
(hereinafter referred to as "the Covenantor")

WHEREAS the Covenantor has access to / had access to the Company's confidential information, trade secrets, customer relationships, business strategies and proprietary information, AND the Company desires to protect its legitimate business interests.

1. RESTRICTED ACTIVITIES
   The Covenantor covenants and agrees that during the Restriction Period, he/she shall NOT, directly or indirectly:
   ${v(f.restrictedActivities)}
   including without limitation:
   (a) Carry on, be engaged in, or be employed by any business that competes with the Company.
   (b) Set up, promote, assist or invest in any competing business.
   (c) Solicit or accept business from the Company's existing clients / customers.
   (d) Recruit or solicit the Company's employees or contractors.

2. RESTRICTED TERRITORY
   The restrictions in Clause 1 apply within the following territory:
   ${v(f.restrictedTerritory)}

3. RESTRICTION PERIOD
   The restrictions in Clause 1 shall apply for a period of ${v(f.duration)} months commencing from the date of termination of employment / contract / partnership with the Company.

4. CONSIDERATION
   In consideration of the restrictions accepted herein, the Company has provided / shall provide to the Covenantor adequate consideration including employment, remuneration, business opportunity and access to confidential information.

5. CONFIDENTIALITY
   The Covenantor shall continue to maintain strict confidentiality of all Company information, trade secrets, client data, financial data, pricing and proprietary processes even after the Restriction Period.

6. REASONABLENESS
   The Covenantor acknowledges that:
   (a) The restrictions are reasonable in scope, duration and territory.
   (b) The Company has legitimate business interests to protect.
   (c) The restrictions shall not unduly prevent the Covenantor from earning a livelihood.

7. ENFORCEMENT AND REMEDIES
   (a) The Covenantor acknowledges that breach would cause irreparable harm to the Company.
   (b) The Company shall be entitled to seek injunctive relief, specific performance and damages.
   (c) The Court may modify the restrictions to make them enforceable if found excessive.

8. LEGAL NOTE
   Non-compete agreements in India are subject to Section 27 of the Indian Contract Act, 1872, which restricts restraint of trade. Courts enforce non-compete clauses only to the extent they are reasonable in time, geography and scope, and protect legitimate business interests.

9. GOVERNING LAW
   This Agreement is governed by the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
COMPANY / EMPLOYER                COVENANTOR
${v(f.party2)}                    ${v(f.party1)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

intellectual_property:f=>`INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This Intellectual Property Assignment Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

ASSIGNOR (CURRENT OWNER):
Name: ${v(f.assignorName)}
(hereinafter referred to as "the Assignor")

                                    — AND —

ASSIGNEE (NEW OWNER):
Name: ${v(f.assigneeName)}
(hereinafter referred to as "the Assignee")

DESCRIPTION OF INTELLECTUAL PROPERTY:
${v(f.ipDescription)}
Type: ${v(f.ipType)}
(hereinafter referred to as "the Assigned IP")

CONSIDERATION: ${parseInt(f.consideration||0) > 0 ? amt(f.consideration) : 'As mutual love and goodwill / as per separate arrangement'}

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. ASSIGNMENT
   For the consideration stated above, the Assignor hereby absolutely, irrevocably and unconditionally assigns, transfers and conveys to the Assignee all rights, title and interest in and to the Assigned IP, including:
   (a) All copyright, design rights, trademark rights, patent rights and any other intellectual property rights in the Assigned IP, in India and worldwide.
   (b) All past, present and future rights of action for infringement or misuse of the Assigned IP.
   (c) All goodwill associated with the Assigned IP.
   (d) The right to seek registration of the Assigned IP in any jurisdiction.

2. CONSIDERATION
   ${parseInt(f.consideration||0) > 0 ? `In consideration of this assignment, the Assignee shall pay the Assignor ${amt(f.consideration)}.` : `This assignment is made voluntarily and without monetary consideration.`}

3. WARRANTIES BY ASSIGNOR
   The Assignor warrants and represents that:
   (a) The Assignor is the sole and absolute owner of the Assigned IP.
   (b) The Assigned IP does not infringe any third-party intellectual property rights.
   (c) The Assigned IP is free from all encumbrances, liens, claims and licenses.
   (d) No disputes, litigation or proceedings are pending in relation to the Assigned IP.
   (e) The Assignor has full authority to make this assignment.

4. FURTHER ASSURANCE
   The Assignor agrees to execute all such further documents, applications and instruments as may be necessary to perfect and record the Assignee's title to the Assigned IP, at the Assignee's request and cost.

5. MORAL RIGHTS (AUTHOR'S SPECIAL RIGHTS)
   To the extent permitted by law, the Assignor waives all moral rights (including the right of paternity and the right of integrity) in respect of the Assigned IP under Section 57 of the Copyright Act, 1957.

6. CONFIDENTIALITY
   Both parties shall maintain confidentiality of the terms of this Agreement.

7. GOVERNING LAW
   This Agreement is governed by the Copyright Act, 1957, the Trade Marks Act, 1999, the Patents Act, 1970, the Designs Act, 2000, the Indian Contract Act, 1872, and applicable laws. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
ASSIGNOR                          ASSIGNEE
${v(f.assignorName)}              ${v(f.assigneeName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

shareholder_agreement:f=>`SHAREHOLDER AGREEMENT

This Shareholder Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

COMPANY: ${v(f.company)} (hereinafter referred to as "the Company")

BETWEEN

SHAREHOLDER 1:
Name: ${v(f.shareholder1)}
Shareholding: ${v(f.shares1)}%
(hereinafter referred to as "Shareholder 1")

                                    — AND —

SHAREHOLDER 2:
Name: ${v(f.shareholder2)}
Shareholding: ${v(f.shares2)}%
(hereinafter referred to as "Shareholder 2")

(hereinafter collectively referred to as "the Shareholders")

WHEREAS the Shareholders are the shareholders of the Company and desire to record their rights and obligations with respect to their shareholding and the management of the Company.

1. SHAREHOLDING
   Shareholder 1 (${v(f.shareholder1)}): ${v(f.shares1)}% of the total paid-up share capital.
   Shareholder 2 (${v(f.shareholder2)}): ${v(f.shares2)}% of the total paid-up share capital.

2. BOARD COMPOSITION
   ${v(f.boardComposition)}
   All major business decisions shall require approval of a majority of the Board of Directors. The following matters shall require unanimous Board approval:
   (a) Increase in authorised / paid-up share capital.
   (b) Merger, acquisition or sale of substantial business assets.
   (c) Declaration of dividend.
   (d) Related-party transactions above Rs.10 lakhs.
   (e) Taking on debt above Rs.25 lakhs.

3. DIVIDEND POLICY
   ${v(f.dividendPolicy)}
   Dividends shall be declared as per the Companies Act, 2013 and applicable RBI / SEBI regulations.

4. TRANSFER OF SHARES — RIGHT OF FIRST REFUSAL
   If any Shareholder ("Transferor") desires to transfer his/her shares, the Transferor shall first offer such shares to the other Shareholders ("Offerees") at the same price and terms:
   (a) The Offeree shall have 30 days to accept the offer.
   (b) If the Offeree does not accept, the Transferor may transfer shares to a third party at not less than the offered price.
   ${v(f.transferRestrictions)}

5. DRAG-ALONG RIGHT
   If Shareholders holding more than 75% of total shares agree to sell their shares to a bona fide third-party buyer, they may require the remaining Shareholders to sell their shares on the same terms.

6. TAG-ALONG RIGHT
   If the majority Shareholders propose to sell more than 50% of total shares, minority Shareholders shall have the right to sell their shares along with the majority at the same price per share.

7. ANTI-DILUTION
   In the event of any further issue of shares, existing Shareholders shall have the right to participate in the new issue pro-rata to their existing shareholding (pre-emptive rights).

8. DEADLOCK
   In the event of a deadlock on any Board decision, the matter shall be referred to a mutually agreed mediator. If unresolved within 60 days, either Shareholder may trigger a buy-sell ("shotgun") mechanism.

9. CONFIDENTIALITY
   All Shareholders shall maintain strict confidentiality of the Company's business, financial and technical information.

10. GOVERNING LAW
    This Agreement is governed by the Companies Act, 2013, the Indian Contract Act, 1872, SEBI (if applicable), and applicable laws. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
SHAREHOLDER 1                     SHAREHOLDER 2
${v(f.shareholder1)}              ${v(f.shareholder2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

joint_venture:f=>`JOINT VENTURE AGREEMENT

This Joint Venture Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

PARTY 1:
Name / Company: ${v(f.party1)}
(hereinafter referred to as "Party 1")

                                    — AND —

PARTY 2:
Name / Company: ${v(f.party2)}
(hereinafter referred to as "Party 2")

(Party 1 and Party 2 are hereinafter collectively referred to as "the JV Partners")

JOINT VENTURE PROJECT: ${v(f.purpose)}
(hereinafter referred to as "the JV Project")

1. FORMATION OF JOINT VENTURE
   The JV Partners agree to collaborate and establish a Joint Venture for the purpose of:
   ${v(f.purpose)}
   The JV shall operate under the name: _________________________ (to be decided mutually).

2. DURATION
   The JV shall commence on ${fmtDate(f.date)} and shall continue for ${v(f.duration)} months, unless earlier terminated or extended by mutual written consent.

3. CAPITAL CONTRIBUTION
   ${v(f.capitalContribution)}
   Each JV Partner's contribution shall be used exclusively for the JV Project.

4. PROFIT AND LOSS SHARING
   Net profits and losses of the JV shall be shared between the JV Partners in the ratio of:
   ${v(f.profitSharing)}
   Accounts shall be reconciled at the end of each financial quarter.

5. MANAGEMENT AND GOVERNANCE
   (a) The JV shall be managed by a Joint Management Committee comprising representatives of both JV Partners.
   (b) Day-to-day operations may be delegated to a Project Manager mutually agreed.
   (c) Major decisions (above Rs.1 lakh expenditure, new contracts, new hires) require unanimous consent of both JV Partners.
   (d) Each JV Partner shall have equal voting rights in the Joint Management Committee.

6. BANKING
   A dedicated bank account shall be maintained for the JV in the joint names of the JV Partners. All withdrawals above Rs.25,000/- require dual signatures.

7. ACCOUNTS AND AUDIT
   Proper books of accounts shall be maintained for the JV. A joint audit shall be conducted annually or at the conclusion of the JV Project.

8. INTELLECTUAL PROPERTY
   All intellectual property created specifically for the JV Project shall be jointly owned by both JV Partners in equal proportion, unless separately agreed.

9. CONFIDENTIALITY
   Both JV Partners shall maintain strict confidentiality of the JV's business, financial and technical information.

10. NON-COMPETE DURING JV
    During the term of this JV, neither JV Partner shall undertake any project or business that directly competes with the JV Project without prior written consent.

11. TERMINATION
    (a) By mutual written consent at any time.
    (b) Automatically on completion of the JV Project.
    (c) By either party on 60 days notice after the initial 6 months.
    (d) Immediately on material breach not remedied within 30 days.

12. WINDING UP
    On termination, all JV assets shall be realised, liabilities discharged, and net proceeds distributed in the profit-sharing ratio.

13. GOVERNING LAW
    This Agreement is governed by the Indian Contract Act, 1872, the Indian Partnership Act, 1932 (by analogy), and applicable laws. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
PARTY 1                           PARTY 2
${v(f.party1)}                    ${v(f.party2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

software_license:f=>`SOFTWARE / SaaS LICENSE AGREEMENT

This Software License Agreement (hereinafter referred to as "the Agreement") is made and executed on ${fmtDate(f.date)}, at ${v(f.city)}.

BETWEEN

LICENSOR / SOFTWARE OWNER:
Name / Company: ${v(f.licensorName)}
(hereinafter referred to as "the Licensor")

                                    — AND —

LICENSEE:
Name / Company: ${v(f.licenseeName)}
(hereinafter referred to as "the Licensee")

SOFTWARE: ${v(f.softwareName)}
LICENSE TYPE: ${v(f.licenseType)}
LICENSE FEE: ${amt(f.licenseeFee)}
DURATION: ${v(f.duration)} months

1. GRANT OF LICENSE
   Subject to the terms and conditions of this Agreement, the Licensor hereby grants to the Licensee a LIMITED, NON-EXCLUSIVE, NON-TRANSFERABLE, REVOCABLE license to:
   ${v(f.permissions)}

2. RESTRICTIONS
   The Licensee shall NOT:
   ${v(f.restrictions)}
   Additionally, the Licensee shall not:
   (a) Copy, reproduce, redistribute, sublicense or resell the Software.
   (b) Reverse engineer, decompile, disassemble or attempt to derive source code.
   (c) Remove or alter any copyright, trademark or proprietary notices.
   (d) Use the Software for any illegal purpose.

3. OWNERSHIP
   The Software and all intellectual property rights therein (including source code, object code, documentation, databases and all modifications) shall remain the exclusive property of the Licensor. This Agreement grants a license only and does not transfer any ownership.

4. LICENSE FEE
   The Licensee shall pay: ${amt(f.licenseeFee)} as license fee for the duration of ${v(f.duration)} months.
   Payment shall be made within 7 days of signing this Agreement / as per the payment schedule agreed.

5. UPDATES AND SUPPORT
   The Licensor shall provide routine software updates and bug fixes during the license period. Technical support shall be provided as per the Licensor's standard support policy.

6. DATA SECURITY AND PRIVACY
   (a) The Licensor shall implement reasonable security measures to protect Licensee's data.
   (b) The Licensor shall process Licensee's data only as required to provide the software services.
   (c) Both parties shall comply with applicable data protection laws including the Digital Personal Data Protection Act, 2023.

7. CONFIDENTIALITY
   Both parties shall maintain confidentiality of all proprietary information exchanged under this Agreement.

8. DISCLAIMER OF WARRANTIES
   The Software is provided "AS IS". The Licensor makes no warranty that the Software will be error-free, uninterrupted or fit for a particular purpose beyond what is expressly stated.

9. LIMITATION OF LIABILITY
   The Licensor's maximum liability under this Agreement shall not exceed the license fee paid in the preceding 3 months.

10. TERMINATION
    (a) The Agreement terminates automatically at the end of the license period unless renewed.
    (b) Either party may terminate on 30 days written notice.
    (c) The Licensor may terminate immediately for breach of Clause 2.
    (d) On termination, the Licensee shall immediately cease using the Software and delete all copies.

11. GOVERNING LAW
    This Agreement is governed by the Information Technology Act, 2000, the Copyright Act, 1957, the Digital Personal Data Protection Act, 2023, and the Indian Contract Act, 1872. Jurisdiction: Courts at ${v(f.city)}.

________________________          ________________________
LICENSOR                          LICENSEE
${v(f.licensorName)}              ${v(f.licenseeName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}`,

website_tnc:f=>`WEBSITE TERMS AND CONDITIONS

TERMS AND CONDITIONS OF USE

Website: ${v(f.websiteUrl)}
Owner / Company: ${v(f.companyName)}
Contact: ${v(f.contactEmail)}
Effective Date: ${fmtDate(f.effectiveDate)}
Governing Jurisdiction: ${v(f.jurisdiction)}

PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THIS WEBSITE / APPLICATION.

By accessing or using this Website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this Website.

1. SERVICES OFFERED
   ${v(f.companyName)} provides the following services / products through this Website:
   ${v(f.servicesOffered)}

2. USER ELIGIBILITY
   This Website is intended for users who are 18 years of age or older. By using this Website, you represent that you are at least 18 years of age and have the legal capacity to enter into binding agreements.

3. USER OBLIGATIONS
   By using this Website, you agree to:
   ${v(f.userObligations)}
   You also agree NOT to:
   (a) Use the Website for any illegal or unauthorized purpose.
   (b) Transmit any harmful, offensive or illegal content.
   (c) Violate any applicable laws or regulations.
   (d) Attempt to gain unauthorized access to any part of the Website or its servers.
   (e) Engage in any conduct that disrupts or interferes with the Website's functioning.

4. INTELLECTUAL PROPERTY
   All content on this Website — including text, graphics, logos, images, audio, video, data and software — is the property of ${v(f.companyName)} and is protected by the Copyright Act, 1957, and applicable intellectual property laws. No content may be copied, reproduced, distributed or used without prior written consent.

5. PAYMENT AND REFUND POLICY
   ${f.paymentTerms && f.paymentTerms.trim() ? v(f.paymentTerms) : `Payments on this Website are processed through secure payment gateways. All sales are final unless otherwise stated. Refunds, if applicable, shall be processed within 7-10 working days.`}

6. PRIVACY POLICY
   Your use of this Website is also governed by our Privacy Policy, which is incorporated herein by reference. We comply with the Digital Personal Data Protection Act, 2023, and applicable privacy laws.

7. DISCLAIMER OF WARRANTIES
   This Website and its content are provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, express or implied. ${v(f.companyName)} does not warrant that the Website will be error-free or uninterrupted.

8. LIMITATION OF LIABILITY
   To the maximum extent permitted by applicable law, ${v(f.companyName)} shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of this Website.

9. INDEMNIFICATION
   You agree to indemnify and hold ${v(f.companyName)} harmless from any claim, damage, loss or expense arising from your breach of these Terms.

10. THIRD-PARTY LINKS
    This Website may contain links to third-party websites. ${v(f.companyName)} is not responsible for the content, privacy policies or practices of such websites.

11. MODIFICATION OF TERMS
    ${v(f.companyName)} reserves the right to modify these Terms at any time. Changes shall be effective upon posting on the Website. Continued use of the Website constitutes acceptance of modified Terms.

12. GOVERNING LAW AND JURISDICTION
    These Terms are governed by the laws of India including the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, the Consumer Protection Act, 2019, and the Indian Contract Act, 1872. Any dispute shall be subject to the exclusive jurisdiction of the courts at ${v(f.jurisdiction)}.

13. CONTACT INFORMATION
    For any queries regarding these Terms, contact: ${v(f.contactEmail)}

By using this Website, you confirm that you have read, understood and agree to these Terms and Conditions.

Last Updated: ${fmtDate(f.effectiveDate)}
© ${new Date().getFullYear()} ${v(f.companyName)}. All Rights Reserved.`,




resignation_acceptance:f=>`RESIGNATION ACCEPTANCE LETTER

${v(f.employerName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: RES-ACC/${new Date().getFullYear()}/${RN()}

To,
${v(f.employeeName)}
Designation: ${v(f.designation)}

Dear ${v(f.employeeName)},

SUBJECT: ACCEPTANCE OF RESIGNATION

We acknowledge receipt of your resignation letter dated ${fmtDate(f.resignDate)}, tendering your resignation from the position of ${v(f.designation)}.

After due consideration, the Management hereby accepts your resignation with effect from ${fmtDate(f.lastDate)}, which shall be your Last Working Day.

You are requested to complete the following before your last working day:
${f.handoverInstructions && f.handoverInstructions.trim() ? v(f.handoverInstructions) : `1. Complete handover of all pending tasks and projects to your replacement / reporting manager.
2. Return all Company property including laptop, access cards, ID card, and any other assets.
3. Clear all outstanding advances and loans from the Company.
4. Complete full and final settlement formalities with the HR department.`}

Your Relieving Letter and Experience Certificate will be issued within 7 working days after completion of the above formalities and settlement of all dues.

We wish you all the best in your future endeavours.

Yours sincerely,

________________________
${v(f.employerName)}
Authorised Signatory
Date: ${fmtDate(f.date)}`,

appointment_letter:f=>`APPOINTMENT LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: APPT/${new Date().getFullYear()}/${RN()}

To,
${v(f.employeeName)}

Dear ${v(f.employeeName)},

SUBJECT: APPOINTMENT AS ${v(f.designation).toUpperCase()}

We are pleased to appoint you as ${v(f.designation)} with ${v(f.companyName)}, with effect from ${fmtDate(f.joiningDate)}, on the following terms and conditions:

1. DESIGNATION: ${v(f.designation)}

2. DATE OF JOINING: ${fmtDate(f.joiningDate)}

3. PLACE OF WORK: ${v(f.workLocation)}

4. COMPENSATION: ${v(f.salary)}

5. PROBATION PERIOD: ${v(f.probation)}
   Your appointment is subject to satisfactory performance during the probation period. The Company reserves the right to extend the probation period at its discretion.

6. DUTIES AND RESPONSIBILITIES:
${v(f.duties)}

7. WORKING HOURS: As per the Company's policy in force from time to time.

8. LEAVE: As per the Company's Leave Policy.

9. CONFIDENTIALITY: You shall maintain strict confidentiality of all Company information, trade secrets, client data, and proprietary information during and after your employment.

10. CODE OF CONDUCT: You shall adhere to all Company policies, procedures and codes of conduct as may be issued from time to time.

11. NOTICE PERIOD: Either party may terminate this appointment by giving 30 days prior written notice or salary in lieu thereof after confirmation.

12. This appointment is subject to your submitting all original educational and experience documents for verification.

Kindly sign and return a copy of this letter as your acceptance.

We welcome you to our team and look forward to a long and mutually beneficial association.

Yours sincerely,

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}

ACCEPTANCE:
I, ${v(f.employeeName)}, hereby accept this appointment on the terms stated above.

Signature: _______________  Date: _______________`,

termination_letter:f=>`EMPLOYMENT TERMINATION LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: TERM/${new Date().getFullYear()}/${RN()}

PRIVATE AND CONFIDENTIAL

To,
${v(f.employeeName)}
Designation: ${v(f.designation)}

Dear ${v(f.employeeName)},

SUBJECT: TERMINATION OF EMPLOYMENT WITH EFFECT FROM ${fmtDate(f.terminationDate)}

This letter is to inform you that your employment with ${v(f.companyName)} stands terminated with effect from ${fmtDate(f.terminationDate)}, for the following reason(s):

${v(f.reason)}

The decision to terminate your employment has been taken after due consideration and in accordance with the terms of your employment contract and applicable labour laws, including the Industrial Disputes Act, 1947, and the applicable Shops and Commercial Establishments Act.

SETTLEMENT TERMS:
1. Notice Pay: ${v(f.noticePay)}
2. All statutory dues including PF and gratuity (if applicable) shall be settled as per applicable law.
3. Any advances or loans outstanding from your salary shall be adjusted from the final settlement.

HANDOVER REQUIREMENTS:
${v(f.handoverRequirements)}

You are required to:
1. Complete handover of all pending work, files and responsibilities.
2. Return all Company property immediately.
3. Report to the HR department for full and final settlement formalities.

Your Relieving Letter and Experience Certificate will be issued upon completion of all handover and settlement formalities.

Please note that all confidentiality obligations, non-solicitation obligations and any other post-employment obligations as per your employment contract remain in full force and effect.

Yours sincerely,

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}

[Note: This termination is subject to applicable provisions of the Industrial Disputes Act, 1947, the applicable State Shops and Establishments Act, and other labour laws. Employees may have statutory rights including the right to retrenchment compensation under Section 25F of the Industrial Disputes Act, 1947, if applicable.]`,

salary_certificate:f=>`SALARY / COMPENSATION CERTIFICATE

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: SAL-CERT/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.employeeName)} is / was employed with ${v(f.companyName)} from ${fmtDate(f.fromDate)} as ${v(f.designation)}, on a ${v(f.employmentType)} basis.

SALARY DETAILS:

Monthly Gross Salary:   ${amt(f.monthlySalary)}
Monthly Net Salary:     ${amt(f.netSalary)}
(after statutory deductions including PF, Professional Tax, TDS as applicable)

Annual Gross CTC:       ${amt((parseInt(f.monthlySalary||0)*12).toString())}

This certificate is issued for the purpose of: ${v(f.purpose)}, and for no other purpose.

This is a genuine certificate issued based on our employment records. The details mentioned herein are true and accurate as per our payroll records.

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}
(Company Seal)

[Note: This certificate is issued for the specific purpose mentioned above only. It is not a guarantee of continued employment. This certificate is subject to verification.]`,

hr_noc:f=>`NO OBJECTION CERTIFICATE
(From Employer / HR Department)

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: HR-NOC/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.employeeName)}, ${v(f.designation)}, is a bona fide employee of ${v(f.companyName)}.

PURPOSE OF NOC: ${v(f.purpose)}

${v(f.companyName)} hereby issues this No Objection Certificate confirming that:

1. We have NO OBJECTION to ${v(f.employeeName)} proceeding with the above stated purpose.

2. The employee has been duly informed of and has complied with all Company policies regarding the above matter.

3. The above activity shall not conflict with the employee's duties and responsibilities at ${v(f.companyName)}.

${f.conditions && f.conditions.trim() ? `CONDITIONS:\n${v(f.conditions)}` : '4. This NOC is issued unconditionally for the purpose stated above.'}

5. This NOC is valid as on the date of issue only and does not constitute an amendment to the employment contract.

6. ${v(f.companyName)} shall not be responsible for any consequences arising from activities undertaken pursuant to this NOC.

________________________
Authorised Signatory (HR)
${v(f.companyName)}
Date: ${fmtDate(f.date)}
(Company Seal)`,

internship_letter:f=>`INTERNSHIP OFFER LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: INTERN/${new Date().getFullYear()}/${RN()}

To,
${v(f.internName)}
Student, ${v(f.internCollege)}

Dear ${v(f.internName)},

SUBJECT: INTERNSHIP OFFER — ${v(f.department).toUpperCase()} DEPARTMENT

We are pleased to offer you an internship at ${v(f.companyName)} in the ${v(f.department)} department, on the following terms:

1. INTERNSHIP PERIOD: ${fmtDate(f.startDate)} to ${fmtDate(f.endDate)}

2. DEPARTMENT / TEAM: ${v(f.department)}

3. STIPEND: ${v(f.stipend)}

4. NATURE OF WORK:
${v(f.workDescription)}

5. WORKING HOURS: As per Company office hours.

6. TERMS AND CONDITIONS:
   (a) This internship is for training / learning purposes only and does NOT constitute employment.
   (b) The intern shall not be entitled to any employment benefits including PF, ESI, gratuity or leave encashment.
   (c) All work product created during the internship shall be the property of ${v(f.companyName)}.
   (d) The intern shall maintain strict confidentiality of all Company information.
   (e) The Company reserves the right to terminate this internship at any time for breach of conduct or policies.
   (f) This internship does not guarantee permanent employment with the Company.

7. INTERNSHIP CERTIFICATE: An Internship Completion Certificate will be issued on successful completion of the internship.

Please sign and return a copy of this letter as your acceptance.

We look forward to having you as part of our team.

Yours sincerely,

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}

ACCEPTANCE:
I, ${v(f.internName)}, hereby accept this internship offer on the terms stated above.

Signature: _______________  Date: _______________`,

probation_extension:f=>`PROBATION EXTENSION LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: PROB-EXT/${new Date().getFullYear()}/${RN()}

CONFIDENTIAL

To,
${v(f.employeeName)}
Designation: ${v(f.designation)}

Dear ${v(f.employeeName)},

SUBJECT: EXTENSION OF PROBATION PERIOD

With reference to your appointment with ${v(f.companyName)}, your initial probation period was due to end on ${fmtDate(f.originalEndDate)}.

After reviewing your performance during the probation period, the Management has decided to extend your probation period until ${fmtDate(f.newEndDate)}.

REASON FOR EXTENSION:
${v(f.reason)}

During the extended probation period, you are expected to:
1. Demonstrate significant improvement in the areas mentioned above.
2. Meet all performance targets and expectations set by your reporting manager.
3. Adhere strictly to all Company policies and procedures.

Your performance will be reviewed again on or before ${fmtDate(f.newEndDate)}. Confirmation of your employment will be subject to satisfactory performance during the extended probation period.

If your performance does not meet the required standards during the extended period, the Company may, at its discretion, terminate your employment as per the terms of your appointment letter.

Please acknowledge receipt of this letter by signing and returning a copy.

Yours sincerely,

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}

ACKNOWLEDGEMENT:
I, ${v(f.employeeName)}, acknowledge receipt of this letter and understand the contents thereof.

Signature: _______________  Date: _______________`,

warning_letter:f=>`EMPLOYEE WARNING LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: WARN/${new Date().getFullYear()}/${RN()}

CONFIDENTIAL

To,
${v(f.employeeName)}
Designation: ${v(f.designation)}

Dear ${v(f.employeeName)},

SUBJECT: WARNING LETTER — ${v(f.misconduct).substring(0,60).toUpperCase()}

This letter serves as a FORMAL WARNING regarding your conduct and behaviour at the workplace.

NATURE OF MISCONDUCT / VIOLATION:
${v(f.misconduct)}

${f.previousWarnings && f.previousWarnings.trim() ? `PREVIOUS WARNINGS:
${v(f.previousWarnings)}

This constitutes a repeat instance of misconduct, which the Management views with serious concern.` : ''}

The above conduct is in violation of the Company's Code of Conduct, HR Policies, and the terms of your employment contract. Such behaviour is unacceptable and cannot be tolerated.

EXPECTED IMPROVEMENT:
${v(f.expectedImprovement)}

You are hereby warned that:
1. Any recurrence of the above misconduct or similar behaviour will result in further disciplinary action.
2. ${v(f.consequenceIfNoImprovement)}
3. This warning letter will be placed on your personnel file and will be considered during your performance evaluation and appraisal.

You are directed to submit a written explanation regarding the above within 3 working days from the date of receipt of this letter.

This is your formal warning and you are expected to take immediate corrective action.

Yours sincerely,

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}

ACKNOWLEDGEMENT:
I, ${v(f.employeeName)}, acknowledge receipt of this Warning Letter.

Signature: _______________  Date: _______________`,

relieving_letter:f=>`RELIEVING LETTER

${v(f.companyName)}
${v(f.city)}
Date: ${fmtDate(f.date)}
Ref. No: REL/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.employeeName)} has been relieved from the services of ${v(f.companyName)} as ${v(f.designation)}, with effect from ${fmtDate(f.lastWorkingDay)}.

${v(f.noObligations)}

We confirm that:
1. ${v(f.employeeName)} has been duly relieved from all duties and responsibilities as on ${fmtDate(f.lastWorkingDay)}.
2. All Company property, documents, access cards, and assets have been returned in good order.
3. Full and final settlement of all dues payable to the employee has been / will be processed as per Company policy.
4. No disciplinary proceedings are pending against the employee.
5. The employee is free to join any other organisation with immediate effect.

We wish ${v(f.employeeName)} all the very best in their future career.

________________________
Authorised Signatory
${v(f.companyName)}
Date: ${fmtDate(f.date)}
(Company Seal)`,


// ═══════════════════════════════════════════════════════════════
// PHASE 6 — FAMILY (9) + COURT (9) = 18 DOCUMENTS
// ═══════════════════════════════════════════════════════════════

// ── FAMILY ───────────────────────────────────────────────────────────────────

family_declaration:f=>`FAMILY / HOUSEHOLD DECLARATION

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly declare as follows:

1. I am making this declaration for the purpose of: ${v(f.purpose)}.

2. That the following persons constitute my family / household residing with me at the above address:

${v(f.familyMembers)}

3. That the above-mentioned persons form one household and one family unit for all legal and official purposes.

4. That I am the head of the family / a member of the above family.

5. That all the information stated above is true, correct and complete to the best of my knowledge and belief.

6. That I am making this declaration voluntarily and in good faith, and I understand that this declaration may be relied upon by government authorities, banks, insurance companies and other official bodies for the purpose stated above.

7. That I am fully aware that making a false declaration is a punishable offence under Section 199 of the Indian Penal Code / Section 227 of the Bharatiya Nyaya Sanhita (BNS), 2023.

Place: ${v(f.city)}
Date: ${fmtDate(f.date)}

                                        ________________________
                                        DECLARANT
                                        ${v(f.fullName)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

guardianship_declaration:f=>`DECLARATION OF GUARDIANSHIP

I, ${v(f.guardianName)}, ${v(f.guardianRelation)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly declare as follows:

1. I am the deponent herein and I am making this declaration in connection with the guardianship of the minor child named below.

2. MINOR CHILD DETAILS:
   Name: ${v(f.childName)}
   Age: ${v(f.childAge)} years
   Natural Parent(s): ${v(f.parentName||'As stated below')}

3. REASON FOR GUARDIANSHIP:
   ${v(f.reason)}

4. I, ${v(f.guardianName)}, declare that I am taking on the responsibilities of guardian for the above-named minor child.

5. As guardian, I hereby undertake to:
   (a) Be responsible for the care, maintenance, education, health and general welfare of the said minor child.
   (b) Act at all times in the best interests and welfare of the minor child.
   (c) Appear before any court, authority, school or institution as required in connection with the welfare of the minor.
   (d) Not alienate or dispose of any property of the minor without prior permission of a competent court.
   (e) Account for all assets and income of the minor, if any.

6. That I am mentally, physically and financially capable of fulfilling the responsibilities of guardianship.

7. That no criminal cases or pending proceedings exist against me which would disqualify me from acting as guardian.

8. This declaration is made under the Guardians and Wards Act, 1890, and all applicable personal law.

Place: ${v(f.city)}
Date: ${fmtDate(f.date)}

                                        ________________________
                                        GUARDIAN
                                        ${v(f.guardianName)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

guardianship_affidavit:f=>`AFFIDAVIT OF GUARDIANSHIP

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.guardianName)}, residing at ${v(f.guardianAddress)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That I am the ${v(f.relationship)} of the minor child:
   Name: ${v(f.childName)}
   Age: ${v(f.childAge)} years

3. Circumstances necessitating guardianship:
   ${v(f.reason)}

4. I hereby declare that I am the legal / natural guardian of the above-named minor child.

5. As guardian, I solemnly undertake to:
   (a) Provide for the education, health, maintenance and overall welfare of the minor child.
   (b) Act at all times solely in the best interests of the minor child.
   (c) Not alienate any property belonging to the minor without prior leave of the competent court under the Guardians and Wards Act, 1890.
   (d) Appear before any court, school, hospital, government office or other authority as required.
   (e) Account to the court, if required, for all dealings with the minor's property or assets.
   (f) Inform all concerned authorities of any change in circumstances affecting the minor.

6. I request all concerned authorities — including schools, hospitals, government departments, passport authorities and financial institutions — to recognise me as the legal guardian of the said minor child.

7. That I am mentally sound, physically fit and financially capable of fulfilling the obligations of guardianship.

8. All facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.guardianName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        GUARDIAN (DEPONENT)
                                        ${v(f.guardianName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,

poa_property:f=>`SPECIAL POWER OF ATTORNEY FOR PROPERTY

Know All Men by These Presents that:

I, ${v(f.principalName)}, residing at ${v(f.principalAddress)}, ${v(f.city)}, Kerala (hereinafter referred to as "the Principal"), being the owner of the property described below, do hereby appoint, nominate and authorise ${v(f.agentName)}, ${v(f.agentRelation)}, as my lawful Special Attorney to act for me and in my name in respect of the following property:

PROPERTY DESCRIPTION:
${v(f.propertyDescription)}, ${v(f.city)}, Kerala
(hereinafter referred to as "the Said Property")

SPECIAL POWERS GRANTED FOR THE SAID PROPERTY:
${v(f.powers)}

Without limiting the generality of the above, my Special Attorney is specifically authorised to:

1. Negotiate, execute, present for registration and register any Sale Deed, Agreement to Sell, Gift Deed, Lease Deed, Mortgage Deed, or any other deed / document in respect of the Said Property.

2. Appear before the Sub-Registrar's office and all revenue, municipal, panchayat and government authorities in connection with the Said Property.

3. Sign, execute and file all applications, forms, deeds, affidavits, returns and other documents required by any authority in connection with the Said Property.

4. Receive and give valid receipts for all monies including sale consideration, rent, lease amounts, compensation, and all other amounts relating to the Said Property.

5. Handle all property tax, mutation, encumbrance certificate and other matters with the concerned local authority.

6. Execute NOC letters, receipts, discharges, reconveyance deeds and all ancillary documents.

7. Engage and instruct advocates, surveyors, valuers and other professionals in connection with the Said Property.

8. Do all other acts, deeds and things in connection with the Said Property as I myself could do if personally present.

I hereby ratify, confirm and agree to ratify and confirm all that my Special Attorney shall lawfully do or cause to be done by virtue of this Special Power of Attorney.

Signed at ${v(f.city)} on this ${fmtDate(f.date)}.

                                        ________________________
                                        PRINCIPAL (GRANTOR)
                                        ${v(f.principalName)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

________________________
Notary Public
(Official Seal & Stamp)
Registration No: _______________

[IMPORTANT: This Special Power of Attorney for immovable property MUST be registered at the Sub-Registrar's office under Section 17 of the Registration Act, 1908. An unregistered POA for immovable property cannot be used for transfer of ownership. Appropriate stamp duty under the Kerala Stamp Act is payable.]`,

divorce_mutual:f=>{
  const cooling = addMonths(f.date, 6);
  const alimony = parseInt(f.alimonyAmount || 0);
  return `${docHeader('PETITION FOR DIVORCE BY MUTUAL CONSENT','DMC',f)}

BEFORE THE HON'BLE FAMILY COURT / PRINCIPAL SUB JUDGE'S COURT
${v(f.city).toUpperCase()}, KERALA

O.P. No. _______ / ${THIS_YEAR}

IN THE MATTER OF:

PETITIONER NO. 1 (HUSBAND):
  Full Name    : ${v(f.husbandName)}
  Age          : ${age({age:f.husbandAge})}
  Address      : ${v(f.husbandAddress||f.city)}, Kerala
  Occupation   : ${v(f.husbandOccupation||'___')}

PETITIONER NO. 2 (WIFE):
  Full Name    : ${v(f.wifeName)}
  Age          : ${age({age:f.wifeAge})}
  Address      : ${v(f.wifeAddress||f.city)}, Kerala
  Occupation   : ${v(f.wifeOccupation||'___')}

─────────────────────────────
JOINT PETITION FOR DIVORCE BY MUTUAL CONSENT UNDER SECTION 13-B OF THE HINDU MARRIAGE ACT, 1955
─────────────────────────────

MOST RESPECTFULLY SHOWETH:

1. MARRIAGE DETAILS
   (a) The Petitioners were married on ${fmtDate(f.marriageDate)} at ${v(f.marriagePlace||f.city)}, as per Hindu / Christian / Muslim / Special Marriage Act rites and ceremonies. Marriage Certificate / Register No.: ${v(f.marriageCertNo||'___')}.
   (b) After marriage, the parties lived together as husband and wife at ${v(f.lastResidence||f.city)}.

2. SEPARATION
   (a) The parties have been living separately since ${fmtDate(f.separationDate)}, i.e., for a period exceeding one year.
   (b) The said separation is continuous and uninterrupted.
   (c) The parties have been unable to live together and all attempts at reconciliation have failed.

3. CHILDREN (IF ANY)
   ${vo(f.childrenDetails) ? v(f.childrenDetails) : 'The parties have no children from the marriage. / Details of children: ___'}

4. CUSTODY AND MAINTENANCE OF CHILDREN
   ${vo(f.custodyArrangement) ? v(f.custodyArrangement) : 'Not applicable / As agreed between the parties and set out in the Settlement Deed.'}

5. SETTLEMENT OF DUES AND ALIMONY
   (a) Permanent Alimony / Maintenance: ${alimony > 0 ? `Petitioner No. 1 agrees to pay permanent alimony of ${amt(f.alimonyAmount)} to Petitioner No. 2 as full and final settlement.` : 'No alimony / maintenance is payable by either party. Both parties waive all future claims.'}
   (b) Stridhan / Jewellery: ${v(f.stridhanDetails||'Has been returned in full / As set out in the Settlement Deed.')}
   (c) Movable / Immovable Property: ${v(f.propertySettlement||'Settled as per the terms of the Settlement Deed dated ___.')}
   (d) Both parties state that they have no pending financial claims against each other.

6. MUTUAL CONSENT
   Both Petitioners state on solemn affirmation that:
   (a) They are filing this petition voluntarily, without any force, coercion, fraud or undue influence.
   (b) They have fully understood the legal implications of this petition.
   (c) They have been living separately for more than one year and are unable to live together.
   (d) They mutually agree that the marriage should be dissolved.

7. PRAYER
   The Petitioners therefore most respectfully pray that this Hon'ble Court may be pleased to:
   (a) Accept this joint petition and pass a decree of divorce dissolving the marriage between the Petitioners.
   (b) Grant such other relief as this Hon'ble Court deems fit.

STATEMENT OF TRUTH
We, the Petitioners, do hereby verify that the contents of the above petition are true and correct to the best of our knowledge and belief. Nothing material has been concealed.

Verified at ${v(f.city)} on ${fmtDate(f.date)}.

________________________          ________________________
PETITIONER 1 (HUSBAND)            PETITIONER 2 (WIFE)
${v(f.husbandName)}               ${v(f.wifeName)}

─────────────────────────────
FOR ADVOCATE'S USE
─────────────────────────────
Cooling-off Period Note: Under Section 13-B(2) HMA, the Court shall not pass the decree before 6 months from the date of presentation of the petition. Earliest decree date: approximately ${fmtDate(cooling)}.
The Hon'ble Supreme Court in Amardeep Singh v. Harveen Kaur (2017) 8 SCC 746 held that the 6-month cooling-off period may be waived by the Court in deserving cases.
─────────────────────────────

${witnessBlock}

⚠ THIS PETITION MUST BE FILED THROUGH A QUALIFIED ADVOCATE. BOTH PETITIONERS MUST APPEAR IN PERSON BEFORE THE FAMILY COURT. A SECOND MOTION MUST BE FILED AFTER THE COOLING-OFF PERIOD.`;
},

relinquishment_deed:f=>`DEED OF RELINQUISHMENT

This Deed of Relinquishment (hereinafter "the Deed") is made on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BY:
${v(f.relinquisherName)}, son/daughter of ${v(f.relinquisherFather)}
(hereinafter "the Relinquisher")

IN FAVOUR OF:
${v(f.beneficiaryName)}, ${v(f.relation)} of the Relinquisher
(hereinafter "the Beneficiary")

PROPERTY:
${v(f.propertyDescription)}, ${v(f.city)}, Kerala

SHARE BEING RELINQUISHED:
${v(f.shareDetails)}

RECITALS:
WHEREAS the Relinquisher and the Beneficiary are co-owners / joint owners of the above property, each having an undivided share therein, AND the Relinquisher desires to relinquish, release and waive all rights in the said property in favour of the Beneficiary.

NOW THIS DEED WITNESSES AS FOLLOWS:

1. RELINQUISHMENT
   The Relinquisher hereby absolutely, irrevocably and unconditionally relinquishes, releases, surrenders and waives all right, title, interest, claim and demand in and to the above described property in favour of the Beneficiary.

2. CONSIDERATION
   ${parseInt(f.consideration||0) > 0
     ? `In consideration of this relinquishment, the Beneficiary has paid to the Relinquisher the sum of ${amt(f.consideration)}, the receipt of which the Relinquisher hereby acknowledges.`
     : `This relinquishment is made out of natural love, affection and goodwill towards the Beneficiary and no monetary consideration has passed.`}

3. DELIVERY OF POSSESSION
   The Relinquisher has delivered and the Beneficiary has taken possession of the Relinquisher's share in the above property on the date of this Deed.

4. WARRANTY
   The Relinquisher warrants that:
   (a) The Relinquisher has full right and authority to relinquish the said share.
   (b) The said share is free from all encumbrances created by the Relinquisher.
   (c) The Relinquisher has not already alienated or encumbered the said share.

5. FURTHER ASSURANCE
   The Relinquisher shall execute all further documents as may be necessary to perfect the Beneficiary's absolute title to the property.

6. GOVERNING LAW
   This Deed is governed by the Transfer of Property Act, 1882, the Hindu Succession Act, 1956 (if applicable), and all applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
RELINQUISHER                      BENEFICIARY (ACCEPTOR)
${v(f.relinquisherName)}          ${v(f.beneficiaryName)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________

[NOTE: This Deed should be stamped with appropriate stamp duty under the Kerala Stamp Act and registered at the Sub-Registrar's office for full legal effect on immovable property.]`,

adoption_affidavit:f=>`AFFIDAVIT OF ADOPTION / CHILD ADOPTION DECLARATION

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

We, the undersigned, do hereby jointly solemnly affirm and state on oath as follows:

ADOPTIVE FATHER: ${v(f.adoptiveFatherName)}
ADOPTIVE MOTHER: ${v(f.adoptiveMotherName)}
Address: ${v(f.adoptiveAddress)}, ${v(f.city)}, Kerala

1. We are the deponents herein and we make this affidavit from our personal knowledge.

2. CHILD BEING ADOPTED:
   Name: ${v(f.childName)}
   Date of Birth: ${fmtDate(f.childDOB)}
   Natural Parent(s): ${v(f.naturalParentName||'As per records')}

3. Reason / Circumstances for Adoption:
   ${v(f.reason)}

4. We hereby declare that we have adopted / desire to adopt the above-named child as our own child.

5. We undertake and declare that:
   (a) The adopted child shall have all rights of a natural-born child in our family, including the right of inheritance.
   (b) We shall be fully responsible for the care, education, health and welfare of the child.
   (c) We shall not discriminate between the adopted child and any biological children.
   (d) The adoption is made with love and genuine intent, and not for any commercial or exploitative purpose.
   (e) We have the financial capacity to support and maintain the child.

6. The adoption is made in accordance with / with the intent to regularise the same under the Hindu Adoption and Maintenance Act, 1956 / Juvenile Justice (Care and Protection of Children) Act, 2015 (as applicable).

7. All facts stated herein are true and correct to the best of our knowledge and belief.

VERIFICATION

We do hereby verify that the contents of this affidavit are true and correct. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

________________________          ________________________
ADOPTIVE FATHER                   ADOPTIVE MOTHER
${v(f.adoptiveFatherName)}        ${v(f.adoptiveMotherName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

[NOTE: Adoption in India is regulated by the Hindu Adoption and Maintenance Act, 1956 (for Hindus) and the Juvenile Justice Act, 2015 (for all religions for inter-country and certain in-country adoptions). A formal adoption deed / court order may be required for full legal recognition. Consult a family law advocate.]`,

nomination_letter:f=>`NOMINEE DECLARATION LETTER

Date: ${fmtDate(f.date)}
Ref. No: NOM/${new Date().getFullYear()}/${RN()}

FROM:
${v(f.fullName)}
Relationship to Nominee: ${v(f.relation)}

TO WHOMSOEVER IT MAY CONCERN
(Banks, Insurance Companies, Provident Fund, Employer, Housing Society, and all concerned)

SUBJECT: NOMINATION / NOMINEE DECLARATION

I, ${v(f.fullName)}, hereby nominate the following person as my nominee for the purpose of receiving all benefits, amounts, assets and claims in respect of the asset / policy / account described below, in the event of my death:

NOMINEE DETAILS:
Full Name: ${v(f.nomineeName)}
Relationship: ${v(f.nomineeRelation)}

ASSET / POLICY / ACCOUNT DETAILS:
${v(f.assetDetails)}

SHARE: ${v(f.share)}

I declare that:
1. The above nomination is made by me of my own free will, without any compulsion or undue influence.
2. In the event of my death, the nominee shall be entitled to receive the above asset / benefit / amount.
3. This nomination supersedes any previous nomination made by me in respect of the above asset.
4. The nominee shall hold the received amount / asset as trustee for my legal heirs, in accordance with applicable succession law.
5. I understand that this nomination is revocable and may be changed by me at any time during my lifetime by written notice.

                                        ________________________
                                        NOMINATOR
                                        ${v(f.fullName)}
                                        Date: ${fmtDate(f.date)}

NOMINEE ACCEPTANCE:
I, ${v(f.nomineeName)}, hereby accept the above nomination.

                                        ________________________
                                        NOMINEE
                                        ${v(f.nomineeName)}
                                        Date: _______________

[NOTE: Nomination does not override the legal rights of heirs under succession law. Nominee is entitled to receive the asset but holds it for legal heirs. For bank accounts, refer to RBI guidelines on nomination. For insurance, refer to IRDA regulations.]`,

succession_cert:f=>`AFFIDAVIT FOR LEGAL HEIRSHIP / SUCCESSION

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of _______________, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am fully competent to swear to this affidavit.

2. That ${v(f.deceasedName)} (hereinafter "the Deceased") died on ${fmtDate(f.deathDate)}.

3. I am the ${v(f.relation)} of the Deceased and am one of the legal heirs of the Deceased.

4. The Deceased left behind the following assets / estate:
   ${v(f.assets)}

5. The legal heirs of the Deceased are:
   (a) Myself: ${v(f.fullName)} (${v(f.relation)})
   ${v(f.otherHeirs) ? `(b) ${v(f.otherHeirs)}` : '(No other surviving legal heirs)'}

6. To the best of my knowledge, the above list of legal heirs is complete and correct. No other person has any right to succeed to the estate of the Deceased.

7. The Deceased did not leave any WILL or testamentary disposition. The estate shall therefore devolve by intestate succession as per the applicable personal law (Hindu Succession Act, 1956 / Indian Succession Act, 1925 / applicable personal law).

8. No succession certificate has been granted or applied for by any other person in any court in India in respect of the estate of the Deceased.

9. The Deceased had no outstanding loans, debts or liabilities that could affect the estate, to the best of my knowledge.

10. I am making this affidavit for the purpose of: claiming assets, bank accounts, insurance, provident fund, pension, property mutation and all other connected official purposes.

11. All facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________

[NOTE: For amounts above Rs.15 lakhs, banks and financial institutions may require a formal Succession Certificate granted by a competent civil court under Sections 370-390 of the Indian Succession Act, 1925. For immovable property, a Heirship Certificate from the Revenue authorities or a court-granted Letter of Administration may be required.]`,

// ── COURT DOCUMENTS ──────────────────────────────────────────────────────────

general_affidavit:f=>`GENERAL AFFIDAVIT

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, aged ${v(f.age)} years, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am an Indian citizen and am fully competent to swear to this affidavit.

2. ${v(f.declaration)}

3. I state that all the facts stated herein are true and correct to the best of my knowledge, information and belief. No part of this affidavit is false. Nothing material has been concealed or suppressed therefrom.

4. I state that I am making this affidavit of my own free will and volition, without any compulsion, coercion, fraud, undue influence or misrepresentation by any person.

5. I am fully aware that a false affidavit is a punishable offence under Section 191 read with Section 193 of the Indian Penal Code / Sections 218 and 221 of the Bharatiya Nyaya Sanhita (BNS), 2023.

VERIFICATION

I, ${v(f.fullName)}, the deponent above named, do hereby verify on solemn affirmation that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed or suppressed therefrom.

Verified at ${v(f.city)} on this ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}
                                        S/o D/o W/o: ${v(f.fatherName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala`,

notary_affidavit:f=>`NOTARY AFFIDAVIT

STATE OF KERALA
DISTRICT OF ${v(f.city).toUpperCase()}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, aged ${v(f.age)} years, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly affirm and declare on oath before the Notary Public as follows:

1. I am an Indian citizen. I am the deponent above named and I am fully competent to swear to this affidavit.

2. STATEMENT / DECLARATION:
   ${v(f.declaration)}

3. PURPOSE OF THIS AFFIDAVIT:
   ${v(f.purpose)}

4. I state that:
   (a) All facts stated herein are true and correct to the best of my knowledge, information and belief.
   (b) No part of this affidavit is false or misleading.
   (c) Nothing material has been concealed or suppressed therefrom.
   (d) I am making this affidavit voluntarily, without any compulsion or undue influence.

5. I am aware that this affidavit is executed before a Notary Public under the Notaries Act, 1952 and the Notaries Rules, 1956, and that making a false statement before a Notary is punishable under Section 193 of the Indian Penal Code / Section 221 of the Bharatiya Nyaya Sanhita (BNS), 2023.

Solemnly affirmed / Sworn before me at ${v(f.city)} on this ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.fullName)}

________________________
NOTARY PUBLIC
Name: _______________
Registration No: _______________
Jurisdiction: ${v(f.city)}, Kerala
Date: ${fmtDate(f.date)}
(Official Seal)`,

court_declaration:f=>`DECLARATION BEFORE COMPETENT AUTHORITY / COURT

${f.courtName && f.courtName.trim() ? 'IN THE ' + v(f.courtName).toUpperCase() + ', ' + v(f.city).toUpperCase() : 'BEFORE THE COMPETENT AUTHORITY / COURT'}
${f.caseNumber && f.caseNumber.trim() ? 'Case / Petition No.: ' + v(f.caseNumber) : ''}

DECLARATION

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly declare on solemn affirmation as follows:

1. I am the declarant above named. I am an Indian citizen and am fully competent to make this declaration.

2. DECLARATION STATEMENT:
   ${v(f.declaration)}

3. I make this declaration with full knowledge of its contents and legal consequences.

4. I am fully aware that:
   (a) This declaration is admissible as evidence in courts of law in India.
   (b) Making a false declaration / statement is an offence punishable under Sections 191-193 of the Indian Penal Code / Sections 218-221 of the Bharatiya Nyaya Sanhita (BNS), 2023.
   (c) This declaration is subject to verification by the concerned authority.

SOLEMN DECLARATION

I, ${v(f.fullName)}, do hereby solemnly declare that the contents of this declaration are true and correct to the best of my knowledge and belief. I make this declaration under Order VI Rule 15 of the Code of Civil Procedure, 1908 / as required by the competent authority.

Place: ${v(f.city)}
Date: ${fmtDate(f.date)}

                                        ________________________
                                        DECLARANT
                                        ${v(f.fullName)}`,

legal_undertaking:f=>`UNDERTAKING

Date: ${fmtDate(f.date)}
Ref. No: UND/${new Date().getFullYear()}/${RN()}

To,
${v(f.authority)}
${v(f.city)}

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, residing at ${v(f.address)}, ${v(f.city)}, Kerala, do hereby solemnly give this UNDERTAKING as follows:

SUBJECT OF UNDERTAKING:
${v(f.undertaking)}

I HEREBY UNDERTAKE AND CONFIRM THAT:

1. I shall strictly comply with all the above stated obligations / conditions.

2. I shall comply with all applicable laws, rules, regulations, guidelines and orders issued by the concerned authorities from time to time.

3. I shall appear before the concerned authority whenever called upon to do so and shall provide all information, documents and cooperation as required.

4. I shall not engage in any act, activity or conduct that is contrary to the above undertaking.

5. I am fully aware that breach of this undertaking may render me liable to:
   (a) Contempt of court proceedings.
   (b) Prosecution under applicable provisions of the Bharatiya Nyaya Sanhita (BNS), 2023 / Indian Penal Code.
   (c) All civil and administrative consequences as prescribed by applicable law.
   (d) Recovery of damages and costs.

6. This undertaking is given by me voluntarily, without any coercion, compulsion, undue influence or misrepresentation.

7. I confirm that I have full legal capacity and authority to give this undertaking.

Place: ${v(f.city)}
Date: ${fmtDate(f.date)}

                                        ________________________
                                        ${v(f.fullName)}

WITNESS:
1. Name: _______________________  Signature: _______________________`,

bail_surety:f=>`BAIL SURETY BOND
(Under Section 440 Cr.P.C. / Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023)

IN THE COURT OF: ${v(f.courtName)}, ${v(f.city)}
Case / FIR No.: ${v(f.caseNumber)}
Charge / Offence: ${v(f.chargeUnder)}

KNOW ALL MEN BY THESE PRESENTS THAT:

I, ${v(f.suretyName)}, son/daughter of ${v(f.suretyFather)}, residing at ${v(f.suretyAddress)}, ${v(f.city)}, Kerala, do hereby bind myself as surety for ${v(f.accusedName)}, the accused in the above matter.

BAIL AMOUNT: ${amt(f.bailAmount)}

I, ${v(f.suretyName)}, as surety for the accused ${v(f.accusedName)}, do hereby undertake and guarantee that:

1. The accused ${v(f.accusedName)} shall appear before the above court / police station at all times as required during the pendency of the above case.

2. The accused shall attend all hearings, sittings and proceedings of this Hon'ble Court as directed, without fail.

3. The accused shall not leave the jurisdiction of this court without prior permission.

4. The accused shall not tamper with evidence or influence any witness.

5. In the event of the accused failing to appear before the court as required, I, ${v(f.suretyName)}, as surety, shall forfeit to the Government the sum of ${amt(f.bailAmount)} or such lesser amount as the court may determine.

6. I hereby submit myself to the jurisdiction of this Hon'ble Court for enforcement of this bond.

SURETY DETAILS:
Name: ${v(f.suretyName)}
Occupation: _______________
Property Details (if required): _______________

I confirm that I am a permanent resident of the jurisdiction of this court and am capable of satisfying the surety bond amount.

                                        ________________________
                                        SURETY
                                        ${v(f.suretyName)}
                                        Date: ${fmtDate(f.date)}

VERIFICATION: Verified before the Court / Magistrate on this ${fmtDate(f.date)}.

________________________
Judicial Magistrate / Court Officer
${v(f.courtName)}, ${v(f.city)}`,

complaint_letter:f=>`COMPLAINT LETTER / FIR REQUEST

FROM:
${v(f.complainantName)}
${v(f.complainantAddress)}
Mobile: _______________

Date: ${fmtDate(f.date)}

TO,
The Station House Officer (SHO)
${v(f.policeStation)} Police Station
${v(f.city)}, Kerala

SUBJECT: COMPLAINT / REQUEST FOR REGISTRATION OF FIR AGAINST ${v(f.respondentName).toUpperCase()}

Respected Sir / Madam,

I, ${v(f.complainantName)}, am filing this complaint against ${v(f.respondentName)}, residing at ${v(f.respondentAddress||'address unknown')}, and respectfully request you to register an FIR and take appropriate legal action.

1. DETAILS OF THE ACCUSED / RESPONDENT:
   Name: ${v(f.respondentName)}
   Address: ${v(f.respondentAddress||'As known to the complainant')}

2. FACTS AND DETAILS OF THE INCIDENT:
   Date of Incident: ${fmtDate(f.incidentDate)}
   ${v(f.incidentDetails)}

3. WITNESSES (if any):
   ${v(f.witnesses||'None known at this stage')}

4. RELIEF SOUGHT:
   ${v(f.relief)}

5. I respectfully request that:
   (a) An FIR be registered against the accused under applicable provisions of the Bharatiya Nyaya Sanhita (BNS), 2023 / applicable laws.
   (b) Appropriate investigation be conducted immediately.
   (c) Necessary action be taken to protect my interests and prevent further occurrence.
   (d) I be kept informed of the progress of the investigation.

I am ready to provide any further information / documents required for the investigation.

This complaint is filed in good faith and all information given above is true and correct to the best of my knowledge.

Yours faithfully,

________________________
${v(f.complainantName)}
Date: ${fmtDate(f.date)}

Enclosures (if any):
1. Copies of relevant documents
2. Photographs / evidence (if available)

[NOTE: If the police refuse to register an FIR, you have the right to: (a) Approach the SP / DSP; (b) Send a written complaint to the Magistrate under Section 175 BNSS / Section 156(3) Cr.P.C.; (c) File a complaint directly before the competent Magistrate under Section 200 Cr.P.C. / BNSS.]`,

vakalat_letter:f=>`VAKALATNAMA
(Authority Letter to Advocate / Lawyer)

IN THE ${v(f.courtName).toUpperCase()}, ${v(f.city).toUpperCase()}
${f.caseNumber && f.caseNumber.trim() ? 'Case / Petition No.: ' + v(f.caseNumber) : ''}
Case Type: ${v(f.caseTitle)}

I / We, ${v(f.clientName)}, residing at ${v(f.clientAddress)}, ${v(f.city)}, Kerala (hereinafter "the Client"), do hereby appoint, retain and authorise ${v(f.advocateName)}, Advocate, enrolled with the Bar Council of Kerala / Bar Council of India, Enrollment No.: ${v(f.barNumber)}, (hereinafter "the Advocate") to act, appear and plead on my / our behalf in the above matter, and in any related appeals, revisions, reviews and connected proceedings.

AUTHORITY GRANTED:

1. To appear, act and plead in the above case / petition and all connected proceedings in this Hon'ble Court and all appellate, revisional and other courts / tribunals / authorities.

2. To sign all pleadings, applications, vakalatnamas, affidavits, statements, written arguments, memo of appeals, petitions and all other documents on my behalf.

3. To receive notices, summons, orders and judgments on my behalf and to give undertakings and admissions on my behalf.

4. To engage junior counsel, senior counsel or any other advocate to assist in this matter.

5. To compromise, settle or withdraw the above proceedings with my prior written consent.

6. To take all such steps and do all such acts as may be necessary for the proper conduct of the above matter.

I agree to ratify all acts done by the Advocate in this matter.

________________________
CLIENT
${v(f.clientName)}
Date: ${fmtDate(f.date)}

ACCEPTED:
________________________
ADVOCATE
${v(f.advocateName)}
Enrollment No.: ${v(f.barNumber)}
Date: ${fmtDate(f.date)}

[This Vakalatnama is executed under Order III Rule 4 of the Code of Civil Procedure, 1908 / applicable rules of the court.]`,

settlement_deed:f=>`OUT OF COURT SETTLEMENT DEED

This Settlement Deed (hereinafter "the Deed") is made on ${fmtDate(f.date)}, at ${v(f.city)}, Kerala.

BETWEEN

PARTY 1: ${v(f.party1)}
Address: ${v(f.party1Address)}

AND

PARTY 2: ${v(f.party2)}
Address: ${v(f.party2Address)}

RECITALS:
WHEREAS a dispute arose between the Parties regarding: ${v(f.disputeDescription)}, AND the Parties have, after mutual discussions and negotiations, agreed to resolve the said dispute amicably and out of court on the terms and conditions set out herein, without any admission of liability by either party.

NOW THIS DEED WITNESSES AS FOLLOWS:

1. SETTLEMENT TERMS
   The Parties hereby agree to settle the above dispute on the following terms:
   ${v(f.settlementTerms)}

2. SETTLEMENT AMOUNT
   ${parseInt(f.settlementAmount||0) > 0
     ? `In full and final settlement, Party ${v(f.party1)} / Party ${v(f.party2)} shall pay ${amt(f.settlementAmount)} to the other party as stated in the terms above.`
     : 'No monetary payment is involved in this settlement. The settlement is based on the non-monetary terms stated above.'}

3. FULL AND FINAL SETTLEMENT
   Upon compliance with the above terms, each Party:
   (a) Accepts the above as a FULL AND FINAL settlement of all disputes, claims and demands between them.
   (b) Releases and forever discharges the other Party from all actions, claims, demands and liabilities — past, present and future — arising out of the above dispute.
   (c) Agrees not to file or continue any court case, complaint, legal proceedings or arbitration in relation to the above dispute.
   (d) Agrees not to raise the same dispute or any related claim in any forum.

4. WITHDRAWAL OF PROCEEDINGS
   If any court case or legal proceedings are pending between the Parties in relation to the above dispute, both Parties agree to file a joint application to withdraw / dismiss the same within 15 days of execution of this Deed.

5. CONFIDENTIALITY
   Both Parties agree to maintain confidentiality of the terms of this settlement and shall not disclose the same to any third party.

6. GOVERNING LAW
   This Deed is governed by the Indian Contract Act, 1872 and all applicable laws. Jurisdiction: Courts at ${v(f.city)}, Kerala.

________________________          ________________________
PARTY 1                           PARTY 2
${v(f.party1)}                    ${v(f.party2)}
Date: ${fmtDate(f.date)}          Date: ${fmtDate(f.date)}

WITNESSES:
1. Name: _______________________  Signature: _______________________
2. Name: _______________________  Signature: _______________________`,

stay_order_affidavit:f=>`AFFIDAVIT IN SUPPORT OF APPLICATION FOR STAY

${v(f.courtName).toUpperCase()}, ${v(f.city).toUpperCase()}
Case / Petition No.: ${v(f.caseNumber)}

AFFIDAVIT

I, ${v(f.fullName)}, son/daughter/wife of ${v(f.fatherName)}, aged ___ years, residing at ${v(f.address)}, ${v(f.city)}, Kerala, the Petitioner / Applicant in the above matter, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named and the Petitioner / Applicant in the above case. I am fully conversant with the facts and circumstances of this matter.

2. SUBJECT MATTER OF STAY APPLICATION:
   ${v(f.stayDetails)}

3. GROUNDS FOR URGENCY — WHY IMMEDIATE STAY IS NECESSARY:
   ${v(f.urgencyGrounds)}

4. I state that unless the stay / injunction / interim relief prayed for is granted:
   (a) I shall suffer irreparable loss and injury which cannot be adequately compensated in monetary terms.
   (b) The very purpose of filing this petition / case will be frustrated.
   (c) The balance of convenience strongly favours grant of stay.

5. I state that there is a prima facie case in my favour.

6. I state that I have not filed any similar application before any other court or forum in this matter.

7. I am ready and willing to furnish security / surety as directed by this Hon'ble Court.

8. All facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.fullName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge. Verified at ${v(f.city)} on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT / PETITIONER
                                        ${v(f.fullName)}

Solemnly affirmed / sworn before me on this ${fmtDate(f.date)} at ${v(f.city)}.

________________________
Notary Public / Oath Commissioner
(Official Seal & Stamp)
Registration No: _______________`,


// ═══════════════════════════════════════════════════════════════
// PHASE 6 TEMPLATES — STUDENT (7) + CONSUMER (6) = 13 docs
// Maximum detail — correct Indian law clauses
// ═══════════════════════════════════════════════════════════════

bonafide_declaration:f=>`BONAFIDE CERTIFICATE / STUDENT DECLARATION

${v(f.institution)}
${f.city||''}
Date: ${fmtDate(f.date)}
Ref. No: BON/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that:

Student Name:           ${v(f.studentName)}
Father / Guardian Name: ${v(f.fatherName)}
Course / Class:         ${v(f.course)}
Academic Year:          ${v(f.year)}
Institution:            ${v(f.institution)}
${f.rollNo && f.rollNo.trim() ? 'Roll No. / Reg. No.:    ' + v(f.rollNo) : ''}

is a bona fide student of this institution for the academic year ${v(f.year)}, pursuing the above-mentioned course.

PURPOSE: ${v(f.purpose)}

We hereby certify that:
1. The above-named student is enrolled as a regular student in this institution.
2. His / Her attendance and academic conduct are satisfactory.
3. No disciplinary action or proceedings are pending against the student.
4. This certificate is issued for the specific purpose mentioned above only.

Address:
${v(f.address)}

This certificate is valid for a period of 6 months from the date of issue, unless specified otherwise.

________________________
Signature
Principal / Registrar / Authorised Signatory
${v(f.institution)}
(Institution Seal / Stamp)
Date: ${fmtDate(f.date)}

[Note: This certificate is issued under the authority of ${v(f.institution)} and is subject to verification. Any misuse or misrepresentation shall render the certificate void.]`,

student_affidavit:f=>`STUDENT AFFIDAVIT

STATE OF KERALA

I, ${v(f.studentName)}, son/daughter of ${v(f.fatherName)}, a student of ${v(f.course)} (${v(f.year)}) at ${v(f.institution)}, residing at ${v(f.address)}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am making this affidavit in my personal capacity as a student.

2. DECLARATION:
${v(f.declaration)}

3. ANTI-RAGGING UNDERTAKING:
   I solemnly affirm that:
   (a) I shall not indulge in any act of ragging in any form whatsoever — including physical, mental, verbal, sexual, financial or any other form of ragging — whether inside or outside the institution premises.
   (b) I am fully aware that ragging is a cognizable offence punishable under the UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009, and applicable provisions of the Indian Penal Code / Bharatiya Nyaya Sanhita, 2023.
   (c) I undertake to report any instances of ragging that come to my knowledge to the Anti-Ragging Committee of the institution immediately.
   (d) I understand that violation of this undertaking shall make me liable for expulsion from the institution and criminal prosecution.

4. ACADEMIC INTEGRITY:
   I undertake to:
   (a) Maintain academic integrity and shall not indulge in plagiarism, copying or use of unfair means in examinations.
   (b) Adhere to all rules, regulations and codes of conduct of ${v(f.institution)}.
   (c) Not engage in any activity that brings disrepute to the institution.

5. All facts stated herein are true and correct to the best of my knowledge. I am fully aware that a false affidavit is punishable under applicable law.

VERIFICATION

I, ${v(f.studentName)}, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief.

Verified at _______ on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT (STUDENT)
                                        ${v(f.studentName)}

PARENT / GUARDIAN UNDERTAKING:
I, _________________________, parent/guardian of ${v(f.studentName)}, also affirm the above undertakings on behalf of the student.

________________________
Parent / Guardian Signature
Date: _______________

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public / Oath Commissioner (Seal & Stamp)`,

scholarship_affidavit:f=>`AFFIDAVIT FOR SCHOLARSHIP / FINANCIAL NEED

STATE OF KERALA
DISTRICT OF _______________

I, ${v(f.studentName)}, son/daughter of ${v(f.fatherName)}, a student of ${v(f.course)} at ${v(f.institution)}, residing at ${v(f.address)}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named. I am making this affidavit for the purpose of: ${v(f.purpose)}.

2. FAMILY INCOME DECLARATION:
   My family's total annual income from all sources for the current financial year is:
   ${amt(f.annualFamilyIncome)}
   (Rupees ${toWords(parseInt(f.annualFamilyIncome||0))} Only)

3. FINANCIAL NEED DETAILS:
   ${v(f.financialDetails)}

4. I specifically declare that:
   (a) The income stated above is correct and true as per my knowledge and relevant documents.
   (b) My family does not have any other source of income not disclosed above.
   (c) I am genuinely in need of financial assistance to pursue my education.
   (d) I am not availing any other scholarship or financial assistance that conflicts with the scholarship being applied for.
   (e) All information submitted in my scholarship application is true and accurate.

5. I undertake that:
   (a) If selected, I shall utilise the scholarship amount solely for educational purposes.
   (b) I shall maintain the academic standards required for continuation of the scholarship.
   (c) I shall immediately inform the scholarship authority of any change in my financial circumstances.
   (d) In the event of any misrepresentation, I shall repay the full scholarship amount received.

6. All facts stated herein are true and correct. I am fully aware that a false affidavit is punishable under Section 191 of the IPC / Section 218 of the BNS, 2023.

VERIFICATION

I, ${v(f.studentName)}, do hereby verify that the contents of this affidavit are true and correct. Verified at _______ on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.studentName)}

PARENT / GUARDIAN CONFIRMATION:
I confirm the above income and financial details.

________________________
Parent / Guardian: ${v(f.fatherName)}
Date: _______________

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public / Oath Commissioner (Seal & Stamp)`,

college_noc:f=>`NO OBJECTION CERTIFICATE
(Issued by Educational Institution)

${v(f.institutionName)}
Date: ${fmtDate(f.date)}
Ref. No: NOC/${new Date().getFullYear()}/${RN()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${v(f.studentName)}, enrolled in ${v(f.course)} (${v(f.year)}) at ${v(f.institutionName)}, has applied for a No Objection Certificate for the purpose stated below.

PURPOSE OF NOC: ${v(f.purpose)}

After due consideration, ${v(f.institutionName)} hereby issues this NO OBJECTION CERTIFICATE in favour of ${v(f.studentName)} for the above stated purpose.

We hereby confirm that:
1. ${v(f.studentName)} is a bona fide student of ${v(f.institutionName)}.
2. The institution has NO OBJECTION to the student proceeding with the above stated purpose.
3. The student's academic standing and conduct are satisfactory.
4. No disciplinary proceedings are pending against the student.

${f.conditions && f.conditions.trim() ? `CONDITIONS:\n${v(f.conditions)}` : 'This NOC is issued without any conditions.'}

This NOC is valid for a period of 3 months from the date of issue.

________________________          ________________________
${v(f.principalName)}              (Institution Seal)
Principal / Registrar
${v(f.institutionName)}
Date: ${fmtDate(f.date)}

[Note: This NOC is issued for the specific purpose mentioned above and shall not be used for any other purpose. Misuse of this certificate shall render it void.]`,

internship_consent:f=>`PARENT / GUARDIAN CONSENT LETTER FOR INTERNSHIP

Date: ${fmtDate(f.date)}
Place: ${v(f.city||'Kerala')}

To,
The Authorised Person
${v(f.companyName)}
${v(f.internshipLocation)}

SUBJECT: CONSENT FOR INTERNSHIP OF ${v(f.studentName).toUpperCase()}

Dear Sir / Madam,

I, ${v(f.parentName)}, ${v(f.parentRelation)} of ${v(f.studentName)}, a student of ${v(f.institution)}, hereby give my full and unconditional consent for my ward to undertake an internship at ${v(f.companyName)}, ${v(f.internshipLocation)}, for the period from ${fmtDate(f.internshipStart)} to ${fmtDate(f.internshipEnd)}.

SPECIFIC CONSENT GRANTED:
${v(f.consentDetails)}

I hereby confirm and declare that:

1. I am fully aware of and consent to my ward, ${v(f.studentName)}, undertaking the above internship at ${v(f.companyName)}, ${v(f.internshipLocation)}.

2. I understand that this internship may involve travel to and stay at ${v(f.internshipLocation)}, and I give my consent for the same.

3. I confirm that my ward is in good physical and mental health and is capable of undertaking the internship.

4. I agree that my ward shall abide by all rules, regulations and policies of ${v(f.companyName)} during the internship period.

5. I understand that the internship does not constitute employment and my ward shall not be entitled to any employment benefits.

6. I accept full responsibility for my ward's conduct during the internship period.

7. I give my consent for ${v(f.companyName)} to share my ward's performance feedback and reports with ${v(f.institution)}.

8. In case of any emergency, ${v(f.companyName)} may be contacted at the details provided by my ward, and they may contact me at: _______________________.

Yours faithfully,

________________________
${v(f.parentName)}
${v(f.parentRelation)} of ${v(f.studentName)}
Mobile: _______________________
Date: ${fmtDate(f.date)}

STUDENT DECLARATION:
I, ${v(f.studentName)}, confirm that the above consent has been given by my parent/guardian voluntarily.

________________________
${v(f.studentName)}
Date: ${fmtDate(f.date)}`,

migration_certificate:f=>`MIGRATION / TRANSFER AFFIDAVIT

STATE OF KERALA

I, ${v(f.studentName)}, son/daughter of ${v(f.fatherName)}, a student currently enrolled in ${v(f.fromCourse)} at ${v(f.fromInstitution)}, residing at ${v(f.address)}, do hereby solemnly affirm and state on oath as follows:

1. I am the deponent above named.

2. I am / was a student of ${v(f.fromCourse)} at ${v(f.fromInstitution)}.

3. I wish to transfer / migrate to ${v(f.toInstitution)} to continue my studies in ${v(f.toCourse)}.

4. REASON FOR TRANSFER:
   ${v(f.reason)}

5. I declare that:
   (a) I have obtained / applied for a Transfer Certificate (TC) from ${v(f.fromInstitution)}.
   (b) All fees and dues at ${v(f.fromInstitution)} have been / shall be cleared before the issue of the TC.
   (c) No disciplinary proceedings are pending against me at ${v(f.fromInstitution)}.
   (d) I have not obtained admission at any other institution simultaneously.
   (e) The reason stated above for my transfer is true and genuine.
   (f) All original documents submitted for the transfer purpose are genuine and authentic.

6. I request ${v(f.toInstitution)} to consider my application for transfer admission to ${v(f.toCourse)} on the basis of my academic record and this affidavit.

7. I understand that admission to ${v(f.toInstitution)} is subject to meeting all eligibility criteria, availability of seats, and approval by the concerned authority.

8. All facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.studentName)}, do hereby verify that the contents of this affidavit are true and correct. Verified at _______ on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.studentName)}

PARENT / GUARDIAN:
________________________
Name: ${v(f.fatherName)}
Date: _______________

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public / Oath Commissioner (Seal & Stamp)`,

exam_affidavit:f=>`EXAMINATION / HALL TICKET AFFIDAVIT

STATE OF KERALA

I, ${v(f.studentName)}, son/daughter of ${v(f.fatherName)}, residing at ${v(f.address)}, do hereby solemnly affirm and state on oath as follows:

1. I am appearing for the ${v(f.examName)} examination.

2. My Roll Number / Hall Ticket Number is: ${v(f.rollNumber)}.

3. Examination Date / Period: ${v(f.examDate)}.

4. DECLARATION:
   ${v(f.declaration)}

5. I specifically declare that:
   (a) All information provided in my examination application is true, accurate and complete.
   (b) I satisfy all eligibility criteria for appearing in the above examination.
   (c) I have not suppressed any material information or submitted any false documents.
   (d) I shall abide by all rules, instructions and code of conduct prescribed by the examination authority.
   (e) I shall not use any unfair means, gadgets, or electronic devices during the examination.
   (f) I shall maintain discipline and decorum at the examination centre at all times.
   (g) I shall not engage in or attempt any malpractice during the examination.

6. I am fully aware that:
   (a) Any malpractice or use of unfair means shall lead to cancellation of my examination and disqualification.
   (b) Providing false information is punishable under applicable law including the Bharatiya Nyaya Sanhita, 2023.
   (c) The examination authority has the right to take appropriate legal action for any violation.

7. All facts stated herein are true and correct to the best of my knowledge and belief.

VERIFICATION

I, ${v(f.studentName)}, do hereby verify that the contents of this affidavit are true and correct. Verified at _______ on ${fmtDate(f.date)}.

                                        ________________________
                                        DEPONENT
                                        ${v(f.studentName)}

Solemnly affirmed before me on ${fmtDate(f.date)}.
________________________
Notary Public / Oath Commissioner (Seal & Stamp)`,

refund_demand:f=>`REFUND / REPLACEMENT DEMAND NOTICE

FROM:
${v(f.consumerName)}
${v(f.consumerAddress)}
Mobile: _______________________

By: REGD. POST A.D. / SPEED POST / EMAIL
Date: ${fmtDate(f.date)}
Ref. No: RFD/${new Date().getFullYear()}/${RN()}

TO,
The Customer Service / Legal Department
${v(f.companyName)}
${v(f.companyAddress)}

SUBJECT: DEMAND FOR REFUND / REPLACEMENT — NOTICE UNDER THE CONSUMER PROTECTION ACT, 2019

Dear Sir / Madam,

1. I am a consumer as defined under Section 2(7) of the Consumer Protection Act, 2019.

2. On ${fmtDate(f.purchaseDate)}, I purchased the following from you:
   ${v(f.productService)}
   Amount Paid: ${amt(f.amountPaid)}
   Mode of Payment: _______________
   Order / Invoice No.: _______________

3. REASON FOR REFUND / REPLACEMENT DEMAND:
   ${v(f.reason)}

4. PREVIOUS COMPLAINT:
   I had raised this issue with your customer service / support team earlier. However, no satisfactory resolution has been provided till date, despite my follow-ups.

5. LEGAL BASIS FOR THIS DEMAND:
   Your acts and omissions constitute:
   (a) Deficiency in service under Section 2(11) of the Consumer Protection Act, 2019.
   (b) Sale of defective goods under Section 2(10) of the Consumer Protection Act, 2019.
   (c) Unfair trade practice under Section 2(47) of the Consumer Protection Act, 2019.

6. DEMAND:
   I hereby DEMAND that within ${v(f.deadline)} (${toWords(parseInt(f.deadline)||15)}) days from the date of receipt of this Notice, you:
   ${v(f.reason).toLowerCase().includes('refund') || v(f.productService).toLowerCase().includes('service')
     ? `(a) Refund the full amount of ${amt(f.amountPaid)} paid by me.
   (b) Pay compensation for mental agony and harassment caused.
   (c) Pay costs of this notice.`
     : `(a) Replace the defective product with a new one of the same model and specifications.
   (b) OR refund the full purchase price of ${amt(f.amountPaid)}.
   (c) Pay compensation for inconvenience and mental agony.`}

7. CONSEQUENCE OF NON-COMPLIANCE:
   TAKE NOTICE that if you fail to comply with the above demand within the stated period, I shall be constrained to file a complaint before the District Consumer Disputes Redressal Commission under Section 34 of the Consumer Protection Act, 2019, and claim:
   (a) Full refund / replacement as demanded above.
   (b) Compensation for mental agony, harassment and consequential losses.
   (c) Punitive damages under Section 39(1)(d) of the Consumer Protection Act, 2019.
   (d) Cost of this notice and all litigation expenses.

This notice is issued without prejudice to all other rights and remedies available to me.

________________________
${v(f.consumerName)}
Date: ${fmtDate(f.date)}`,

deficiency_notice:f=>`NOTICE FOR DEFICIENCY IN SERVICE

FROM:
${v(f.consumerName)}
${v(f.consumerAddress)}

By: REGD. POST A.D. / SPEED POST
Date: ${fmtDate(f.date)}
Ref. No: DEF/${new Date().getFullYear()}/${RN()}

TO,
The Manager / Customer Service Head
${v(f.companyName)}

SUBJECT: FORMAL NOTICE FOR DEFICIENCY IN SERVICE — UNDER THE CONSUMER PROTECTION ACT, 2019

Dear Sir / Madam,

1. I am a consumer as defined under Section 2(7) of the Consumer Protection Act, 2019, having availed your services for consideration.

2. DEFICIENCY IN SERVICE:
   ${v(f.deficiencyDetails)}

3. LOSS AND DAMAGE SUFFERED:
   As a direct result of the above deficiency in service, I have suffered the following loss and damage:
   ${v(f.losses)}

4. LEGAL POSITION:
   The above acts and omissions on your part constitute:
   (a) Deficiency in service within the meaning of Section 2(11) of the Consumer Protection Act, 2019, which defines deficiency as any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance of a service.
   (b) Failure to render services as promised / contracted.
   (c) Negligence in service delivery causing harm to the consumer.

5. DEMAND:
   I hereby demand that within ${v(f.deadline)} (${toWords(parseInt(f.deadline)||15)}) days from the date of receipt of this notice, you:
   ${v(f.demand)}
   And also pay compensation of Rs. _____________/- for mental agony, harassment and consequential losses suffered.

6. CONSEQUENCE OF FAILURE:
   In the event of your failure to comply with the above demand within the stipulated period, I shall approach the District Consumer Disputes Redressal Commission under Section 34 of the Consumer Protection Act, 2019, and claim the above reliefs along with punitive damages and full litigation costs. All proceedings shall be at your risk and cost.

This notice is without prejudice to all other rights and remedies available to me under law.

________________________
${v(f.consumerName)}
Date: ${fmtDate(f.date)}`,

online_fraud_complaint:f=>`COMPLAINT REGARDING ONLINE FRAUD / CYBER CRIME

TO,
The Station House Officer / Cyber Crime Cell
${v(f.victimAddress)}

AND TO:
The National Cyber Crime Reporting Portal (cybercrime.gov.in)

Date: ${fmtDate(f.date)}

SUBJECT: COMPLAINT REGARDING ONLINE FRAUD / CYBER CRIME — AMOUNT DEFRAUDED: ${amt(f.amountLost)}

Respected Sir / Madam,

I, ${v(f.victimName)}, residing at ${v(f.victimAddress)}, hereby file this complaint regarding online fraud / cyber crime committed against me.

MY DETAILS:
Mobile No.: ${v(f.mobileNo)}
Bank Name: ${v(f.bankName)}
Account No. / UPI ID: ${v(f.accountNo)}

DETAILS OF FRAUD:
Date of Incident: ${fmtDate(f.incidentDate)}
Amount Defrauded: ${amt(f.amountLost)}

DESCRIPTION OF HOW THE FRAUD OCCURRED:
${v(f.fraudDetails)}

EVIDENCE AVAILABLE:
${v(f.evidence)}

I hereby state on solemn affirmation that:

1. The above fraud was committed without my knowledge or consent.
2. I did not voluntarily share any OTP, PIN, password or confidential information.
3. I have taken the following immediate steps after the fraud:
   (a) Blocked my bank account / UPI / card immediately after discovering the fraud.
   (b) Complained to my bank at: _______________________ on ________.
   (c) Filed a complaint on the National Cyber Crime Portal (cybercrime.gov.in).
   (d) Preserved all evidence including screenshots, call logs and transaction records.

4. I request the following action:
   (a) Registration of FIR under applicable provisions including:
       - Section 66C of the Information Technology Act, 2000 (Identity theft)
       - Section 66D of the IT Act, 2000 (Cheating by personation using computer resource)
       - Sections 318 / 319 / 420 of the Bharatiya Nyaya Sanhita, 2023 (Cheating)
       - Section 43 of the IT Act, 2000 (Penalty for damage to computer system)
   (b) Investigation and recovery of the defrauded amount.
   (c) Necessary directions to the bank to freeze the fraudster's account.
   (d) Coordination with the National Cyber Crime Cell for tracking the perpetrators.

Yours faithfully,

________________________
${v(f.victimName)}
Date: ${fmtDate(f.date)}

Enclosures:
1. Screenshots of fraudulent messages / transactions
2. Bank statement showing fraudulent transaction
3. Any other supporting evidence`,

insurance_claim:f=>`INSURANCE CLAIM LETTER

Date: ${fmtDate(f.date)}
Ref. No: CLM/${new Date().getFullYear()}/${RN()}

FROM:
${v(f.claimantName)}
${v(f.claimantAddress)}
Mobile: _______________________

TO,
The Claims Manager
${v(f.insuranceCompany)}

SUBJECT: INSURANCE CLAIM — POLICY NO. ${v(f.policyNumber)} — CLAIM FOR ${v(f.claimType).toUpperCase()} — AMOUNT: ${amt(f.claimAmount)}

Dear Sir / Madam,

1. I, ${v(f.claimantName)}, hold an insurance policy bearing No. ${v(f.policyNumber)} issued by ${v(f.insuranceCompany)} for ${v(f.claimType)} insurance.

2. DETAILS OF CLAIM:
   Date of Incident: ${fmtDate(f.incidentDate)}
   Nature of Claim: ${v(f.claimType)}
   Claim Amount: ${amt(f.claimAmount)}

3. DESCRIPTION OF INCIDENT AND CLAIM:
   ${v(f.claimDetails)}

4. DOCUMENTS SUBMITTED WITH THIS CLAIM:
   ${v(f.documentsAttached)}

5. I hereby declare that:
   (a) All information provided in this claim is true, accurate and complete.
   (b) The incident / loss is genuine and covered under the terms of my policy.
   (c) I have not filed any other claim for the same incident with any other insurer.
   (d) I shall cooperate fully with any investigation, survey or assessment required.
   (e) I understand that any false statement or suppression of material facts shall render my claim void and may lead to legal action.

6. DEMAND:
   I request you to:
   (a) Register my claim immediately.
   (b) Appoint a surveyor / assessor at the earliest.
   (c) Settle my claim of ${amt(f.claimAmount)} within the prescribed statutory period as per IRDAI regulations.

7. PLEASE NOTE that under Regulation 4 of the IRDAI (Protection of Policyholders' Interests) Regulations, 2017, every insurer shall settle or reject a claim within 30 days from the date of receipt of the last necessary document. Failure to settle within this period shall attract interest at 2% above the bank rate from the date of receipt of last document.

8. In the event of repudiation or undue delay, I reserve the right to:
   (a) File a complaint before the Insurance Ombudsman under the Insurance Ombudsman Rules, 2017.
   (b) Approach the IRDAI Grievance Cell.
   (c) File a consumer complaint under the Consumer Protection Act, 2019.

Thanking you,

________________________
${v(f.claimantName)}
Policy No.: ${v(f.policyNumber)}
Date: ${fmtDate(f.date)}`,

warranty_claim:f=>`WARRANTY / PRODUCT DEFECT CLAIM NOTICE

FROM:
${v(f.consumerName)}
${v(f.consumerAddress)}

Date: ${fmtDate(f.date)}
Ref. No: WRN/${new Date().getFullYear()}/${RN()}

TO,
The Customer Service / Warranty Department
${v(f.companyName)}

SUBJECT: WARRANTY CLAIM FOR DEFECTIVE PRODUCT — DEMAND FOR REPLACEMENT / REPAIR / REFUND

Dear Sir / Madam,

1. I am a consumer as defined under Section 2(7) of the Consumer Protection Act, 2019.

2. PRODUCT DETAILS:
   ${v(f.productDetails)}
   Date of Purchase: ${fmtDate(f.purchaseDate)}
   Warranty Period: ${v(f.warrantyPeriod)} from date of purchase
   The product is currently within the warranty period.

3. DEFECT DESCRIPTION:
   ${v(f.defectDetails)}

4. PREVIOUS SERVICE REQUESTS:
   I had brought the above defect to your attention / your service centre on ____________. However, the defect has not been rectified / has recurred.

5. LEGAL POSITION:
   Under the Consumer Protection Act, 2019, and your warranty terms:
   (a) The product sold carries an implied warranty of merchantability and fitness for purpose.
   (b) The defect constitutes a manufacturing defect / material defect covered under your warranty.
   (c) As per Section 2(10) of the Consumer Protection Act, 2019, a defective product entitles me to repair, replacement, or refund.

6. DEMAND:
   I hereby demand that within 15 (Fifteen) days from the receipt of this notice, you:
   ${v(f.demand)}

7. CONSEQUENCE OF NON-COMPLIANCE:
   If you fail to comply within the above period, I shall file a complaint before the District Consumer Disputes Redressal Commission under Section 34 of the Consumer Protection Act, 2019, and claim:
   (a) Replacement / repair / refund as demanded.
   (b) Compensation for mental agony and inconvenience.
   (c) Cost of this notice and legal proceedings.
   (d) Punitive damages under Section 39(1)(d) of the Consumer Protection Act, 2019.

This notice is without prejudice to all other rights and remedies available to me.

________________________
${v(f.consumerName)}
Date: ${fmtDate(f.date)}

Enclosures:
1. Copy of purchase invoice / bill
2. Copy of warranty card
3. Photographs of defect (if applicable)`,

medical_negligence:f=>`COMPLAINT LETTER — MEDICAL NEGLIGENCE

FROM:
${v(f.complainantName)}
${v(f.complainantAddress)}

Date: ${fmtDate(f.date)}
Ref. No: MED-NEG/${new Date().getFullYear()}/${RN()}

TO,
1. The Superintendent / Medical Director
   ${v(f.hospitalName)}
   ${v(f.hospitalAddress)}

2. The State Medical Council / National Medical Commission

3. The District Consumer Disputes Redressal Commission (if applicable)

SUBJECT: FORMAL COMPLAINT OF MEDICAL NEGLIGENCE — PATIENT: ${v(f.patientName)}

Dear Sir / Madam,

1. I, ${v(f.complainantName)}, am filing this complaint on behalf of the patient ${v(f.patientName)} / in my own capacity as the patient.

2. TREATMENT DETAILS:
   ${v(f.treatmentDetails)}

3. NATURE OF NEGLIGENCE:
   ${v(f.negligenceDetails)}

4. HARM AND INJURY CAUSED:
   ${v(f.harmCaused)}

5. LEGAL POSITION:
   The above acts, omissions and conduct of ${v(f.hospitalName)} / the treating doctor constitute:
   (a) Medical negligence as defined under established principles of Indian medical jurisprudence and the judgments of the Hon'ble Supreme Court in Jacob Mathew v. State of Punjab (2005) 6 SCC 1 and similar cases.
   (b) Deficiency in service under Section 2(11) of the Consumer Protection Act, 2019 (the Supreme Court in V. Krishnakumar v. State of Tamil Nadu, 2015, held that medical services are covered under the Consumer Protection Act).
   (c) Failure to maintain the standard of care owed to the patient.
   (d) Possible offence under Section 304A of the IPC / Section 106 of the BNS, 2023 (causing death by negligence), if applicable.

6. COMPENSATION CLAIMED:
   I demand compensation of ${amt(f.damagesClaimed)} for:
   (a) Medical expenses incurred due to the negligence.
   (b) Physical pain and suffering caused.
   (c) Mental agony and emotional distress.
   (d) Loss of income / earning capacity (if applicable).
   (e) Future medical expenses.

7. DEMANDS:
   (a) A thorough and impartial inquiry into the alleged medical negligence.
   (b) Appropriate disciplinary action against the responsible doctor / hospital.
   (c) Payment of compensation of ${amt(f.damagesClaimed)} within 30 days.
   (d) Referral of the matter to the State Medical Council for cancellation / suspension of the treating doctor's licence, if warranted.

8. NOTICE OF LEGAL ACTION:
   In the event of failure to address this complaint within 30 days, I shall approach:
   (a) The District Consumer Disputes Redressal Commission.
   (b) The State Medical Council.
   (c) The National Consumer Disputes Redressal Commission.
   (d) Competent criminal courts under applicable provisions of the BNS, 2023.

Yours faithfully,

________________________
${v(f.complainantName)}
Date: ${fmtDate(f.date)}

Enclosures:
1. Medical records, discharge summary, prescriptions
2. Bills and receipts for medical expenses
3. Expert opinion (if available)
4. Any other supporting documents`,


};

// ── ADVANCED UTILITIES ────────────────────────────────────────────────────────

/**
 * listTemplates()
 * Returns an array of all available template IDs.
 */
function listTemplates() {
  return Object.keys(TMPL);
}

/**
 * templateExists(id)
 * Returns true if a template exists for the given ID.
 */
function templateExists(id) {
  return typeof TMPL[id] === 'function';
}

/**
 * previewDoc(id, f)
 * Returns the first 500 characters of a generated document (for previewing).
 */
function previewDoc(id, f) {
  const full = generateDoc(id, f);
  return full.length > 500 ? full.substring(0, 500) + '... [Preview truncated. Generate full document for complete text.]' : full;
}

/**
 * validateFields(id, f)
 * Checks required fields for a template and returns an array of missing field names.
 * Returns an empty array if all required fields are present.
 */
const REQUIRED_FIELDS = {
  affidavit:           ['fullName','fatherName','age','address','city','declaration','date'],
  self_declaration:    ['fullName','fatherName','address','city','purpose','date'],
  name_change:         ['oldName','newName','fatherName','age','address','city','reason','date'],
  rent_agreement:      ['landlordName','tenantName','propertyAddress','city','rentAmount','startDate','duration'],
  loan_agreement:      ['lenderName','borrowerName','loanAmount','repaymentDate','city','date'],
  nda:                 ['party1','party2','purpose','city','date'],
  employment_contract: ['companyName','employeeName','designation','city','date','joiningDate'],
  legal_notice:        ['senderName','senderAddress','recipientName','facts','demand','city','date'],
  cheque_bounce_notice:['senderName','recipientName','chequeNumber','chequeDate','chequeAmount','bankName','bounceDate','city','date'],
  consumer_complaint:  ['complainantName','oppPartyName','transactionDetails','grievance','claimAmount','city','date'],
  property_sale:       ['vendorName','purchaserName','propertyDescription','surveyNumber','saleAmount','city','date'],
  poa_general:         ['principalName','attorneyName','purpose','city','date'],
  promissory_note:     ['makerName','payeeName','amount','city','date'],
  divorce_mutual:      ['husbandName','wifeName','marriageDate','separationDate','city','date'],
  service_agreement:   ['providerName','clientName','scopeOfServices','serviceFee','city','date'],
  character_cert:      ['fullName','fatherName','address','city','knownFor','purpose','issuedBy','date'],
};

function validateFields(id, f) {
  const required = REQUIRED_FIELDS[id] || [];
  return required.filter(field => !f[field] || !String(f[field]).trim());
}

/**
 * generateDocSafe(id, f)
 * Like generateDoc but returns { ok: true, text } or { ok: false, missing: [...] }
 */
function generateDocSafe(id, f) {
  const missing = validateFields(id, f);
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `Missing required fields: ${missing.map(m => m.replace(/([A-Z])/g, ' $1').trim()).join(', ')}.`,
    };
  }
  try {
    const text = generateDoc(id, f);
    return { ok: true, text };
  } catch (e) {
    return { ok: false, missing: [], message: 'Document generation error: ' + e.message };
  }
}

/**
 * getStampHint(id, amount)
 * Returns stamp duty hint string for the given document type.
 */
function getStampHint(id, amount) {
  return stampHint(id, amount);
}

/**
 * formatAmount(n)
 * Public wrapper for amt() — formats Indian currency.
 */
function formatAmount(n) {
  return amt(n);
}

/**
 * formatDate(d)
 * Public wrapper for fmtDate() — formats dates.
 */
function formatDate(d) {
  return fmtDate(d);
}

/**
 * numberToWords(n)
 * Public wrapper for toWords() — converts number to Indian English words.
 */
function numberToWords(n) {
  return toWords(n);
}

// ── EXPORTS (for Node.js / bundled environments) ──────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateDoc,
    generateDocSafe,
    listTemplates,
    templateExists,
    previewDoc,
    validateFields,
    getStampHint,
    formatAmount,
    formatDate,
    numberToWords,
    TMPL,
    MYRIGHT_CONFIG,
    REQUIRED_FIELDS,
  };
}
// ── END OF templates.js ───────────────────────────────────────────────────────
