const handler = async (m, { conn }) => {
  const sender = m.sender;
  const isLid = sender.endsWith('@lid');
  const number = sender.split('@')[0];
  const phone = isLid ? await conn.getPNForLID(sender).catch(() => null) : sender;

  let text = `➤ ${number}${isLid ? ' (LID)' : ''}`;
  if (phone) text += `\n📱 ${phone.split('@')[0]}`;

  await conn.reply(m.chat, text, m);
};

handler.command = ["lid", "getid"];
handler.tags = ["tools"];
handler.help = ["lid"];
handler.register = true;
export default handler;