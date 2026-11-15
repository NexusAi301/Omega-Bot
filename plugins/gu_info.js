// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_info.js
// الوظيفة: عرض معلومات المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupSize = groupMetadata.participants.length
    const admins = groupMetadata.participants.filter(p => p.admin).length
    const creator = groupMetadata.owner ? `@${groupMetadata.owner.split('@')[0]}` : 'غير معروف'
    
    let pp
    try { pp = await conn.profilePictureUrl(m.chat, 'image') } catch { pp = 'https://files.catbox.moe/k9dlno.jpg' }

    const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    const caption = `
╭━━━━━━━━━━━━━━━━━━╮
   👥 *معلومات الجروب*
╰━━━━━━━━━━━━━━━━━━╯
📛 *الاسم:* ${groupMetadata.subject}
🆔 *الآيدي:* ${groupMetadata.id}
👤 *المنشئ:* ${creator}
👥 *عدد الأعضاء:* ${groupSize}
👑 *عدد المشرفين:* ${admins}
📝 *الوصف:* ${groupMetadata.desc ? groupMetadata.desc.toString().slice(0, 100) + '...' : 'لا يوجد'}

╭━━━━━━━━━━━━━━━━━━╮
   🤖 ${botName}
   👨‍💻 المطور: ${devName}
╰━━━━━━━━━━━━━━━━━━╯
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: caption,
      mentions: groupMetadata.owner ? [groupMetadata.owner] : [],
      contextInfo: {
        mentionedJid: groupMetadata.owner ? [groupMetadata.owner] : [],
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء جلب معلومات الجروب.')
  }
}
handler.command = ['الجروب', 'info']
handler.group = true
export default handler