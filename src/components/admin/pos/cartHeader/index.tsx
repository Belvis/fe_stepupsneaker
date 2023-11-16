import { Card, Col, Row } from "antd";

const ShoppingCartHeader = () => {
  return (
    <Card size="small">
      <Row align="middle">
        <Col span={2}>#</Col>
        <Col span={8}>Sản phẩm</Col>
        <Col span={3} style={{ textAlign: "center" }}>
          SL
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          Đơn giá
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          Tổng giá
        </Col>
        <Col span={3} style={{ textAlign: "center" }}>
          Hành động
        </Col>
      </Row>
    </Card>
  );
};

export default ShoppingCartHeader;
