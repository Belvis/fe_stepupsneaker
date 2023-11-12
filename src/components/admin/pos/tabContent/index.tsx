import { ClockCircleOutlined, PhoneFilled } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { Card, Spin, Tabs, TabsProps, Typography, theme } from "antd";
import { useEffect, useState } from "react";
import { IOrder, IProduct } from "../../../../interfaces";
import { DeliverySales } from "../deliverySales";
import { DirectSales } from "../directSales";
import { ProductDetail } from "../productDetail";
import "./style.css";

type TabContentProps = {
  order: IOrder;
  callBack: () => void;
};

export const TabContent: React.FC<TabContentProps> = ({ order, callBack }) => {
  const t = useTranslate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct>();

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <ClockCircleOutlined />
          Direct sales
        </span>
      ),
      children: (
        <DirectSales
          order={order}
          setProductDetailModalVisible={setIsModalVisible}
          setSelectedProduct={setSelectedProduct}
          callBack={callBack}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <PhoneFilled />
          Delivery sales
        </span>
      ),

      children: (
        <DeliverySales
          order={order}
          setProductDetailModalVisible={setIsModalVisible}
          setSelectedProduct={setSelectedProduct}
          callBack={callBack}
        />
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Spin spinning={false}>
        <Tabs size="large" tabPosition="bottom" items={items} />
      </Spin>
      {selectedProduct && (
        <ProductDetail
          open={isModalVisible}
          handleOk={handleModalOk}
          handleCancel={handleModalCancel}
          product={selectedProduct}
          orderId={order?.id}
          callBack={callBack}
        />
      )}
    </Card>
  );
};
