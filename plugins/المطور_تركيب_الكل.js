import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
    // اكتشاف اسم مجلد البوت الحالي تلقائياً
    const currentFolderName = path.basename(process.cwd()) 
    
    // المسار المصدر (في الهاتف): يبحث عن مجلد بنفس اسم المجلد الحالي
    const sourceDir = path.join('/sdcard/Download', currentFolderName)
    
    // المسار الهدف (في التيرمكس): المجلد الحالي للبوت
    const destDir = process.cwd()

    // التأكد من وجود المجلد في الهاتف أولاً بنفس الاسم
    if (!fs.existsSync(sourceDir)) {
        return m.reply(`*❌ لـم يتم الـعثور عـلى مـجلد [ ${currentFolderName} ] فـي الـتنزيلات.*\n\n*⚠️ يـجب أن تضع الـتحديث فـي:* \n\`Download/${currentFolderName}\``)
    }

    await m.reply(`*📥 جـاري سـحب الـتحديث مـن مـجلد [ ${currentFolderName} ] إلـى التـيرمـكس...*`)

    try {
        const copyRecursive = (src, dest) => {
            const exists = fs.existsSync(src)
            const stats = exists && fs.statSync(src)
            const isDirectory = exists && stats.isDirectory()

            // تجاهل مجلدات النظام الضخمة
            if (src.includes('node_modules') || src.includes('.git') || src.includes('.npm')) return

            if (isDirectory) {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
                fs.readdirSync(src).forEach((childItemName) => {
                    copyRecursive(path.join(src, childItemName), path.join(dest, childItemName))
                })
            } else {
                // استبدال الملفات
                fs.copyFileSync(src, dest)
            }
        }

        copyRecursive(sourceDir, destDir)

        await m.reply(`*✅ تـم الـتحديث والاسـتبدال بـنجاح!*\n\n*📂 الـمجلد: ${currentFolderName}*\n*♻️ سـيعيد الـبوت الـتشغيل الآن...*`)
        
        // إعادة التشغيل لتطبيق الملفات الجديدة
        setTimeout(() => {
            process.exit()
        }, 2000)

    } catch (e) {
        console.error(e)
        m.reply('*❌ فـشل الـتركيب. تأكد من صـلاحية الـتخزين (termux-setup-storage)*')
    }
}

handler.help = ['تركيب_الكل']
handler.tags = ['owner']
handler.command = /^(تركيب_الكل|تثبيت_الكل)$/i

handler.rowner = true 

export default handler