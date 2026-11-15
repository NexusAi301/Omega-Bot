// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_buy.js
// الوظيفة: شراء عنصر من المتجر.

// أضف كود الأمر هنا.
const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ اكتب اسم الأداة اللي عايز تشتريها.\nمثال: *${usedPrefix + command} سيف*`)

  const itemName = args.join(' ')
  const items = {
    'سيف': 5000,
    'درع': 4000,
    'كلب': 3000,
    'جوهرة': 10000,
    'صندوق_غامض': 2000
  }

  const price = items[itemName]
  if (!price) return m.reply(`❌ الأداة *${itemName}* غير موجودة في المتجر.\nاكتب *.متجر* عشان تشوف المتاح.`)

  const user = global.db.data.users[m.sender]
  if ((user.money || 0) < price) return m.reply(`❌ رصيدك لا يكفي.\n💰 تحتاج: *${price.toLocaleString()} ${global.moneda || 'ج.م'}*\n💳 معك: *${(user.money || 0).toLocaleString()} ${global.moneda || 'ج.م'}*`)

  user.money -= price
  if (!user.inventory) user.inventory = {}
  user.inventory[itemName] = (user.inventory[itemName] || 0) + 1

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `✅ *تم الشراء بنجاح!*\n\n🛒 الأداة: *${itemName}*\n💰 السعر: *${price.toLocaleString()} ${global.moneda || 'ج.م'}*\n📦 لديك الآن: *${user.inventory[itemName]}* من هذه الأداة.\n💳 رصيدك المتبقي: *${user.money.toLocaleString()} ${global.moneda || 'ج.م'}*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    contextInfo: {
      isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['شراء', 'buy']
handler.tags = ['economy']
handler.register = true
export default handler