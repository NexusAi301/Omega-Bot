export async function before(m, { conn, isBotAdmin, isAdmin, isOwner }) {
  if (!m.isGroup || m.isBaileys) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  // 1. منع البوتات
  if (chat.antibot && m.sender.endsWith('@s.whatsapp.net') === false && !m.fromMe) {
    // لو البوت مش أدمن ميقدرش يطرد
    if (!isBotAdmin) return
    // التأكد إنه بوت فعلاً
    if (m.id.startsWith('BAE5') || m.id.startsWith('3EB0') || m.sender.includes('bot')) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        await conn.sendMessage(m.chat, {
          text: `🤖 تم طرد بوت غير مرغوب فيه: @${m.sender.split('@')[0]}`,
          mentions: [m.sender]
        }, { quoted: m })
      } catch {}
      return true
    }
  }

  // 2. منع الميديا (الصور، الفيديوهات، الصوتيات، الملصقات)
  if (chat.antimedia && !isAdmin && !isOwner && !m.fromMe) {
    const isMedia = m.mtype && /image|video|audio|sticker|document/.test(m.mtype)
    if (isMedia) {
      if (!isBotAdmin) return
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.sendMessage(m.chat, {
          text: `🚫 عذراً @${m.sender.split('@')[0]}، الميديا ممنوعة في هذا الجروب.`,
          mentions: [m.sender]
        }, { quoted: m })
      } catch {}
      return true
    }
  }

  // 3. منع الشتائم (Bad Words) - الكلمات دي تقدر تضيفها أو تعدلها
  if (chat.antibadword && !isAdmin && !isOwner && !m.fromMe && m.text) {
    const badWords = ['كلب', 'حمار', 'غبي', 'حقير', 'تافه', 'خرا', 'زبالة', 'قذر']
    const textToCheck = m.text.toLowerCase()
    const foundWord = badWords.find(word => textToCheck.includes(word))

    if (foundWord) {
      if (!isBotAdmin) return
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.sendMessage(m.chat, {
          text: `🚫 عذراً @${m.sender.split('@')[0]}، تم حذف رسالتك لاحتوائها على كلمات غير لائقة.`,
          mentions: [m.sender]
        }, { quoted: m })
      } catch {}
      return true
    }
  }

  // 4. منع الحذف (Anti-Delete)
  // ملاحظة: واتساب بيبعت حدث الحذف في m.messageStubType أو m.message.protocolMessage
  if (chat.antidelete && !m.fromMe) {
    if (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 0) {
      const deletedKey = m.message.protocolMessage.key
      // الكود ده بيحتاج تخزين الرسائل الأصلية عشان يقدر يعيد إرسالها
      // للتبسيط، هنبعت تنبيه بس إن في رسالة اتحذفت
      await conn.sendMessage(m.chat, {
        text: `⚠️ تم حذف رسالة من @${deletedKey.participant?.split('@')[0] || 'مجهول'}`,
        mentions: [deletedKey.participant].filter(Boolean)
      })
    }
  }

  // 5. منع الروابط (لو مش متفعل في ملف _on.js)
  if (chat.antilink && !isAdmin && !isOwner && !m.fromMe && m.text) {
    const linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
    if (linkRegex.test(m.text)) {
      if (!isBotAdmin) return
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        await conn.sendMessage(m.chat, {
          text: `🚫 تم طرد @${m.sender.split('@')[0]} بسبب نشر الروابط.`,
          mentions: [m.sender]
        })
      } catch {}
      return true
    }
  }
}