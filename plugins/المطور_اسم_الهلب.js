import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isROwner }) => {
    // التحقق من صلاحية المطور
    if (!isROwner) return m.reply('*⚠️ هـذا الأمـر لـلـمـطـور فـقـط!*')

    const pluginsDir = path.join(process.cwd(), 'plugins')
    const files = fs.readdirSync(pluginsDir)
    let count = 0
    let skipped = 0

    m.reply('*🔄 جـاري إعادة تـسـمـية الـملفات بـناءً على (handler.help)...*')

    for (let file of files) {
        // تخطي الملفات غير البرمجية والملفات التقنية التي تبدأ بـ _
        if (!file.endsWith('.js') || file.startsWith('_')) continue

        const filePath = path.join(pluginsDir, file)
        
        try {
            // استيراد الملف برابط ديناميكي لتجنب الكاش
            const module = await import(`file://${filePath}?update=${Date.now()}`)
            const handlerObj = module.default

            if (handlerObj && handlerObj.help) {
                let newName = ''
                
                // استخراج الاسم من handler.help (سواء كان مصفوفة أو نص)
                if (Array.isArray(handlerObj.help)) {
                    newName = handlerObj.help[0]
                } else {
                    newName = handlerObj.help
                }

                // تنظيف الاسم من أي رموز غير مسموحة في أسماء الملفات
                newName = newName.trim().replace(/[\\/:*?"<>|]/g, '')

                if (newName) {
                    const newFileName = `${newName}.js`
                    const newFilePath = path.join(pluginsDir, newFileName)

                    // إذا كان الاسم مختلفاً ولا يوجد ملف بنفس الاسم الجديد
                    if (file !== newFileName) {
                        if (!fs.existsSync(newFilePath)) {
                            fs.renameSync(filePath, newFilePath)
                            count++
                        } else {
                            skipped++ // تخطي إذا كان الاسم موجوداً لملف آخر
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`خطأ في معالجة الملف ${file}:`, e)
        }
    }

    await m.reply(`*✅ تـم الـتـنـفـيذ بـنـجـاح!* \n\n*📦 ملفات تغيرت: ${count}*\n*⚠️ ملفات مكررة تم تخطيها: ${skipped}*`)
}

handler.help = ['تعديل_بالهيلب']
handler.tags = ['owner']
handler.command = /^(تعديل_بالهيلب|اسم_الهيلب)$/i
handler.rowner = true

export default handler