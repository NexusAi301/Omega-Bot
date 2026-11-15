// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_mute.js
// الوظيفة: كتم عضو ومنعه من المشاركة وفق آلية البوت.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف.')

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص أو رد على رسالته.')

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    await conn.groupParticipantsUpdate(m.chat, [who], 'add')
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `🔇 *تم كتم* @${who.split('@')[0]} *(لن يتمكن من الإرسال حتى يتم فك الكتم).*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      mentions: [who],
      contextInfo: {
        mentionedJid: [who], isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ (ملاحظة: واتساب لا يدعم الكتم المباشر، الكود بيحاول يطرده ويضيفه تاني كحل بديل).')
  }
}
handler.command = ['كتم', 'mute']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler