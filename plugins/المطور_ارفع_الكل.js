import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
    // اسم مجلد البوت الحالي تلقائياً (سيكون boty_pro)
    const folderName = path.basename(process.cwd()) 
    // مسار البوت في التيرمكس
    const sourceDir = process.cwd()
    // مسار الوجهة في التنزيلات بنفس الاسم الأصلي
    const destDir = path.join('/sdcard/Download', folderName)

    await m.reply(`*📂 جـاري نـسخ مـجلد [ ${folderName} ] إلـى الـتنزيلات...*`)

    try {
        // إنشاء المجلد في الهاتف إذا لم يكن موجوداً
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
        }

        const copyRecursive = (src, dest) => {
            const exists = fs.existsSync(src)
            const stats = exists && fs.statSync(src)
            const isDirectory = exists && stats.isDirectory()

            // تجاهل المجلدات الضخمة والملفات المؤقتة
            if (src.includes('node_modules') || src.includes('.git') || src.includes('.npm')) return

            if (isDirectory) {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest)
                fs.readdirSync(src).forEach((childItemName) => {
                    copyRecursive(path.join(src, childItemName), path.join(dest, childItemName))
                })
            } else {
                // نسخ واستبدال
                fs.copyFileSync(src, dest)
            }
        }

        copyRecursive(sourceDir, destDir)

        await m.reply(`*✅ تـم الـتحديث بـنجاح!* \n\n*✨ الـمـلفات الآن مـوجـودة فـي:* \n\`Internal Storage > Download > ${folderName}\` \n\n*🛡️ 𝗚𝕠𝕛𝕠 𝔹𝕠𝕥 - ٢٠٢٦ 🛡️*`)

    } catch (e) {
        console.error(e)
        m.reply('*❌ فـشل الـنسخ. تأكد من تـفعيل الـتخزيـن بـأمر:* \`termux-setup-storage\`')
    }
}

handler.help = ['ارفع_الكل']
handler.tags = ['owner']
handler.command = /^(ارفع_الكل|نسخ_الكل|backup)$/i

handler.rowner = true 

export default handler