// القسم: الصوتيات
// Category ID: aud_
// اسم الملف: aud_tomp3.js
// الوظيفة: تحويل ملف صوتي إلى MP3.

// أضف كود الأمر هنا.
import { toAudio } from '../lib/converter.js'

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  
  if (!/video|audio/.test(mime)) return m.reply('⚠️ اعمل ريبلاي على فيديو أو صوت عشان أحوله لـ MP3.')

  await m.reply('⏳ جاري التحويل...')
  
  try {
    const media = await q.download()
    const audio = await toAudio(media, 'mp4')
    
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      audio: audio.data,
      mimetype: 'audio/mpeg',
      fileName: 'audio.mp3',
      caption: `✅ *تم التحويل بنجاح.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء التحويل.')
  }
}
handler.command = ['لصوت', 'tomp3', 'mp3']
handler.tags = ['audio']
export default handler