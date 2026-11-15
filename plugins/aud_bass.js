// القسم: الصوتيات
// Category ID: aud_
// اسم الملف: aud_bass.js
// الوظيفة: تطبيق تأثير تعزيز الجهير.

// أضف كود الأمر هنا.
import { exec } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

const execPromise = promisify(exec)

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  if (!/audio/.test(mime)) return m.reply('⚠️ اعمل ريبلاي على تسجيل صوتي.')

  await m.reply('⏳ جاري تعديل الصوت...')
  
  const media = await q.download()
  fs.writeFileSync('./tmp/input.mp3', media)

  try {
    await execPromise(`ffmpeg -i ./tmp/input.mp3 -af "bass=g=15" ./tmp/output.mp3`)
    const output = fs.readFileSync('./tmp/output.mp3')
    
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      audio: output,
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
    
    fs.unlinkSync('./tmp/input.mp3')
    fs.unlinkSync('./tmp/output.mp3')
  } catch (e) {
    m.reply('❌ حدث خطأ، تأكد إن FFmpeg متثبت على السيرفر.')
  }
}
handler.command = ['باس', 'bass']
handler.tags = ['audio']
export default handler