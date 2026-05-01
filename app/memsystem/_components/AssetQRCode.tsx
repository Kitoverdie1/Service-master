"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function AssetQRCode({ assetCode }: { assetCode: string }) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/memsystem/assets/${assetCode}?qr=1`;

  return (
    <div className="text-center space-y-2">
      <QRCodeCanvas value={url} size={160} />
      <p className="text-xs break-all">{url}</p>
    </div>
  );
}
