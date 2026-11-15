import { exec } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'
const execPromise = promisify(exec)

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  if (!/audio/.test(q.mimetype || '')) return m.reply('⚠️ اعمل ريبلاي على صوت.')

  await m.reply('🤖 جاري تحويل الصوت لروبوت...')
  const media = await q.download()
  fs.writeFileSync('./tmp/in.mp3', media)

  try {
    // فلتر صوتي بيخلي الصوت يشبه الروبوت
    await execPromise(`ffmpeg -i ./tmp/in.mp3 -af "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75" ./tmp/out.mp3`)
    const output = fs.readFileSync('./tmp/out.mp3')
    await conn.sendMessage(m.chat, { audio: output, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    fs.unlinkSync('./tmp/in.mp3'); fs.unlinkSync('./tmp/out.mp3')
  } catch { m.reply('❌ حدث خطأ.') }
}
handler.command = ['روبوت', 'robot']
handler.tags = ['audio']
export default handler