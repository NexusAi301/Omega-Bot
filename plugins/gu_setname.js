// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_setname.js
// الوظيفة: تغيير اسم المجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, text, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أقدر أغير الاسم.')
  if (!text) return m.reply('⚠️ اكتب الاسم الجديد بعد الأمر.\nمثال: *.setname اسم الجروب الجديد*')

  try {
    await conn.groupUpdateSubject(m.chat, text)
    const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `✅ *تم تغيير اسم الجروب بنجاح إلى:*\n${text}\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      contextInfo: {
        isForwarded: true, forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء محاولة تغيير الاسم.')
  }
}
handler.command = ['تغير_اسم', 'setname']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler