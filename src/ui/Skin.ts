/**
 * Skinning. There're some stuffs that I want to point out:
 * - The note ratio is always 1:1.75 (Width:Height)
 * - All drawing operations starts from 0:0 (unless you call resetTransform)
 * - Instead of regular pixels, we use points (pt). Eg: drawNote has 100x175pt
 */
export abstract class Skin {

    /**
     * Draw note with ``width = 100pt`` and ``height = length * 175pt``
     * @param ctx The canvas context
     * @param length Note length. The length in pt is 175 * length
     * @param holdProgress Hold progress from 0.0 (not holding) to 1.0.
     */
    drawNote(
        ctx: CanvasRenderingContext2D,
        length: number,
        holdProgress: number
    ) {
        if (length == 1) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, 100, 175 * length);
        } else {
            let gradient = ctx.createLinearGradient(0, 175 * length, 0, 0);
            gradient.addColorStop(0, "rgba(0,0,0,1)");
            gradient.addColorStop(1 / (length - 0.5), "rgba(156,117,83,1)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 100, 175 * length);
            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, 175 * length - 70);
            ctx.arc(50, 175 * length - 50, 20, 3 * Math.PI / 2, 3 * Math.PI / 2 + Math.PI * 2);
            ctx.lineTo(50, 50);
            ctx.closePath();
            ctx.stroke();

            if (holdProgress > 0) {
                const holdSegments = holdProgress * length;
                const progPt = Math.max(175 * length * (1 - holdProgress), 50);
                ctx.fillStyle = `hsla(45, 100%, 70%, ${Math.min(holdSegments, 1.0)})`;
                ctx.beginPath();
                ctx.moveTo(0, 175 * length);
                ctx.lineTo(100, 175 * length);
                ctx.lineTo(100, progPt);
                ctx.arc(50, progPt, 50, Math.PI, Math.PI * 2);
                ctx.lineTo(0, progPt);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    /**
     * Draw the background. The size is limited to 100x100
     * @param ctx The canvas context
     */
    drawBackground(ctx: CanvasRenderingContext2D) {
        let gradient = ctx.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, "rgba(255,212,212,1)");
        gradient.addColorStop(1, "rgba(201,217,255,1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 100, 100);
    }

    /**
     * Draw the bar line with width = 100pt and center is located at ``y = 0``
     * @param ctx The canvas context
     */
    drawBarLine(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#0000000e";
        ctx.fillRect(0, -0.1, 100, 0.2);
    }

    /** Draw the lane seperator with height = 100pt and center is located at ``x = 0`` */
    drawLaneSeperator(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#0000000e";
        ctx.fillRect(-0.1, 0, 0.2, 100);
    }

}

export class DefaultSkin extends Skin {}
