import { ArrowUpRight } from 'lucide-react';
import { eventConfig as e, eventDate as d } from '../config/eventConfig';
export function Closing() {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <div className="wrap closing-inner">
        <div className="closing-title">
          <h2 id="closing-title">
            ДАЛІ —<br />
            <span>РАЗОМ.</span>
          </h2>
          <a className="closing-arrow" href="#rsvp" aria-label="Залишити відповідь на запрошення">
            <ArrowUpRight strokeWidth={1} aria-hidden="true" />
          </a>
        </div>
        <div className="closing-bottom">
          <p>{e.name}</p>
          <span className="closing-event">
            {d.short} / {d.time}
            <br />
            {e.city}
          </span>
          <a className="button paper" href="#rsvp">
            Залишити відповідь
          </a>
        </div>
      </div>
    </section>
  );
}
