import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isROwner }) => {
    // التحقق من أن المستخدم هو المطور الأساسي
    if (!isROwner) return m.reply('*⚠️ هـذا الأمـر لـلـمـطـور فـقـط!*')

    const pluginsDir = path.join(process.cwd(), 'plugins')
    const files = fs.readdirSync(pluginsDir)
    let count = 0

    m.reply('*🔄 جـاري فـحـص وتـغـيـيـر أسـمـاء الـمـلـفـات...*')

    for (let file of files) {
        if (!file.endsWith('.js') || file.startsWith('_')) continue

        const filePath = path.join(pluginsDir, file)
        
        try {
            // استيراد الملف لمعرفة قيمة handler.command
            const module = await import(`file://${filePath}?update=${Date.now()}`)
            const handlerObj = module.default

            if (handlerObj && handlerObj.command) {
                let newName = ''
                
                // استخراج أول كلمة من الأمر (إذا كان مصفوفة أو Regex)
                if (Array.isArray(handlerObj.command)) {
                    newName = handlerObj.command[0]
                } else if (handlerObj.command instanceof RegExp) {
                    // تحويل الريجكس لنص واستخراج الكلمة الأولى
                    newName = handlerObj.command.source.replace(/[\^$()|]/g, '').split('|')[0]
                } else {
                    newName = handlerObj.command
                }

                if (newName && typeof newName === 'string') {
                    const newFileName = `${newName}.js`
                    const newFilePath = path.join(pluginsDir, newFileName)

                    // التأكد أن الاسم الجديد مختلف ولا يوجد ملف بنفس الاسم
                    if (file !== newFileName && !fs.existsSync(newFilePath)) {
                        fs.renameSync(filePath, newFilePath)
                        count++
                    }
                }
            }
        } catch (e) {
            console.error(`Error processing ${file}:`, e)
        }
    }

    await m.reply(`*✅ تـم الانـتـهـاء!* \n*📦 الـمـلـفـات الـتـي تـم تـغـيـيـرهـا: ${count}*`)
}

handler.help = ['تعديل_الاسماء']
handler.tags = ['owner']
handler.command = /^(تعديل_الاسماء|رينيم_الكل)$/i
handler.rowner = true

export default handler