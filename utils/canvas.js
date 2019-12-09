/**
 * ctx : canvas上下文对象
 * cont : '绘制文本内容'
 * x: 起始位置横轴坐标
 * y: 起始位置纵轴坐标
 * maxWidth: 每行最大宽度
 * lineHeight: 行高
 * lineCount: 最大绘制行数
 * 
 * return 文本绘制完成后的坐标 x, y
 */
const fillMultipleText = (ctx, cont, x, y, maxWidth, lineHeight, lineCount) => {

    let index = 0
    let text = cont
    let line = 1
    let metrics = null

    for (var j = index + 1; j <= cont.length; j++) {

        if (line > lineCount) {
            break;
        }

        text = cont.substring(index, j)
        metrics = ctx.measureText(text)
        if (metrics.width > maxWidth || j == cont.length) {

            let len = text.length
            if(len <= 0) {
                break
            }

            // 如果在最后一行还没有渲染完，则将最后一个字符替换为'...'
            if (metrics.width > maxWidth && line == lineCount) {
                text = text.substring(0, len > 1 ? len-1 : 1) + '…'
            }

            ctx.fillText(text, x, y)
            index = j
            y += lineHeight
            line++
        }
    }

    return {
        x: x,
        y: y
    }
}

/**
 * ctx : canvas上下文对象
 * x: 起始位置横轴坐标
 * y: 起始位置纵轴坐标
 * w: 矩形宽度
 * h: 矩形高度
 * r: 圆角大小
 */
const fillRadiusRect = (ctx, x, y, w, h, r) => {

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.arcTo(x, y, x + r, y, r);

    ctx.fill();
}

/**
 * ctx : canvas上下文对象
 * x: 起始位置横轴坐标
 * y: 起始位置纵轴坐标
 * w: 矩形宽度
 * h: 矩形高度
 * r: 圆角大小
 */
const strokeRadiusRect = (ctx, x, y, w, h, r) => {

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.arcTo(x, y, x + r, y, r);

    ctx.stroke();
}

module.exports = {
    fillMultipleText: fillMultipleText,
    fillRadiusRect: fillRadiusRect,
    strokeRadiusRect: strokeRadiusRect
}
