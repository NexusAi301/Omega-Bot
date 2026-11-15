// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_crime.js
// الوظيفة: محاولة كسب المال بمغامرة محفوفة بالمخاطر.

// أضف كود الأمر هنا.
const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ اكتب اسم الأداة اللي عايز تستخدمها.\nمثال: *${usedPrefix + command} صندوق_غامض*`)

  const itemName = args.join(' ')
  const user = global.db.data.users[m.sender]
  if (!user.inventory || !user.inventory[itemName] || user.inventory[itemName] <= 0) {
    return m.reply(`❌ أنت لا تملك *${itemName}* في حقيبتك.`)
  }

  if (itemName === 'صندوق_غامض') {
    user.inventory[itemName] -= 1
    const random = Math.random()
    
    if (random < 0.1) {
      const reward = 10000
      user.money = (user.money || 0) + reward
      return m.reply(`🎉 *يا حظك!*\nفتحت الصندوق الغامض ووجدت *${reward.toLocaleString()} ${global.moneda || 'ج.م'}*!`)
    } else if (random < 0.4) {
      const reward = 1000
      user.money = (user.money || 0) + reward
      return m.reply(`🎁 *ليس سيئاً!*\nفتحت الصندوق ووجدت *${reward.toLocaleString()} ${global.moneda || 'ج.م'}*.`)
    } else {
      return m.reply(`📦 *للأسف!*\nفتحت الصندوق ووجدته فارغاً. حظ أوفر المرة القادمة.`)
    }
  }

  return m.reply(`💡 الأداة *${itemName}* لا تُستخدم بأمر مباشر، بل تُفعل تلقائياً عند الحاجة (مثل السيف والدرع عند السرقة).`)
}
handler.command = ['استخدام', 'use']
handler.tags = ['economy']
handler.register = true
export default handler