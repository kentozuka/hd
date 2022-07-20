import * as dotenv from 'dotenv'
dotenv.config()

const hrstart = process.hrtime()
const ev = process.env

export const env = ev

export function divide () {
  const a = Array(30).fill('=').join(' ')
  console.log(a)
}

export const getTime = (): string => {
  const now = new Date()
  const n = Math.floor(now.getTime() / 1000)
  return `${n}`
}

export const level = {
  panic: 'PANIC',
  expected: 'EXPECTED',
  info: 'INFO'
}

export const log = (level: string, body: string | null = null, e: Error | null = null) => {
  const now = process.hrtime(hrstart)
  const format = `${(now[0] + 's').padEnd(4)} | ###${level.padEnd(8)} | `
  switch (level) {
    case 'PANIC':
      console.log(format + e.message)
      if (body) console.log(format + body)
      if (ev.EXECUTION_ENVIRONMENT === 'lambda') return console.log(e)
      return
    case 'EXPECTED':
      return console.log(`${format}${body ? body : 'no content passed'}`)
    case 'INFO':
      return console.log(format + body)
  }
}
