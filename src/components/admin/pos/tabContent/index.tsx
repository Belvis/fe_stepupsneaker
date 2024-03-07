import { ClockCircleOutlined, PhoneFilled } from "@ant-design/icons";
import { useList, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Card,
  Col,
  Row,
  Spin,
  Tabs,
  TabsProps,
  Typography,
  theme,
} from "antd";
import { useEffect, useState } from "react";
import { ICustomer, IOption, IOrder, IProduct } from "../../../../interfaces";
import { DeliverySales } from "../deliverySales";
import { DirectSales } from "../directSales";
import { ProductDetail } from "../productDetail";
import "./style.css";
import { useModal } from "@refinedev/antd";
import { CreateCustomerModal } from "../../customer/modal/create";
import { EditCustomerModal } from "../../customer/modal/edit";

const { Text, Title } = Typography;

type TabContentProps = {
  order: IOrder;
  callBack: () => void;
};

export const TabContent: React.FC<TabContentProps> = ({ order, callBack }) => {
  const t = useTranslate();

  const {
    show: showCustomerCreate,
    close: closeCustomerCreate,
    modalProps: customerCreateModalProps,
  } = useModal();

  const {
    show: showCustomerEdit,
    close: closeCustomerEdit,
    modalProps: customerEditModalProps,
  } = useModal();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct>();

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [customerOptions, setCustomerOptions] = useState<IOption[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>("");

  const { refetch: refetchCustomer } = useList<ICustomer>({
    resource: "customers",
    config: {
      filters: [{ field: "q", operator: "contains", value: customerSearch }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const customerOptions = data.data.map((item) =>
          renderItem(`${item.fullName} - ${item.email}`, item.image, item)
        );
        if (customerOptions.length > 0) {
          setCustomerOptions(customerOptions);
        }
      },
    },
  });

  useEffect(() => {
    refetchCustomer();
  }, [customerSearch]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <ClockCircleOutlined />
          {t("orders.tab.directSales")}
        </span>
      ),
      children: (
        <DirectSales
          order={order}
          setProductDetailModalVisible={setIsModalVisible}
          setSelectedProduct={setSelectedProduct}
          callBack={callBack}
          showCreateCustomerModal={showCustomerCreate}
          showEditCustomerModal={showCustomerEdit}
          customerOptions={customerOptions}
          setCustomerSearch={setCustomerSearch}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <PhoneFilled />
          {t("orders.tab.deliverySales")}
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
    <>
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
      <CreateCustomerModal
        close={closeCustomerCreate}
        modalProps={customerCreateModalProps}
        callBack={refetchCustomer}
      />
      <EditCustomerModal
        close={closeCustomerEdit}
        modalProps={customerEditModalProps}
        callBack={refetchCustomer}
        id={order.customer?.id}
      />
    </>
  );
};

const renderItem = (title: string, imageUrl: string, customer: ICustomer) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Col span={4}>
        <Avatar size={48} src={imageUrl} style={{ minWidth: "48px" }} />
      </Col>
      <Col span={20}>
        <Text style={{ marginLeft: "16px" }}>{title}</Text>
      </Col>
    </Row>
  ),
  customer: customer,
});
