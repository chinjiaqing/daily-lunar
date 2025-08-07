const {dayjs} = require('./dayjs')
const nodemailer = require('nodemailer');
/**
 * 生成邮件 HTML 模板
 * @param {string} message - 自定义消息内容
 * @param {'success'|'error'} type - 消息类型，成功或错误
 * @returns {string} 邮件 HTML 模板
 */
function generateEmailTemplate(message, type = 'success') {
    const title = '今日黄历通知'; // 固定标题

    // 根据状态决定颜色
    const colors = {
        success: '#28a745', // 绿色
        error: '#dc3545',   // 红色
    };

    const color = colors[type] || '#000000';

    // 简单内联样式，兼容邮箱客户端
    return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin:0; padding:20px; background:#f8f9fa;text-align:center">
    <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:20px; border:1px solid #ddd;">
      <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;text-align:center !important;">${title}</h2>
      <p style="font-size:16px; color:#333; line-height:1.5;text-align:center !important;">${message}</p>
      <div style="margin-top:30px; font-size:12px; color:#999; text-align:center;">
        ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
      </div>
    </div>
  </body>
  </html>
  `;
}


/**
 * 发送邮件
 * @param {string} to - 收件人邮箱
 * @param {string} message - 邮件正文消息
 * @param {'success'|'error'} type - 邮件类型，影响样式
 */
async function sendMail(message, type) {
    if (!process.env.EMAIL_RECEIVER) {
        console.warn(`无接收通知的邮箱地址`)
        return
    }
    // 创建 SMTP 连接配置（示例用 网易云，实际用你自己的）
    const transporter = nodemailer.createTransport({
        auth: {
            user: process.env.EMAIL_SMTP_USER, // 你的网易邮箱账号
            pass: process.env.EMAIL_SMTP_TOKEN,  // 你的网易邮箱 smpt 授权码
        },
        host: process.env.EMAIL_SMTP_HOST || 'smtp.163.com', // 默认网易邮箱
        secure: true,
        port: process.env.EMAIL_SMTP_PORT || 465,
        secureConnection: true
    });

    const mailOptions = {
        from: `"今日黄历" <${process.env.EMAIL_SMTP_USER}>`, // 发件人
        to: process.env.EMAIL_RECEIVER,                                            // 收件人
        subject: '今日黄历通知',                        // 邮件标题
        html: generateEmailTemplate(message,type),   // HTML 内容
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info.messageId);
        return info;
    } catch (err) {
        console.error('邮件发送失败:', err);
        throw err;
    }
}

module.exports = { sendMail };