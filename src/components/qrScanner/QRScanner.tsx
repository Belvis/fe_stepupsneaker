import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "antd";
import "./QRScanner.css";

interface QRScannerModalProps {
  isScanOpen: boolean;
  handleScanOpen: () => void;
  handleScanClose: () => void;
  onScanSuccess: (result: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isScanOpen,
  handleScanOpen,
  handleScanClose,
  onScanSuccess,
}) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [scanned, setScannedText] = useState<string>("");

  useEffect(() => {
    const video = videoElementRef.current;

    if (video) {
      const qrScanner = new QrScanner(
        video,
        (result: { data: string }) => {
          console.log("decoded qr code:", result);
          setScannedText(result.data);
          onScanSuccess(result.data);
          handleScanClose();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScanner.start();

      return () => {
        console.log("unmounted");
        qrScanner.stop();
        qrScanner.destroy();
      };
    }
  }, []);

  return (
    <Modal
      title="Scan QR Code"
      open={isScanOpen}
      onOk={handleScanOpen}
      onCancel={handleScanClose}
      footer={[
        <Button key="submit" type="primary" onClick={handleScanClose}>
          OK
        </Button>,
      ]}
    >
      <div className="videoWrapper">
        <video className="qrVideo" ref={videoElementRef} />
      </div>
      <p className="scannedText">SCANNED: {scanned}</p>
    </Modal>
  );
};
