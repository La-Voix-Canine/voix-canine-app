/**
 * Génère un fichier .ics (format standard des agendas) pour un rendez-vous
 * et déclenche son téléchargement. Sur téléphone, ouvrir ce fichier propose
 * de l'ajouter directement à l'agenda natif.
 */
export function downloadIcs({ title, description, date, time, durationMinutes = 60 }) {
  const start = new Date(`${date}T${time || '09:00'}:00`)
  const end = new Date(start.getTime() + durationMinutes * 60000)

  const fmt = (d) =>
    d.getUTCFullYear().toString().padStart(4, '0') +
    (d.getUTCMonth() + 1).toString().padStart(2, '0') +
    d.getUTCDate().toString().padStart(2, '0') +
    'T' +
    d.getUTCHours().toString().padStart(2, '0') +
    d.getUTCMinutes().toString().padStart(2, '0') +
    '00Z'

  const escapeText = (s = '') => s.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Voix Canine//FR',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@la-voix-canine`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rendez-vous.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
