import {
  AppstoreAddOutlined,
  QrcodeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useModal, useThemedLayoutContext } from "@refinedev/antd";
import {
  HttpError,
  IResourceComponentsProps,
  useApiUrl,
  useCreate,
  useDelete,
  useList,
  useTranslate,
} from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  Row,
  Space,
  Spin,
  Tabs,
  TabsProps,
  Typography,
  message,
  theme,
} from "antd";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import {
  AdvancedAddModal,
  AppIcon,
  ProductDetail,
  QRScannerModal,
  TabContent,
} from "../../../components";
import { IOption, IOrder, IProduct } from "../../../interfaces";
import "./style.css";
import { dataProvider } from "../../../api/dataProvider";

const { Text } = Typography;
const { useToken } = theme;

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
type PositionType = "left" | "right";

type Tab = {
  label: string;
  children: React.ReactNode;
  key: string;
};

export const PointOfSales: React.FC<IResourceComponentsProps> = () => {
  const API_URL = useApiUrl();
  const t = useTranslate();
  const [messageApi, contextHolder] = message.useMessage();
  const { getOne } = dataProvider(API_URL);

  const { setSiderCollapsed } = useThemedLayoutContext();

  useEffect(() => {
    setSiderCollapsed(true);
  }, []);

  const [activeKey, setActiveKey] = useState<string>("1");

  const [items, setItems] = useState<Tab[]>(initialItems);

  const { mutate: mutateCreate, isLoading: isLoadingOrderCreate } = useCreate();
  const { mutate: mutateDelete, isLoading: isLoadingOrderDelete } = useDelete();

  const [selectedProduct, setSelectedProduct] = useState<IProduct>();
  const [productOptions, setProductOptions] = useState<IOption[]>([]);
  const [value, setValue] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [isScanOpen, setScanOpen] = useState(false);

  const handleScanOpen = () => {
    setScanOpen(!isScanOpen);
  };

  const handleScanClose = () => {
    setScanOpen(false);
  };

  const handleScanSuccess = async (result: string) => {
    const { data } = await getOne({ resource: "products", id: result });
    if (data) {
      setSelectedProduct(data as IProduct);
      setIsModalVisible(true);
    }
  };

  const qrScanner = isScanOpen ? (
    <QRScannerModal
      isScanOpen={isScanOpen}
      handleScanOpen={handleScanOpen}
      handleScanClose={handleScanClose}
      onScanSuccess={handleScanSuccess}
    />
  ) : null;

  const {
    show: showAdvancedAdd,
    close: closeAdvancedAdd,
    modalProps: advancedAddModalProps,
  } = useModal();

  const { refetch: refetchProducts } = useList<IProduct>({
    resource: "products",
    config: {
      filters: [
        { field: "q", operator: "contains", value },
        {
          field: "minQuantity",
          operator: "eq",
          value: 1,
        },
      ],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const productOptions = data.data.map((item) =>
          renderItem(`${item.name} / #${item.code}`, item.image, item)
        );
        if (productOptions.length > 0) {
          setProductOptions(productOptions);
        }
      },
    },
  });

  useEffect(() => {
    setProductOptions([]);
    refetchProducts();
  }, [value]);

  const OperationsSlot: Record<PositionType, React.ReactNode> = {
    left: (
      <AutoComplete
        style={{
          width: "100%",
          minWidth: "450px",
        }}
        options={productOptions}
        onSelect={(_, option: any) => {
          setSelectedProduct(option.product);
          setIsModalVisible(true);
        }}
        filterOption={false}
        onSearch={debounce((value: string) => setValue(value), 300)}
      >
        <Input
          placeholder={t("search.placeholder.product")}
          suffix={<SearchOutlined />}
        />
      </AutoComplete>
    ),
    right: (
      <Space>
        <Button
          icon={<AppstoreAddOutlined />}
          type="primary"
          onClick={() => handleAdvancedAddShow()}
        >
          {t("buttons.advancedAdd")}
        </Button>
        <Button
          icon={<QrcodeOutlined />}
          type="primary"
          onClick={() => {
            handleScanOpen();
          }}
        >
          {t("buttons.scanQR")}
        </Button>
      </Space>
    ),
  };

  const {
    data,
    isLoading: isLoadingOrder,
    refetch: refectOrder,
  } = useList<IOrder, HttpError>({
    resource: "orders",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "PENDING",
      },
      {
        field: "type",
        operator: "eq",
        value: "OFFLINE",
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  useEffect(() => {
    const tLabel = t("orders.tab.label");
    if (data && data.data && data.data.length > 0) {
      const fetchedPendingOrder: IOrder[] = [...data.data];
      const items = fetchedPendingOrder.map((order, index) => {
        const customerName = order.customer
          ? order.customer.fullName
          : t("orders.tab.retailCustomer");
        return {
          label: `${tLabel} ${index + 1} - ${customerName}`,
          children: <TabContent order={order} callBack={refectOrder} />,
          key: order.id,
        };
      });

      setItems(items);
      if (activeKey === "1") {
        setActiveKey(items[0].key);
      } else {
        setActiveKey(items[items.length - 1].key);
      }
    } else {
      setItems(initialItems);
      setActiveKey("1");
    }
  }, [data]);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const add = () => {
    mutateCreate(
      {
        resource: "orders",
        values: {
          status: "PENDING",
        },
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          messageApi.open({
            type: "error",
            content:
              t("orders.notification.tab.add.error") + " " + error.message,
          });
        },
        onSuccess: (data, variables, context) => {
          const id = data.data?.id;
          setActiveKey(id as string);
          messageApi.open({
            type: "success",
            content: t("orders.notification.tab.add.success"),
          });
        },
      }
    );
  };

  const remove = (targetKey: TargetKey) => {
    let lastIndex = -1;
    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    mutateDelete(
      {
        resource: "orders",
        id: targetKey as string,
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          messageApi.open({
            type: "error",
            content: t("orders.notification.tab.remove.error"),
          });
        },
        onSuccess: (data, variables, context) => {
          if (lastIndex == -1 && items.length == 1) {
            setItems(initialItems);
            setActiveKey("1");
          } else {
            setActiveKey(items[lastIndex].key);
            messageApi.open({
              type: "success",
              content: t("orders.notification.tab.remove.success"),
            });
          }
        },
      }
    );
  };

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };

  const handleAdvancedAddShow = () => {
    if (!activeKey || activeKey == "1") {
      messageApi.open({
        type: "error",
        content: t("orders.notification.tab.advancedAdd.error"),
      });
    } else {
      showAdvancedAdd();
    }
  };
  return (
    <Card style={{ height: "100%" }} bodyStyle={{ height: "100%" }}>
      {contextHolder}
      <Spin
        spinning={
          isLoadingOrder || isLoadingOrderCreate || isLoadingOrderDelete
        }
      >
        <Tabs
          tabBarExtraContent={OperationsSlot}
          type="editable-card"
          onChange={onChange}
          activeKey={activeKey}
          onEdit={onEdit}
          items={items}
        />
      </Spin>
      {selectedProduct && (
        <ProductDetail
          open={isModalVisible}
          handleOk={handleModalOk}
          handleCancel={handleModalCancel}
          product={selectedProduct}
          orderId={activeKey}
          callBack={refectOrder}
        />
      )}
      {qrScanner}
      <AdvancedAddModal
        orderId={activeKey}
        modalProps={advancedAddModalProps}
        close={closeAdvancedAdd}
        callBack={refectOrder}
      />
    </Card>
  );
};

const renderItem = (title: string, imageUrl: string, product: IProduct) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <Col span={6}>
        <Avatar
          shape="square"
          size={64}
          src={imageUrl}
          style={{ minWidth: "64px" }}
        />
      </Col>
      <Col span={18}>
        <Text style={{ whiteSpace: "normal" }}>{title}</Text>
      </Col>
    </Row>
  ),
  product: product,
});

const initialItems: Tab[] = [
  {
    key: "1",
    label: "Mẫu",
    children: (
      <Flex align="middle" justify="center">
        <AppIcon width={500} height={500} />
      </Flex>
    ),
  },
];
