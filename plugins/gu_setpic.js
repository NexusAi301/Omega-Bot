// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_setpic.js
// الوظيفة: تغيير صورة المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أقدر أغير الصورة.')
  
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('⚠️ اعمل ريبلاي على صورة واكتب الأمر.')

  try {
    const media = await q.download()
    await conn.updateProfilePicture(m.chat, media)
    
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `✅ *تم تغيير صورة الجروب بنجاح.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء تغيير الصورة.')
  }
}
handler.command = ['تغير_صورة', 'setpic']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler