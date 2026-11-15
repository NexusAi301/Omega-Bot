// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_staff.js
// الوظيفة: عرض قائمة طاقم الإشراف المخصص للبوت.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const owner = groupMetadata.owner
  const admins = groupMetadata.participants.filter(p => p.admin)

  let txt = `👑 *إدارة الجروب:*\n\n`
  txt += `👤 *المالك:* @${owner ? owner.split('@')[0] : 'غير معروف'}\n\n`
  txt += `🛡️ *المشرفين:*\n`
  admins.forEach((a, i) => {
    txt += `${i + 1}. @${a.id.split('@')[0]} ${a.admin === 'superadmin' ? '(مالك)' : ''}\n`
  })

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `${txt}\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: [owner, ...admins.map(a => a.id)].filter(Boolean),
    contextInfo: {
      mentionedJid: [owner, ...admins.map(a => a.id)].filter(Boolean), isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['الادارة', 'staff', 'listadmin']
handler.group = true
export default handler