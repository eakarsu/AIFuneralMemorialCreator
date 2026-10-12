import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './NativeAIControls.css';

const variants = ['Quick brief', 'Team planning', 'Detailed review'];
const referenceKey = (key) => /(?:^|_)(?:id|ids)$/i.test(key) || /[a-z](?:Id|Ids)(?:[A-Z]\w*|$)/.test(key) || /^(?:selected)?(?:patient|device|menu|item|case|memory|batch|document|client|plot|field|unit|building|ride|zone|restaurant|vin|serial_number|license_number)$/i.test(key);
const evidenceKey = (key) => /(?:image|photo|audio|video|file|upload|url|uri|transcript|recording)/i.test(key);
const human = (key) => String(key || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
const json = (value) => { try { return JSON.parse(value); } catch { return undefined; } };

function labelFor(element) {
  const label = Array.from(element.labels || []).map((item) => item.textContent.trim()).join(' ');
  return label || element.closest('label')?.textContent.trim() || element.parentElement?.querySelector('label')?.textContent.trim() || element.placeholder || human(element.dataset.aiField || element.name || element.id);
}

function numeric(element, key, variant) {
  const hint = Number(element.placeholder);
  const values = /(?:vehicle|model|manufactur).*year|^year$/i.test(key) ? [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()] : /year/i.test(key) ? [3, 5, 10] : /day|window|horizon|lookback/i.test(key) ? [30, 60, 90]
    : /hour/i.test(key) ? [8, 12, 16] : /percent|percentage|risk|threshold/i.test(key) ? [15, 25, 40]
      : /budget|balance|cost|price|contribution|revenue/i.test(key) ? [100, 250, 500]
        : /count|num|limit|quantity|sample/i.test(key) ? [10, 25, 50] : [1, 3, 5];
  let value = Number.isFinite(hint) && element.placeholder.trim() ? hint * [1, 1.25, 1.5][variant] : values[variant];
  const minimum = element.min !== '' ? Number(element.min) : -Infinity;
  const maximum = element.max !== '' ? Number(element.max) : Infinity;
  value = Math.max(minimum, Math.min(maximum, value));
  const step = element.step && element.step !== 'any' ? Number(element.step) : 1;
  if (Number.isFinite(step) && step > 0) value = Math.round(value / step) * step;
  return String(Math.max(minimum, Math.min(maximum, value)));
}

function textExample(element, key, label, variant, context) {
  const existing = element.value.trim(), placeholder = (element.placeholder || '').trim();
  const source = json(existing) ?? json(placeholder);
  // Reuse the native schema rather than guessing a new data contract.
  if (source !== undefined) return JSON.stringify(source, null, 2);
  if (/json|geojson|payload|readings|telemetry|polygon|components|boundaries|qc_data|source_data/i.test(key + ' ' + label)) {
    if (existing) return existing;
    return null;
  }
  const mode = ['a concise first review', 'a team planning review', 'a detailed review with assumptions and alternatives'][variant];
  const people = ['Morgan Lee', 'Alex Rivera', 'Jordan Patel'];
  if (/deceased_name|subject_name/i.test(key)) return people[variant];
  if (/recipient_name/i.test(key)) return ['Casey Lee', 'Sam Rivera', 'Taylor Patel'][variant];
  if (/donor_name/i.test(key)) return ['Riley Chen', 'Avery Brooks', 'Jamie Diaz'][variant];
  if (/relationship/i.test(key)) return ['Daughter', 'Friend', 'Sibling'][variant];
  if (/key_memories/i.test(key)) return `${people[variant]} welcomed neighbors, shared stories at family dinners, and volunteered at the community library. Confirm details with family before publication.`;
  if (/gift_or_gesture/i.test(key)) return ['Flowers and a handwritten note', 'A meal for the family', 'A memorial donation'][variant];
  if (/organization/i.test(key)) return ['Community Library Fund', 'Neighborhood Food Pantry', 'Local Garden Society'][variant];
  if (/venue/i.test(key)) return ['Community memorial hall', 'Neighborhood chapel', 'Riverside gathering room'][variant];
  if (/officiant/i.test(key)) return ['Family appointed celebrant', 'Community leader', 'Family friend'][variant];
  if (/music_selections/i.test(key)) return ['Instrumental piano during arrival', 'Family selected acoustic music', 'Quiet instrumental closing piece'][variant];
  if (/city/i.test(key)) return ['Portland, Maine', 'Albany, New York', 'Madison, Wisconsin'][variant];
  if (/sensitivity_notes/i.test(key)) return 'Use gentle language, avoid unverified personal details, and let the family review the draft.';
  if (/^eventsText$/i.test(key)) return [
    '1948: Born in Portland, Maine\n1972: Began teaching at a neighborhood school\n1995: Started a community reading circle',
    '1955: Born in Albany, New York\n1980: Opened a family bakery\n2004: Began volunteering at the food pantry',
    '1962: Born in Madison, Wisconsin\n1986: Joined the city parks team\n2012: Helped establish a community garden',
  ][variant];
  if (/^values$/i.test(key)) return ['literacy, kindness, and community service', 'food security and neighborly care', 'nature, mentorship, and local parks'][variant];
  if (/^causes$/i.test(key)) return ['library access, adult literacy', 'community meals, food pantry', 'urban gardens, youth mentoring'][variant];
  if (/^title$/i.test(key)) return ['Contact the insurance provider', 'Review estate documents', 'Arrange a family planning call'][variant];
  if (/^item_type$/i.test(key)) return ['Financial', 'Legal', 'Family coordination'][variant];
  if (/^assigned_to$/i.test(key)) return ['Family representative', 'Estate coordinator', 'Designated relative'][variant];
  if (/^additional_details_for_ai$/i.test(key)) return ['The family would like a simple checklist and needs to confirm available documents.', 'Two relatives can help with the service; identify tasks needing professional advice.', 'Keep assumptions explicit and leave private details out of any public draft.'][variant];
  if (/^(?:content|program_content|biography|message|ai_response)$/i.test(key)) return `Illustrative draft about ${people[variant]}: remember their kindness, the time they gave to neighbors, and the stories shared with family. Verify personal details and obtain family review before using this text.`;
  if (/goal|objective|purpose|need/i.test(key)) return ['Identify the highest priority next steps and explain the evidence.', 'Prepare a practical plan with responsibilities, timing and success measures.', 'Compare feasible options, identify uncertainties and recommend a reviewable action plan.'][variant];
  if (/tone|style/i.test(key)) return ['Clear and concise', 'Professional and collaborative', 'Detailed and evidence based'][variant];
  if (/format/i.test(key)) return ['Executive summary and action list', 'Summary, recommendations and implementation table', 'Detailed report with assumptions, risks and next steps'][variant];
  if (/audience|recipient/i.test(key)) return ['Project owner', 'Operations team', 'Leadership and subject matter reviewers'][variant];
  if (/completed/i.test(key)) return 'Account setup, orientation, initial training';
  if (/outstanding/i.test(key)) return 'Policy acknowledgment, access review, final approval';
  if (/domain/i.test(key)) return existing || 'hr_onboarding, security_training, code_of_conduct';
  if (/policy/i.test(key)) return 'Example policy: verify required training and approvals, document exceptions, and require an authorized reviewer before any operational change.';
  if (/soil/i.test(key)) return ['Illustrative soil sample: pH 5.4, organic matter 2.1%, clay loam; no verified field observations supplied.', 'Illustrative soil sample: pH 6.2, organic matter 2.8%, sandy loam; confirm with current laboratory results.', 'Illustrative soil sample: pH 7.1, organic matter 3.4%, loam; include assumptions and measurement limitations.'][variant];
  if (/crop/i.test(key)) return ['Maize', 'Wheat', 'Soybeans'][variant];
  if (/region|location|site/i.test(key)) return ['Example northern region', 'Example central region', 'Example southern region'][variant];
  if (/disease/i.test(key)) return ['Influenza', 'Seasonal respiratory illness', 'Seasonal allergy symptoms'][variant];
  if (/priority/i.test(key)) return ['Accessibility and safety', 'Balanced service and cost', 'Resilience and long term value'][variant];
  if (/category/i.test(key)) return ['General operations', 'Planning and improvement', 'Risk and quality review'][variant];
  if (/product.*name|listing.*title|title/i.test(key)) return ['Example service offering', 'Example product launch', 'Example operations review'][variant];
  if (/weather/i.test(key)) return 'Illustrative forecast: moderate temperatures, intermittent rain and possible high winds. Confirm against the current local forecast.';
  if (/chief.*complaint|symptoms|exam.*findings|medical.*history|patient.*history/i.test(key)) return `Illustrative clinical brief for review: intermittent blurred vision after close work, no confirmed examination findings supplied. Request an evidence based explanation of missing observations and next review steps; do not infer a diagnosis from this example alone.`;
  if (/log/i.test(key)) return 'Illustrative log sample:\n09:00 Service started\n09:05 Request completed\n09:10 One delayed request; investigate before drawing conclusions.';
  if (/source/i.test(key)) return 'Illustrative user supplied example; verify against the actual source before use.';
  if (existing && !/notes?|context|description|summary|brief|prompt|text|rationale|constraints?|preferences|signals|input/i.test(key)) return existing;
  if (placeholder && !/^e\.?g\.?|optional|enter|describe|select|comma|list|full|paste|[<(]/i.test(placeholder) && placeholder.length > 10) return `Example ${label.replace(/\s*\(.*?\)|\*/g, '').trim()}: ${placeholder}. Review for ${mode}.`;
  return `Illustrative ${human(label || key).replace(/\*/g, '').trim().toLowerCase()} for ${context || 'this workflow'}: prepare ${mode}. Use the supplied information, identify missing evidence, and keep recommendations subject to review.`;
}

export function fillNativeFields(scope, variant = 0, context = '') {
  const controls = Array.from(scope.querySelectorAll('input, textarea, select'));
  let filled = 0;
  const manual = [];
  controls.forEach((element) => {
    if (element.disabled || element.readOnly || element.closest('[hidden], [aria-hidden="true"]') || ['hidden', 'submit', 'button', 'reset', 'password', 'search'].includes(element.type)) return;
    const label = labelFor(element);
    const key = element.dataset.aiField || element.name || element.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (element.type === 'file' || evidenceKey(key) || /^(?:source|citation|photo url)$/i.test(key || label)) {
      if (!element.value) manual.push(label || human(key) || 'Source file');
      return;
    }
    let value;
    if (element.tagName === 'SELECT') {
      const options = Array.from(element.options).filter((option) => option.value && !option.disabled && !option.hidden);
      if (!options.length) { manual.push(label || human(key) || 'Record selection'); return; }
      // A linked record is always a real option loaded by the native page.
      value = (referenceKey(key) || /^(?:status|session_type|template)$/i.test(key)) && element.value ? element.value : options[Math.min(variant, options.length - 1)].value;
    } else if (referenceKey(key) || /\b(?:record|patient|device|menu|batch|document|client|case|memory|field|plot|unit|group|ride|zone|restaurant|building)\s+ids?\b/i.test(label)) {
      if (!element.value) manual.push(label || human(key));
      return;
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      if (element.type === 'checkbox') {
        // Preserve consent, notification, publication and operational switches.
        if (element.required && !element.checked) manual.push(label || human(key) || 'Required acknowledgment');
        else filled += 1;
        return;
      }
      if (element.type === 'radio' && element.name && scope.querySelector(`input[type="radio"][name="${element.name.replace(/["\\]/g, '\\$&')}"]:checked`)) return;
      if (!element.checked) flushSync(() => element.click());
      filled += 1;
      return;
    } else if (element.type === 'number' || element.type === 'range') value = numeric(element, key, variant);
    else if (element.type === 'date' || element.type === 'datetime-local') {
      const date = new Date(); date.setDate(date.getDate() + [7, 14, 30][variant]);
      value = /birth/i.test(key || label) ? ['1948-04-12', '1955-06-21', '1962-09-03'][variant]
        : /death|passing/i.test(key || label) ? ['2024-02-18', '2025-05-10', '2026-01-14'][variant]
          : date.toISOString().slice(0, element.type === 'date' ? 10 : 16);
      if (element.min && value < element.min) value = element.min;
      if (element.max && value > element.max) value = element.max;
    } else if (element.type === 'time') value = ['09:00', '12:00', '15:00'][variant];
    else if (element.type === 'email') value = ['reviewer@example.com', 'team@example.com', 'owner@example.com'][variant];
    else if (element.type === 'url') { if (!element.value) manual.push(label || human(key)); return; }
    else value = textExample(element, key, label, variant, context);
    if (value === null) { manual.push(label || human(key) || 'Source data'); return; }
    const prototype = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    flushSync(() => {
      if (setter) setter.call(element, value); else element.value = value;
      element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
      if (element.tagName !== 'SELECT') element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    filled += 1;
  });
  return { filled, manual: [...new Set(manual)] };
}

export default function NativeAIControls({ children, busy = false, onCancel, context = '', presets = null }) {
  const scope = useRef(null);
  const [message, setMessage] = useState('');
  const choices = presets?.length ? presets : variants.map((name) => ({ name }));
  const fill = (variant) => {
    let result;
    if (choices[variant].fill) flushSync(() => { result = choices[variant].fill(); });
    else result = fillNativeFields(scope.current, variant, context);
    const { filled = 0, manual = [] } = result || {};
    setMessage(`${filled} editable field${filled === 1 ? '' : 's'} filled. ${manual.length ? `Supply actual ${manual.join(', ')} before running when required.` : 'Review the example, then use the Run button below.'}`);
  };
  return <section className="native-ai-scope" ref={scope}>
    <div className="native-ai-controls">
      <div><strong>Complete examples</strong><span>Fill the visible AI fields, including optional context. Review before running.</span></div>
      <div className="native-ai-control-buttons">{choices.map(({name}, index) => <button key={name} type="button" disabled={busy} onClick={() => fill(index)}>{name}</button>)}{busy && onCancel && <button type="button" className="native-ai-cancel" onClick={onCancel}>Cancel request</button>}</div>
      {message && <p role="status">{message}</p>}
    </div>
    {children}
  </section>;
}
