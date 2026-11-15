// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_transfer.js
// الوظيفة: تحويل المال إلى مستخدم آخر.

// أضف كود الأمر هنا.
const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !args[1]) return m.reply(`⚠️ الصيغة: *${usedPrefix + command} المبلغ @الشخص*`)
  
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص اللي عايز تحوله أو رد على رسالته.')
  if (who === m.sender) return m.reply('❌ مش هتقدر تحول لنفسك!')

  const amount = parseInt(args[0].replace(/[^0-9]/g, ''))
  if (isNaN(amount) || amount < 100) return m.reply('❌ الحد الأدنى للتحويل هو 100.')

  const sender = global.db.data.users[m.sender]
  const receiver = global.db.data.users[who]

  if (!receiver) return m.reply('❌ الشخص ده مش عنده حساب في البوت.')
  if ((sender.money || 0) < amount) return m.reply('❌ رصيدك في المحفظة لا يكفي لهذه العملية.')

  sender.money -= amount
  receiver.money = (receiver.money || 0) + amount

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `✅ *تم التحويل بنجاح!*\n\n💸 من: @${m.sender.split('@')[0]}\n📥 إلى: @${who.split('@')[0]}\n💰 المبلغ: *${amount.toLocaleString()} ${global.moneda || 'ج.م'}*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: [m.sender, who],
    contextInfo: {
      mentionedJid: [m.sender, who], isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['تحويل', 'transfer']
handler.tags = ['economy']
handler.register = true
export default handler