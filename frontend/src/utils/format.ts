export const fmt = {
  time: (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  bp: (sys: number, dia: number) => `${sys}/${dia}`,
  spo2: (v: number) => `${v.toFixed(1)}%`,
  temp: (v: number) => `${v.toFixed(1)}°C`,
  hr: (v: number) => `${v}`,
}
