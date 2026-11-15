let handler = async (m, { conn, text, usedPrefix, command }) => {
    // التحقق من وجود نص
    if (!text) return m.reply(`*⚠️ يـرجى كـتابة الـنص الذي تـريدني أن أقـوله*\n\n*مـثال:*\n${usedPrefix + command} أهلاً بكم في Gojo System`)

    // إرسال النص الذي كتبه المطور
    await conn.sendMessage(m.chat, { text: text }, { quoted: null }) 
    
    // ملاحظة: تم وضع quoted: null لكي تظهر الرسالة وكأن البوت هو من بدأ الكلام وليس رداً على أمرك
    
    // حذف رسالة الأمر (اختياري) لكي لا يظهر أنك من أمرت البوت
    try {
        await conn.sendMessage(m.chat, { delete: m.key })
    } catch {
        // إذا لم يملك البوت صلاحية الحذف لن يحدث خطأ
    }
}

handler.help = ['قول']
handler.tags = ['owner']
handler.command = /^(قول|say)$/i

// للمطور فقط
handler.rowner = true 

export default handler