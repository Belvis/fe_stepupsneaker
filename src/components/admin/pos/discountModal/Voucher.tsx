import { Card, Row, Col, Image, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { IVoucher } from "../../../../interfaces";

interface VoucherProps {
  item: IVoucher;
}

const Voucher: React.FC<VoucherProps> = ({ item }) => {
  const { image, endDate, value, type, constraint, code } = item;

  const [messageApi, contextHolder] = message.useMessage();

  const [text, setText] = useState<string>("Dùng ngay");

  const cashPrice =
    type === "CASH" ? (
      <>
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          currencyDisplay: "symbol",
        }).format(value)}
      </>
    ) : (
      <>{value}%</>
    );

  const constraintPrice = (
    <>
      {new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "symbol",
      }).format(constraint)}
    </>
  );

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        messageApi.open({
          type: "success",
          content: "Đã copy vào bộ nhớ đệm",
        });
      });
      setText(code);
      setTimeout(() => {
        setText("Dùng ngay");
      }, 3000);
    }
  };

  return (
    <Card
      style={{
        borderColor: "transparent",
        boxShadow:
          "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
      }}
    >
      {contextHolder}
      <Row gutter={16} align="middle">
        <Col span={6} style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              width: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              preview={false}
              src={
                image ? image : "/images/voucher/voucher-coupon-svgrepo-com.png"
              }
            />
          </div>
          <Image preview={false} src="/images/voucher/subtract-xRJ.png" />
        </Col>
        <Col span={18}>
          <Row>
            <Col span={16}>
              <div className="auto-group-xh3i-y16">
                <div className="group-3-WFv">
                  <p className="gim-1000000-ed2">Giảm {cashPrice}</p>
                  <p className="cc-ruy-to-qqv">
                    Cho đơn hàng trên {constraintPrice}
                  </p>
                </div>
                <p className="c-hiu-lc-n-12102024-xfe">
                  Có hiệu lực đến: {dayjs(new Date(endDate)).format("LLL")}
                </p>
                <p className="chi-tit--Fue">Chi tiết &gt;&gt;&gt;</p>
              </div>{" "}
            </Col>
            <Col
              span={8}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: "1rem",
              }}
            >
              <div className="sharpen-btn" style={{ width: "100%" }}>
                <button onClick={handleCopyCode} style={{ width: "100%" }}>
                  {text}
                </button>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default Voucher;
