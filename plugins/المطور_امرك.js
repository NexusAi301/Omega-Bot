import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ يـرجى كـتابة اسـم الـملف والكـود*\n\n*مـثال:*\n${usedPrefix + command} test.js\n\nconst handler = (m) => m.reply("تم!")\nexport default handler`)

    let [fileName, ...codeArray] = text.split('\n')
    let code = codeArray.join('\n')
    fileName = fileName.trim()

    if (!fileName.endsWith('.js')) return m.reply('*⚠️ يجب أن ينتهي اسم الملف بـ .js*')
    if (!code.trim()) return m.reply('*⚠️ يـرجى إرفـاق الـكود بـعـد اسـم الـمـلف في سـطر جـديد*')

    // الحصول على اسم مجلد البوت الحالي تلقائياً
    const currentBotFolder = path.basename(process.cwd())
    
    // 1. المسار البرمجي (المجلد الذي يعمل منه البوت الآن)
    const botInternalPath = path.join(process.cwd(), 'plugins', fileName)
    
    // 2. مسار الهاتف (التنزيلات > نفس اسم مجلد البوت > plugins)
    const phonePath = path.join('/sdcard/Download', currentBotFolder, 'plugins')
    const filePhonePath = path.join(phonePath, fileName)

    let report = `*✅ تـم الـحفظ في الـمـسارين!*\n\n`

    try {
        // الحفظ في مجلد البوت الأساسي ليعمل الأمر
        await fs.promises.writeFile(botInternalPath, code)
        report += `*🚀 مـسار الـتـشغيل:* plugins/${fileName}\n`

        // الحفظ في التنزيلات بنفس التقسيمة
        try {
            if (!fs.existsSync(phonePath)) {
                await fs.promises.mkdir(phonePath, { recursive: true })
            }
            await fs.promises.writeFile(filePhonePath, code)
            report += `*📱 مـسار الـهاتف:* Download/${currentBotFolder}/plugins/${fileName}\n`
        } catch (err) {
            report += `*⚠️ تـنبيه:* فشل الحفظ في ذاكرة الهاتف (تأكد من صلاحية الوصول).\n`
        }

        m.reply(`${report}\n*الـحـالة:* الـملف جاهز وموجود في ملفات هاتفك الآن.`)
    } catch (e) {
        m.reply(`*❌ حـدث خـطأ أثـناء الـحفظ:*\n${e.message}`)
    }
}

handler.help = ['امرك']
handler.tags = ['owner']
handler.command = /^(addplugin|امرك|إضافة-أمر)$/i
handler.rowner = true 

export default handler