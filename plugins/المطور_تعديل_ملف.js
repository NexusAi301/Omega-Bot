import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ يـرجى كـتابة اسـم الـملف*\n*مـثال:* ${usedPrefix + command} main.js`)

    // تحديد مسار المجلد (يبحث في المجلد الرئيسي ومجلد plugins)
    let filename = text.endsWith('.js') ? text : text + '.js'
    let pathFile = path.join(process.cwd(), 'plugins', filename)

    // إذا لم يجد الملف في plugins، يبحث في المجلد الرئيسي
    if (!fs.existsSync(pathFile)) {
        pathFile = path.join(process.cwd(), filename)
    }

    if (!fs.existsSync(pathFile)) return m.reply(`*❌ الـملف غير مـوجود!*`)

    try {
        // قراءة محتوى الملف
        let content = await fs.readFileSync(pathFile, 'utf8')
        
        // إرسال الكود للمطور لنسخه وتعديله
        await m.reply(`*📂 مـحتوى الـملف: ${filename}*\n\n*يمكنك نسخ الكود أدناه وتعديله ثم إرساله عبر أمر (اضف-امر):*`)
        await m.reply(content)
        
    } catch (e) {
        m.reply(`*❌ حـدث خـطأ أثـناء الـقراءة:*\n${e.message}`)
    }
}

handler.help = ['تعديل_ملف']
handler.tags = ['owner']
handler.command = /^(ملف|جلب-ملف|تعديل-ملف)$/i
handler.rowner = true // للمطور الأساسي فقط

export default handler

