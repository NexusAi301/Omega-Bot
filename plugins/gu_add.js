// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_add.js
// الوظيفة: إضافة عضو إلى المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, text, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أقدر أضيف.')
  if (!text) return m.reply('⚠️ اكتب رقم الشخص بعد الأمر.\nمثال: *.add 201012345678*')

  const number = text.replace(/[^0-9]/g, '')
  if (number.length < 10) return m.reply('❌ رقم غير صالح.')

  const jid = number + '@s.whatsapp.net'

  try {
    await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `✅ *تم إضافة* @${number} *إلى الجروب بنجاح.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      mentions: [jid],
      contextInfo: {
        mentionedJid: [jid], isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء الإضافة (قد يكون الرقم محظوراً أو الخصوصية تمنع الإضافة).')
  }
}
handler.command = ['اضف', 'add']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler