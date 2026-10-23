export const eventConfig = {
  id: 'sofia-birthday-2026',
  name: 'Софія',
  initial: 'С',
  age: null as number | null,
  title: 'День народження Софії',
  // ISO содержит точное смещение для даты; при смене сезона обновите его вместе с датой.
  startsAt: '2026-11-28T18:00:00+02:00',
  endsAt: '2026-11-28T23:00:00+02:00',
  timeZone: 'Europe/Kyiv',
  city: 'Київ',
  venue: '',
  address: '',
  addressVerified: false,
  meetingNote: 'Точне місце зустрічі надішлю особисто ближче до свята.',
  dressCode: 'Вечірній настрій',
  dressCodeNote:
    'Улюблений образ, у якому ти почуваєшся собою. Лаймовий або срібний акцент — за бажанням.',
  dressColors: [
    { color: '#111110', name: 'Чорний', note: 'Чорна база й один виразний аксесуар.' },
    { color: '#dfff3f', name: 'Лаймовий', note: 'Невелика деталь, яку неможливо не помітити.' },
    { color: '#ff587c', name: 'Кораловий', note: 'Теплий акцент у вбранні або макіяжі.' },
    { color: '#a8aaa8', name: 'Срібний', note: 'Прикраси й деталі, що ловлять світло.' },
  ],
  rsvpDeadline: '2026-11-21',
  allowGuests: true,
  maxGuests: 3,
  theme: { black: '#111110', acid: '#dfff3f', coral: '#ff587c', chalk: '#f1efe8' },
  invitation: {
    heading: 'У планах —',
    emphasis: 'тільки свої.',
    paragraphs: [
      'Хочу зібрати своїх людей. Обійняти, поговорити про все на світі, танцювати під улюблену музику й забути, котра година.',
      'Будуть сміх, щось смачне і моменти, які захочеться згадувати. А найважливіше — щоб ви були поруч.',
    ],
  },
  heroPhoto: {
    src: '/images/afterhours-flash.webp',
    alt: 'Диско-куля, срібний келих і свічка у світлі спалаху — авторський AI-кадр настрою',
    position: '50% 55%',
  },
  photos: [
    {
      src: '/images/afterhours-flash.webp',
      alt: 'Срібна диско-куля у світлі прямого спалаху — авторський AI-кадр',
      caption: 'За ще одне маленьке бажання',
      number: '02',
    },
    {
      src: '/images/cocktails.jpg',
      alt: 'Коктейлі й тепле світло вечірнього бару',
      caption: 'За зустрічі, яких бракувало',
      number: '01',
    },
    {
      src: '/images/afterhours-dance.webp',
      alt: 'Танцмайданчик і руки в русі — авторський AI-кадр настрою',
      caption: 'За вечори, що стають спогадами',
      number: '03',
    },
  ],
  schedule: [
    {
      time: '18:00',
      title: 'Перші обійми',
      note: 'Зустрічаємось, знайомимось, налаштовуємось на вечір.',
    },
    { time: '19:00', title: 'За одним столом', note: 'Смачна вечеря, розмови й тости від серця.' },
    { time: '20:00', title: 'Гучніше музику', note: 'Наші треки. Наш танцмайданчик. Наш момент.' },
    {
      time: '21:00',
      title: 'Час загадати бажання',
      note: 'Торт, свічки й те саме фото всіх разом.',
    },
    { time: '22:00', title: 'Без поспіху', note: 'Продовжуємо вечір — найкраще завжди спонтанне.' },
  ],
} as const;

const date = new Date(eventConfig.startsAt);
export const eventDate = {
  monthLabel: new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    timeZone: eventConfig.timeZone,
  }).format(date),
  full: new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: eventConfig.timeZone,
  }).format(date),
  short: new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: eventConfig.timeZone,
  }).format(date),
  day: new Intl.DateTimeFormat('uk-UA', { day: '2-digit', timeZone: eventConfig.timeZone }).format(
    date,
  ),
  month: new Intl.DateTimeFormat('uk-UA', {
    month: '2-digit',
    timeZone: eventConfig.timeZone,
  }).format(date),
  weekday: new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    timeZone: eventConfig.timeZone,
  }).format(date),
  time: new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: eventConfig.timeZone,
  }).format(date),
  deadline: new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    timeZone: eventConfig.timeZone,
  }).format(new Date(`${eventConfig.rsvpDeadline}T12:00:00+02:00`)),
};
