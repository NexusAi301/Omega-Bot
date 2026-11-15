// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_inventory.js
// الوظيفة: عرض ممتلكات المستخدم.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
  const user = global.db.data.users[who]
  
  if (!user) return m.reply('❌ هذا المستخدم ليس لديه حساب.')

  const inventory = user.inventory || {}
  const itemsCount = Object.keys(inventory).length

  if (itemsCount === 0) return m.reply(`🎒 حقيبة @${who.split('@')[0]} فاضية.\n💡 اشتري أدوات من المتجر باستخدام *.متجر*`, null, { mentions: [who] })

  let text = `🎒 *حقيبة @${who.split('@')[0]}:*\n\n`
  for (const [item, count] of Object.entries(inventory)) {
    if (count > 0) {
      text += `📦 *${item}* × ${count}\n`
    }
  }

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `${text}\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: [who],
    contextInfo: {
      mentionedJid: [who], isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['حقيبة', 'inventory', 'حقيبتي']
handler.tags = ['economy']
handler.register = true
export default handler