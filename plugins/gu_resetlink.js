// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_resetlink.js
// الوظيفة: اختصار لإعادة إنشاء رابط دعوة المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أقدر أغير الرابط.')

  try {
    await conn.groupRevokeInvite(m.chat)
    const code = await conn.groupInviteCode(m.chat)
    const newLink = `https://chat.whatsapp.com/${code}`
    const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `🔄 *تم إعادة تعيين رابط الجروب.*\n\nالرابط الجديد:\n${newLink}\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء إعادة تعيين الرابط.')
  }
}
handler.command = ['تجديد_الرابط', 'revoke']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler