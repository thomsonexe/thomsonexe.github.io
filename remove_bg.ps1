Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies 'System.Drawing' @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class BgRemover {
    public static void Remove(string srcPath, string dstPath, int threshold) {
        Bitmap src = new Bitmap(srcPath);
        int w = src.Width, h = src.Height;
        Console.WriteLine("Image: " + w + "x" + h);

        Bitmap result = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(result)) { g.DrawImage(src, 0, 0); }
        src.Dispose();

        var rect = new Rectangle(0, 0, w, h);
        BitmapData bd = result.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = bd.Stride;
        int total = stride * h;
        byte[] px = new byte[total];
        Marshal.Copy(bd.Scan0, px, 0, total);

        int lim = 255 - threshold;
        bool[] seen = new bool[w * h];
        var queue = new Queue<int>();

        for (int x = 0; x < w; x++) {
            int idx = x * 4;
            if (px[idx+2] >= lim && px[idx+1] >= lim && px[idx] >= lim && px[idx+3] > 10)
                { seen[x] = true; queue.Enqueue(x); }
            idx = (h-1)*stride + x*4;
            int pos = (h-1)*w + x;
            if (!seen[pos] && px[idx+2] >= lim && px[idx+1] >= lim && px[idx] >= lim && px[idx+3] > 10)
                { seen[pos] = true; queue.Enqueue(pos); }
        }
        for (int y = 1; y < h-1; y++) {
            int idx = y*stride;
            int pos = y*w;
            if (!seen[pos] && px[idx+2] >= lim && px[idx+1] >= lim && px[idx] >= lim && px[idx+3] > 10)
                { seen[pos] = true; queue.Enqueue(pos); }
            idx = y*stride + (w-1)*4; pos = y*w + (w-1);
            if (!seen[pos] && px[idx+2] >= lim && px[idx+1] >= lim && px[idx] >= lim && px[idx+3] > 10)
                { seen[pos] = true; queue.Enqueue(pos); }
        }

        int[] dx = {1,-1,0,0};
        int[] dy = {0,0,1,-1};
        while (queue.Count > 0) {
            int p = queue.Dequeue();
            int ppx = p % w, ppy = p / w;
            int bi = ppy*stride + ppx*4;
            px[bi] = px[bi+1] = px[bi+2] = px[bi+3] = 0;
            for (int d = 0; d < 4; d++) {
                int nx = ppx+dx[d], ny = ppy+dy[d];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                int np = ny*w + nx;
                if (seen[np]) continue;
                int ni = ny*stride + nx*4;
                if (px[ni+2] >= lim && px[ni+1] >= lim && px[ni] >= lim && px[ni+3] > 10)
                    { seen[np] = true; queue.Enqueue(np); }
            }
        }

        Marshal.Copy(px, 0, bd.Scan0, total);
        result.UnlockBits(bd);
        result.Save(dstPath, ImageFormat.Png);
        result.Dispose();
        Console.WriteLine("Saved: " + dstPath);
    }
}
"@

[BgRemover]::Remove(
    "C:\Users\foxes\portfolio\mouse.png",
    "C:\Users\foxes\portfolio\mouse_t.png",
    30
)
