// القسم: الصوتيات
// Category ID: aud_
// اسم الملف: aud_nightcore.js
// الوظيفة: تطبيق تأثير Nightcore.

// أضف كود الأمر هنا.
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ اكتب النص اللي عايز أحوله لصوت.\nمثال: *${usedPrefix + command} أهلاً بكم في البوت*`)

  await m.reply('🔊 جاري تحويل النص لصوت...')

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    
    await conn.sendMessage(m.chat, {
      audio: Buffer.from(data),
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء تحويل النص لصوت.')
  }
}
handler.command = ['صوت', 'tts', 'نطق']
handler.tags = ['audio']
export default handler