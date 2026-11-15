const handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!text) return m.reply('⚠️ اكتب رسالة الترحيب الجديدة.\n*ملاحظة:* استخدم @user عشان تمنشن العضو الجديد.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  global.db.data.chats[m.chat].sWelcome = text

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `✅ *تم تحديث رسالة الترحيب بنجاح.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    contextInfo: {
      isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['رسالة الترحيب', 'setwelcome']
handler.group = true
handler.admin = true
export default handler