import { ClockCircleOutlined, PhoneFilled } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { Card, Tabs, TabsProps, Typography, theme } from "antd";
import { useEffect, useState } from "react";
import { IOrder, IProduct } from "../../../../interfaces";
import { DeliverySales } from "../deliverySales";
import { DirectSales } from "../directSales";
import { ProductDetail } from "../productDetail";
import "./style.css";

type TabContentProps = {
  order: IOrder;
  callBack: () => void;
  isLoading: boolean;
};

export const TabContent: React.FC<TabContentProps> = ({
  order,
  callBack,
  isLoading: isLoadingOrder,
}) => {
  const t = useTranslate();

  const [controlledIsLoadingOrderCreate, setControlledIsLoadingOrderCreate] =
    useState(false);

  useEffect(() => {
    if (isLoadingOrder) {
      setControlledIsLoadingOrderCreate(true);
    } else if (!isLoadingOrder) {
      setControlledIsLoadingOrderCreate(true);
      setTimeout(() => setControlledIsLoadingOrderCreate(false), 500);
    }
  }, [isLoadingOrder]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct>();

  const handleProductClick = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

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
          isLoadingOrderCreate={controlledIsLoadingOrderCreate}
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
          isLoadingOrderCreate={controlledIsLoadingOrderCreate}
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
      <Tabs size="large" tabPosition="bottom" items={items} />
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
