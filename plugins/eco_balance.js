// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_balance.js
// الوظيفة: عرض رصيد المستخدم.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
  const user = global.db.data.users[who]
  
  if (!user) return m.reply('❌ هذا المستخدم ليس لديه حساب في البنك بعد.')

  const name = user.name || who.split('@')[0]
  const wallet = user.money || 0
  const bank = user.bank || 0
  const total = wallet + bank
  const xp = user.exp || 0
  const level = user.level || 0

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  const caption = `
╭━━━━━━━━━━━━━━━━━━╮
   💰 *الحساب البنكي*
╰━━━━━━━━━━━━━━━━━━╯

👤 *الاسم:* ${name}
🔗 *المنشن:* @${who.split('@')[0]}
💵 *المحفظة:* ${wallet.toLocaleString()} ${global.moneda || 'ج.م'}
🏦 *البنك:* ${bank.toLocaleString()} ${global.moneda || 'ج.م'}
💳 *الإجمالي:* ${total.toLocaleString()} ${global.moneda || 'ج.م'}
✨ *المستوى:* ${level} (${xp} XP)

╭━━━━━━━━━━━━━━━━━━╮
   🤖 ${botName}
   👨‍💻 المطور: ${devName}
╰━━━━━━━━━━━━━━━━━━╯
`.trim()

  let pp
  try { pp = await conn.profilePictureUrl(who, 'image') } catch { pp = 'https://files.catbox.moe/k9dlno.jpg' }

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: caption,
    mentions: [who],
    contextInfo: {
      mentionedJid: [who], isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['رصيد', 'balance', 'فلوس']
handler.tags = ['economy']
handler.register = true
export default handler