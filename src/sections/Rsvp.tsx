import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check, Pencil, Trash2 } from 'lucide-react';
import { eventConfig as e, eventDate as d } from '../config/eventConfig';
import { useMotionPreference } from '../hooks/useMotionPreference';
type Response = {
  version: 1;
  name: string;
  attendance: 'yes' | 'no';
  guests: number;
  message: string;
  updatedAt: string;
};
const storageKey = `invitation:rsvp:v1:${e.id}`;
function readResponse(): Response | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return value &&
      value.version === 1 &&
      typeof value.name === 'string' &&
      value.name.trim().length >= 2 &&
      value.name.length <= 80 &&
      ['yes', 'no'].includes(value.attendance) &&
      Number.isInteger(value.guests) &&
      value.guests >= 1 &&
      value.guests <= e.maxGuests &&
      typeof value.message === 'string' &&
      value.message.length <= 500
      ? value
      : null;
  } catch {
    return null;
  }
}
export function Rsvp() {
  const [saved, setSaved] = useState<Response | null>(readResponse);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(saved?.name ?? '');
  const [attendance, setAttendance] = useState<'yes' | 'no' | ''>(saved?.attendance ?? '');
  const [guests, setGuests] = useState(saved?.guests ?? 1);
  const [message, setMessage] = useState(saved?.message ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storageError, setStorageError] = useState('');
  const success = useRef<HTMLHeadingElement>(null);
  const formName = useRef<HTMLInputElement>(null);
  const reduced = useMotionPreference();
  const isComplete = !!saved && !editing;
  const submitted = useRef(false);
  useEffect(() => {
    if (isComplete && submitted.current) success.current?.focus({ preventScroll: true });
  }, [isComplete]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Напиши ім’я — щонайменше 2 символи.';
    if (!attendance) next.attendance = 'Обери, чи зможеш приєднатися.';
    setErrors(next);
    setStorageError('');
    if (Object.keys(next).length) {
      if (next.name) formName.current?.focus();
      else document.querySelector<HTMLInputElement>('#attendance-yes')?.focus();
      return;
    }
    const response: Response = {
      version: 1,
      name: name.trim(),
      attendance: attendance as 'yes' | 'no',
      guests: attendance === 'yes' && e.allowGuests ? guests : 1,
      message: message.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(response));
      submitted.current = true;
      setSaved(response);
      setEditing(false);
    } catch {
      setStorageError(
        'Браузер не дозволяє зберегти відповідь. Дозволь локальне сховище й спробуй ще раз. Твої дані залишилися у формі.',
      );
    }
  }
  function remove() {
    try {
      localStorage.removeItem(storageKey);
      setSaved(null);
      setName('');
      setAttendance('');
      setMessage('');
      setGuests(1);
      setErrors({});
      setStorageError('');
      requestAnimationFrame(() => formName.current?.focus());
    } catch {
      setStorageError('Не вдалося видалити відповідь зі сховища браузера.');
    }
  }
  return (
    <section className="rsvp section wrap" id="rsvp" aria-labelledby="rsvp-title">
      <div className="rsvp-heading">
        <h2 id="rsvp-title">
          ТИ У <span>СПИСКУ?</span>
        </h2>
        <p>
          Дай знати до {d.deadline},<br />
          щоб я могла подбати про все.
        </p>
      </div>
      <div className="rsvp-form-area">
        <>
          {isComplete ? (
            <motion.div
              key="success"
              className="rsvp-success"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            >
              <span className="success-icon">
                <Check size={29} strokeWidth={1} aria-hidden="true" />
              </span>
              <p className="saved-status">Відповідь збережено на цьому пристрої</p>
              <h3 ref={success} tabIndex={-1}>
                {saved.attendance === 'yes' ? 'До зустрічі,' : 'Дякую за відповідь,'}
                <br />
                <i>{saved.name}!</i>
              </h3>
              <div className="response-summary">
                <span>
                  {saved.attendance === 'yes' ? 'Так, із задоволенням!' : 'На жаль, не зможу'}
                </span>
                {saved.attendance === 'yes' && e.allowGuests && (
                  <span>Кількість гостей: {saved.guests}</span>
                )}
                {saved.message && <p>«{saved.message}»</p>}
              </div>
              <p className="local-note">
                Це локальне демо. Софія не отримала цю відповідь — вона доступна лише в цьому
                браузері.
              </p>
              <div className="response-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setEditing(true);
                    requestAnimationFrame(() => formName.current?.focus());
                  }}
                >
                  <Pencil size={13} aria-hidden="true" /> Змінити відповідь
                </button>
                <button className="text-button" onClick={remove}>
                  <Trash2 size={13} aria-hidden="true" /> Видалити
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              noValidate
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <div className="field">
                <label htmlFor="guest-name">
                  Як тебе звати? <span>*</span>
                </label>
                <input
                  ref={formName}
                  id="guest-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Твоє ім’я"
                  value={name}
                  maxLength={80}
                  required
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p className="field-error" id="name-error">
                    {errors.name}
                  </p>
                )}
              </div>
              <fieldset
                className="attendance-field"
                aria-describedby={errors.attendance ? 'attendance-error' : undefined}
                aria-invalid={!!errors.attendance}
              >
                <legend>
                  Чи приєднаєшся? <span>*</span>
                </legend>
                <div className="attendance-options">
                  <label className={attendance === 'yes' ? 'selected' : ''}>
                    <input
                      id="attendance-yes"
                      type="radio"
                      name="attendance"
                      value="yes"
                      checked={attendance === 'yes'}
                      onChange={() => setAttendance('yes')}
                      required
                    />
                    <span className="radio-dot" />
                    Так, із задоволенням!
                  </label>
                  <label className={attendance === 'no' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      checked={attendance === 'no'}
                      onChange={() => setAttendance('no')}
                      required
                    />
                    <span className="radio-dot" />
                    На жаль, не зможу
                  </label>
                </div>
                {errors.attendance && (
                  <p className="field-error" id="attendance-error">
                    {errors.attendance}
                  </p>
                )}
              </fieldset>
              {e.allowGuests && attendance === 'yes' && (
                <div className="field guests-field">
                  <label htmlFor="guests">Скільки вас буде, разом із тобою?</label>
                  <select
                    id="guests"
                    name="guests"
                    value={guests}
                    onChange={(event) => setGuests(Number(event.target.value))}
                  >
                    {Array.from({ length: e.maxGuests }, (_, i) => (
                      <option value={i + 1} key={i}>
                        {i === 0 ? '1 — тільки я' : i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="field">
                <label htmlFor="guest-message">
                  Кілька слів для мене <span className="optional">необов’язково</span>
                </label>
                <textarea
                  id="guest-message"
                  name="message"
                  placeholder="Побажання, улюблений трек або просто привіт…"
                  rows={3}
                  value={message}
                  maxLength={500}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <span className="message-count">{message.length} / 500</span>
              </div>
              <button className="button acid submit-button" type="submit">
                {editing ? 'Зберегти зміни' : 'Зберегти відповідь'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <p className="local-note">
                Демо: відповідь зберігається тільки в цьому браузері.
                <br />
                Вона не надсилається організаторці.
              </p>
              {editing && (
                <button
                  className="text-button cancel-edit"
                  type="button"
                  onClick={() => {
                    if (saved) {
                      setName(saved.name);
                      setAttendance(saved.attendance);
                      setGuests(saved.guests);
                      setMessage(saved.message);
                    }
                    setEditing(false);
                    setErrors({});
                  }}
                >
                  Скасувати зміни
                </button>
              )}
            </motion.form>
          )}
        </>
        {storageError && (
          <p className="field-error" role="alert">
            {storageError}
          </p>
        )}
      </div>
    </section>
  );
}
