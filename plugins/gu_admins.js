// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_admins.js
// الوظيفة: عرض مشرفي المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  let admins = groupMetadata.participants.filter(p => p.admin).map((p, i) => `${i + 1}. @${p.id.split('@')[0]} ${p.admin === 'superadmin' ? '(مالك)' : ''}`).join('\n')
  if (!admins) admins = 'لا يوجد مشرفين.'

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `👑 *قائمة المشرفين:*\n\n${admins}\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: groupMetadata.participants.filter(p => p.admin).map(p => p.id),
    contextInfo: {
      mentionedJid: groupMetadata.participants.filter(p => p.admin).map(p => p.id), isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['المشرفين', 'admins']
handler.group = true
export default handler