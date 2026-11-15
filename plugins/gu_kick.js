const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أقدر أطرد.')

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص أو رد على رسالته.')
  
  if (who === conn.user.jid) return m.reply('🤖 مش هقدر أطرد نفسي!')
  if (global.owner.some(o => who.includes(o[0]))) return m.reply('❌ لا يمكنني طرد المطور.')

  try {
    // ✅ محاولة جلب بيانات الجروب بأمان
    let groupMetadata
    try {
      groupMetadata = await conn.groupMetadata(m.chat)
    } catch (err) {
      return m.reply('⚠️ مش قادر أوصل لبيانات الجروب. ممكن أكون اتفصلت مؤقتاً أو مش موجود في الجروب. جرب تاني بعد شوية.')
    }

    // التأكد إن الشخص لسه موجود في الجروب (عشان لو خرج بنفسه)
    const isMember = groupMetadata.participants.some(p => p.id === who || p.lid === who)
    if (!isMember) {
      return m.reply(`⚠️ الشخص *@${who.split('@')[0]}* مش موجود في الجروب أصلاً (ممكن يكون خرج لوحده).`, null, { mentions: [who] })
    }

    // تنفيذ الطرد
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    
    const canalId = global.idcanal || global.canal
    const canalName = global.namecanal || 'قناة البوت'
    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

    await conn.sendMessage(m.chat, {
      text: `✅ *تم طرد* @${who.split('@')[0]} *بنجاح.*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
      mentions: [who],
      contextInfo: {
        mentionedJid: [who], 
        isForwarded: true, 
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('خطأ في أمر الطرد:', e)
    m.reply('❌ حدث خطأ أثناء محاولة الطرد. تأكد إن البوت مشرف وإن الشخص لسه في الجروب.')
  }
}

handler.command = ['طرد', 'kick']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler