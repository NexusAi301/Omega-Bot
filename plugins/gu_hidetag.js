// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_hidetag.js
// الوظيفة: منشن جميع الأعضاء برسالة مخفية أو مختصرة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants.map(p => p.id)
  const txt = text || '📢 تنبيه للجميع!'

  const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `${txt}\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: participants,
    contextInfo: {
      mentionedJid: participants, isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['منشن_مخفي', 'hidetag']
handler.group = true
handler.admin = true
export default handler