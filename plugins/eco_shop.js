// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_shop.js
// الوظيفة: عرض المتجر والعناصر المتاحة.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  const items = {
    'سيف': { price: 5000, emoji: '🗡️', desc: 'يزود فرصة نجاح السرقة' },
    'درع': { price: 4000, emoji: '🛡️', desc: 'يحميك من السرقة' },
    'كلب': { price: 3000, emoji: '🐕', desc: 'يحرس محفظتك من السرقة' },
    'جوهرة': { price: 10000, emoji: '💎', desc: 'أداة نادرة تزيد دخلك اليومي' },
    'صندوق_غامض': { price: 2000, emoji: '📦', desc: 'افتحه واعرف حظك' }
  }

  let text = `🏪 *مرحباً بك في المتجر!*\n\n`
  for (const [name, data] of Object.entries(items)) {
    text += `${data.emoji} *${name}* - ${data.price.toLocaleString()} ${global.moneda || 'ج.م'}\n`
    text += `┗ 📝 ${data.desc}\n\n`
  }
  text += `💡 *لشراء أداة:*\n*.شراء اسم_الأداة* (مثال: *.شراء سيف*)`

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `${text}\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    contextInfo: {
      isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['متجر', 'shop']
handler.tags = ['economy']
handler.register = true
export default handler