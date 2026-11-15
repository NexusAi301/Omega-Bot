import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    m.reply('*⏳ جـاري فـحص الـملفات (تـجاهل الـملفات المـعطلة)...*')

    const pluginsDir = path.join(process.cwd(), 'plugins')
    let files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
    
    let corruptedFiles = []
    let validFilesCount = 0

    for (let file of files) {
        // تجاهل الملفات التي تبدأ بشرطة سفلية لأنها ملفات مساعدة وليست أوامر
        if (file.startsWith('_')) continue 
        
        validFilesCount++
        let filePath = path.join(pluginsDir, file)
        try {
            const code = fs.readFileSync(filePath, 'utf8')
            
            // التحقق من وجود التصدير الأساسي
            if (!code.includes('export default')) {
                throw new Error('الملف لا يحتوي على تصدير (export default)')
            }

            // التحقق من توازن الأقواس
            const openBraces = (code.match(/{/g) || []).length
            const closeBraces = (code.match(/}/g) || []).length
            if (openBraces !== closeBraces) {
                throw new Error(`خلل في الأقواس: ${openBraces} مفتوح مقابل ${closeBraces} مغلق`)
            }

        } catch (e) {
            corruptedFiles.push({
                file: file,
                error: e.message
            })
        }
    }

    if (corruptedFiles.length === 0) {
        return m.reply(`*✅ الـفـحص نـاجـح!* \nلقد تم فحص \`${validFilesCount}\` أمراً نشطاً وجميعها سليمة برمجياً. \n\n*(تم تجاهل الملفات المساعدة التي تبدأ بـ _ )*`)
    }

    let report = `*⚠️ تـم الـعثور على مـشاكل في (${corruptedFiles.length}) مـلفات نـشطة:*\n\n`
    corruptedFiles.forEach((f, i) => {
        report += `*${i + 1}. الـملف:* ${f.file}\n*❌ الـخطأ:* ${f.error}\n\n`
    })
    
    m.reply(report)
}

handler.help = ['فحص']
handler.tags = ['owner']
handler.command = /^(فحص|check)$/i
handler.rowner = true 

export default handler