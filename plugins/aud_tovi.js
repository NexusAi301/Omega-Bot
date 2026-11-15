import { toPTT } from '../lib/converter.js'

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  
  if (!/audio|video/.test(mime)) return m.reply('⚠️ اعمل ريبلاي على صوت أو فيديو عشان أحوله لـ ريكورد.')

  await m.reply('⏳ جاري التحويل...')
  
  try {
    const media = await q.download()
    const audio = await toPTT(media, 'mp4')
    
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      audio: audio.data,
      mimetype: 'audio/mp4',
      ptt: true,
      caption: `✅ *تم التحويل لريكورد.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء التحويل.')
  }
}
handler.command = ['لريكورد', 'tovn', 'vn']
handler.tags = ['audio']
export default handler