import { ImageResponse } from "next/og";

// Huruf "PD" bergaya persegi (selaras dengan Tektur), digambar sebagai path di
// kanvas 512 supaya tidak perlu memuat file font. Sudut kanan D dipotong miring.
const P = "M116 150H236V266H160V362H116Z M160 194V222H192V194Z";
const D = "M276 150H372L396 174V338L372 362H276Z M320 194V318H352V194Z";

/** PNG ikon aplikasi. Isi ada di 60% tengah, aman untuk ikon "maskable". */
export function renderAppIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#242628" }}>
        <svg width={size} height={size} viewBox="0 0 512 512">
          <path fill="#ffffff" fillRule="evenodd" d={`${P} ${D}`} />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
