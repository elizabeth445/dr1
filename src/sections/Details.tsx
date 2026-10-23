import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { eventConfig as e, eventDate as d } from '../config/eventConfig';
import { downloadCalendar } from '../lib/calendar';
export function Details() {
  return (
    <section className="details-section" id="details" aria-labelledby="details-title">
      <div className="wrap section details-layout">
        <div className="details-top">
          <h2 id="details-title">
            БЕЗ ЗАЙВИХ
            <br />
            ЗАПИТАНЬ
          </h2>
        </div>
        <div className="details-board">
          <div className="detail-date">
            <span className="detail-label">Коли</span>
            <strong>
              {d.day}
              <span>.</span>
              {d.month}
            </strong>
            <p>
              {d.full}
              <br />
              {d.weekday} / {d.time}
            </p>
            <button className="button paper" onClick={downloadCalendar}>
              Додати в календар
              <ArrowDownToLine size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="detail-location">
            <span className="detail-label">Де</span>
            <h3>{e.city}</h3>
            <p className="venue-name">{e.venue || 'Локацію повідомимо окремо'}</p>
            {e.addressVerified && e.address && <p>{e.address}</p>}
            <p>{e.meetingNote}</p>
            {e.addressVerified && e.address && (
              <a
                className="route-link"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                Прокласти маршрут
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="detail-dress">
            <span className="detail-label">Що вдягнути</span>
            <h3>{e.dressCode}</h3>
            <p>{e.dressCodeNote}</p>
            <div
              className="dress-swatches"
              role="img"
              aria-label="Кольори настрою: чорний, лаймовий, кораловий і срібний"
            >
              <div className="swatch-fan" aria-hidden="true">
                {e.dressColors.map((color, index) => (
                  <span
                    key={color}
                    className={`dress-swatch swatch-${index}`}
                    style={{ '--swatch-color': color } as React.CSSProperties}
                  />
                ))}
              </div>
              <p>Твій стиль. Твої правила.</p>
            </div>
          </div>
          <div className="detail-bring">
            <span className="detail-label">Що взяти</span>
            <h3>
              СЕБЕ.
              <br />
              ЦЬОГО ДОСИТЬ.
            </h3>
            <p>
              Найкращий подарунок — твоя присутність.
              <br />
              Решту залиш мені.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Schedule() {
  return (
    <section className="schedule section wrap" id="evening" aria-labelledby="schedule-title">
      <div className="schedule-heading">
        <h2 id="schedule-title">
          ЛАЙНАП
          <br />
          <span>ВЕЧОРА.</span>
        </h2>
        <p>
          Приблизний план.
          <br />
          Спонтанність завжди у списку.
        </p>
      </div>
      <ol className="timeline">
        {e.schedule.map((item) => (
          <li key={item.time}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
