import {
  HttpError,
  IResourceComponentsProps,
  useCreate,
  useDelete,
  useList,
  useTranslate,
} from "@refinedev/core";
import {
  Tabs,
  theme,
  type TabsProps,
  Typography,
  Button,
  AutoComplete,
  Input,
  Card,
  Space,
  Row,
  Avatar,
  message,
} from "antd";
import StickyBox from "react-sticky-box";
import "./style.css";
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useThemedLayoutContext } from "@refinedev/antd";
import { ProductDetail, TabContent } from "../../../components";
import { IOption, IOrder, IProduct } from "../../../interfaces";
import { debounce } from "lodash";

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
  const t = useTranslate();
  const [messageApi, contextHolder] = message.useMessage();

  const { setSiderCollapsed } = useThemedLayoutContext();

  useEffect(() => {
    setSiderCollapsed(true);
  }, []);

  const [activeKey, setActiveKey] = useState<string>("");
  const [items, setItems] = useState<Tab[]>([]);

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
          minWidth: "550px",
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
    right: <Button>Scan QR Code</Button>,
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
      const items = fetchedPendingOrder.map((order, index) => ({
        label: `${tLabel} ${index + 1}`,
        children: (
          <TabContent
            order={order}
            callBack={refectOrder}
            isLoading={isLoadingOrderCreate}
          />
        ),
        key: order.id,
      }));
      setItems(items);
      if (!activeKey) {
        setActiveKey(items[0].key);
      }
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
            content: "Failed to add new tab: " + error.message,
          });
        },
        onSuccess: (data, variables, context) => {
          const id = data.data?.id;
          setActiveKey(id as string);
          messageApi.open({
            type: "success",
            content: "Added new tab successfully.",
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
            content: "Failed to remove tab from cart.",
          });
        },
        onSuccess: (data, variables, context) => {
          if (lastIndex == -1 && items.length == 1) setItems([]);

          if (lastIndex != -1) setActiveKey(items[lastIndex].key);
          messageApi.open({
            type: "success",
            content: "Removed tab from cart successfully.",
          });
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

  return (
    <Card
      className="page-tab"
      bodyStyle={{ height: "100%", minHeight: "600px" }}
      loading={isLoadingOrder}
    >
      {contextHolder}
      <Tabs
        tabBarExtraContent={OperationsSlot}
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        onEdit={onEdit}
        items={items}
        style={{ height: "100%" }}
      />
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
    </Card>
  );
};

const renderItem = (title: string, imageUrl: string, product: IProduct) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Avatar
        shape="square"
        size={64}
        src={imageUrl}
        style={{ minWidth: "64px" }}
      />
      <Text style={{ marginLeft: "16px" }}>{title}</Text>
    </Row>
  ),
  product: product,
});
