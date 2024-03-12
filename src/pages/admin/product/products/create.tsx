import {
  IResourceComponentsProps,
  useTranslate,
  useList,
  useCreateMany,
  useNavigation,
} from "@refinedev/core";
import {
  CreateButton,
  useModalForm,
  useSelect,
  useSimpleList,
} from "@refinedev/antd";
import {
  Select,
  Upload,
  Input,
  Typography,
  Space,
  Avatar,
  Row,
  Col,
  message,
  List as AntdList,
  Breadcrumb,
  Card,
  AutoComplete,
  Flex,
  Modal,
  Tag,
  Tooltip,
  Button,
  Table,
  TablePaginationConfig,
  InputNumber,
} from "antd";
const { TextArea } = Input;

import {
  IProduct,
  IProductDetail,
  IBrand,
  IStyle,
  IMaterial,
  ITradeMark,
  ISole,
  IColor,
  ISize,
  IProductDetailConvertedPayload,
  IUserSelected,
  IOption,
} from "../../../../interfaces";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { useEffect, useState } from "react";
import {
  CheckSquareOutlined,
  DashboardOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import { CreateProduct } from "../../../../components";
import { CreateBrand } from "../brands/create";
import { CreateStyle } from "../styles/create";
import { CreateMaterial } from "../material/create";
import { CreateTradeMark } from "../tradeMark/create";
import { CreateSole } from "../soles/create";
import { CreateColor } from "../colors/create";
import { StyledCheckableTag } from "./styled";
import { CreateSize } from "../sizes/create";
import { ColumnsType } from "antd/es/table";
import { getBase64, showWarningConfirmDialog } from "../../../../utils";

interface IColorFileLists {
  [colorCode: string]: UploadFile[];
}

const initialProduct: IProduct = {
  id: "",
  name: "",
  code: "",
  description: "",
  image: "",
  status: "ACTIVE",
  productDetails: [],
  saleCount: 0,
  createdAt: 0,
};

const initialColor: IColor[] = [];

const initialBrand: IBrand = {
  id: "",
  name: "",
  status: "ACTIVE",
};

const initialStyle: IStyle = {
  id: "",
  name: "",
  status: "ACTIVE",
};

const initialMaterial: IMaterial = {
  id: "",
  name: "",
  status: "ACTIVE",
};

const initialSize: ISize[] = [];

const initialTradeMark: ITradeMark = {
  id: "",
  name: "",
  status: "ACTIVE",
};

const initialSole: ISole = {
  id: "",
  name: "",
  status: "ACTIVE",
};

const initialValues: IUserSelected = {
  product: initialProduct,
  tradeMark: initialTradeMark,
  style: initialStyle,
  size: initialSize,
  material: initialMaterial,
  color: initialColor,
  brand: initialBrand,
  sole: initialSole,
  image: "",
  price: 0,
  quantity: 0,
  status: "ACTIVE",
};

const { Text, Title } = Typography;

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

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

function convertToPayload(
  productDetails: IProductDetail[]
): IProductDetailConvertedPayload[] {
  return productDetails.map((detail) => ({
    product: detail.product.id,
    tradeMark: detail.tradeMark.id,
    style: detail.style.id,
    size: detail.size.id,
    material: detail.material.id,
    color: detail.color.id,
    brand: detail.brand.id,
    sole: detail.sole.id,
    image: detail.image,
    price: detail.price,
    quantity: detail.quantity,
    status: detail.status,
  }));
}

export const ProductCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { mutate } = useCreateMany();
  const { list } = useNavigation();

  const [userSelected, setUserSelected] =
    useState<IUserSelected>(initialValues);
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [productOptions, setProductOptions] = useState<IOption[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileLists, setFileLists] = useState<IColorFileLists>({});

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showQuickJumper: true,
    showSizeChanger: true,
  });

  const showColorModal = () => {
    setIsColorModalOpen(true);
  };

  const handleColorOk = () => {
    setIsColorModalOpen(false);
  };

  const handleColorCancel = () => {
    setIsColorModalOpen(false);
  };

  const showSizeModal = () => {
    setIsSizeModalOpen(true);
  };

  const handleSizeOk = () => {
    setIsSizeModalOpen(false);
  };

  const handleSizeCancel = () => {
    setIsSizeModalOpen(false);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      messageApi.open({
        type: "error",
        content: "You can only upload JPG/PNG file!",
      });
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.open({
        type: "error",
        content: "Image must smaller than 2MB!",
      });
    }
    return isJpgOrPng && isLt2M;
  };

  useEffect(() => {
    const keys = Object.keys(fileLists);
    const productDetailsCopy = productDetails;
    for (const key of keys) {
      const productDetailFilterColors = productDetails.filter(
        (productDetail) => productDetail.color.code === key
      );
      for (let index = 0; index < productDetailFilterColors.length; index++) {
        const productDetail = productDetailFilterColors[index];

        const productDetailFind = productDetailsCopy.find(
          (pd) => pd.id === productDetail.id
        );
        if (productDetailFind) {
          try {
            getBase64(fileLists[key][index].originFileObj as RcFile).then(
              (base64String) => {
                productDetailFind.image = base64String;
              }
            );
          } catch (error) {
            productDetailFind.image = "";
          }
        }
      }
    }

    setProductDetails(productDetailsCopy);
  }, [fileLists]);

  const handleChange: UploadProps["onChange"] = async (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      setLoadingImage(true);
      try {
        const url = await getBase64(info.file.originFileObj as RcFile);
        setUserSelected((prevUserSelected) => ({
          ...prevUserSelected,
          product: {
            ...prevUserSelected.product,
            image: url,
          },
        }));
        setLoadingImage(false);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        setLoadingImage(false);
      }
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleCancel = () => setPreviewOpen(false);

  const {
    modalProps: productCreateModalProps,
    formProps: productCreateFormProps,
    show: productCreateModalShow,
    onFinish: productCreateOnFinish,
  } = useModalForm<IProduct>({
    onMutationSuccess: () => {
      productCreateFormProps.form?.resetFields();
      refetchProducts();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: brandCreateModalProps,
    formProps: brandCreateFormProps,
    show: brandCreateModalShow,
    onFinish: brandCreateOnFinish,
  } = useModalForm<IBrand>({
    resource: "brands",
    onMutationSuccess: () => {
      refetchBrands();
      brandCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: styleCreateModalProps,
    formProps: styleCreateFormProps,
    show: styleCreateModalShow,
    onFinish: styleCreateOnFinish,
  } = useModalForm<IStyle>({
    resource: "styles",
    onMutationSuccess: () => {
      refetchStyles();
      styleCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: materialCreateModalProps,
    formProps: materialCreateFormProps,
    show: materialCreateModalShow,
    onFinish: materialCreateOnFinish,
  } = useModalForm<IMaterial>({
    resource: "materials",
    onMutationSuccess: () => {
      refetchMaterials();
      materialCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: tradeMarkCreateModalProps,
    formProps: tradeMarkCreateFormProps,
    show: tradeMarkCreateModalShow,
    onFinish: tradeMarkCreateOnFinish,
  } = useModalForm<ITradeMark>({
    resource: "trade-marks",
    onMutationSuccess: () => {
      refetchTradeMarks();
      tradeMarkCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: colorCreateModalProps,
    formProps: colorCreateFormProps,
    show: colorCreateModalShow,
    onFinish: colorCreateOnFinish,
  } = useModalForm<IColor>({
    resource: "colors",
    onMutationSuccess: () => {
      colorCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: sizeCreateModalProps,
    formProps: sizeCreateFormProps,
    show: sizeCreateModalShow,
    onFinish: sizeCreateOnFinish,
  } = useModalForm<ISize>({
    resource: "sizes",
    onMutationSuccess: () => {
      sizeCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: soleCreateModalProps,
    formProps: soleCreateFormProps,
    show: soleCreateModalShow,
    onFinish: soleCreateOnFinish,
  } = useModalForm<ISole>({
    resource: "soles",
    onMutationSuccess: () => {
      soleCreateFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const [value, setValue] = useState<string>("");

  const { refetch: refetchProducts } = useList<IProduct>({
    resource: "products",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
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

  const {
    selectProps: brandSelectProps,
    queryResult: { refetch: refetchBrands },
  } = useSelect<IBrand>({
    resource: "brands?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const {
    selectProps: styleSelectProps,
    queryResult: { refetch: refetchStyles },
  } = useSelect<IStyle>({
    resource: "styles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const {
    selectProps: materialSelectProps,
    queryResult: { refetch: refetchMaterials },
  } = useSelect<IMaterial>({
    resource: "materials?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const {
    selectProps: tradeMarkSelectProps,
    queryResult: { refetch: refetchTradeMarks },
  } = useSelect<ITradeMark>({
    resource: "trade-marks?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const {
    selectProps: soleSelectProps,
    queryResult: { refetch: refetchSoles },
  } = useSelect<ISole>({
    resource: "soles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { listProps: colorListProps } = useSimpleList<IColor>({
    resource: "colors",
    pagination: {
      pageSize: 1000,
    },
  });

  const { listProps: sizeListProps } = useSimpleList<ISize>({
    resource: "sizes",
    pagination: {
      pageSize: 1000,
    },
  });

  const handleColorChange = (color: IColor, checked: boolean) => {
    setUserSelected((prevUserSelected) => {
      const nextColor = checked
        ? [...prevUserSelected.color, color]
        : prevUserSelected.color.filter((c) => c !== color);

      return { ...prevUserSelected, color: nextColor };
    });
  };

  const handleSizeChange = (size: ISize, checked: boolean) => {
    setUserSelected((prevUserSelected) => {
      const nextSize = checked
        ? [...prevUserSelected.size, size]
        : prevUserSelected.size.filter((c) => c !== size);

      return { ...prevUserSelected, size: nextSize };
    });
  };

  const handleColorClose = (color: IColor) => {
    setUserSelected((prevUserSelected) => {
      const updatedColors = prevUserSelected.color.filter((c) => c !== color);
      return { ...prevUserSelected, color: updatedColors };
    });
  };

  const handleSizeClose = (size: ISize) => {
    setUserSelected((prevUserSelected) => {
      const updatedSizes = prevUserSelected.size.filter((s) => s !== size);
      return { ...prevUserSelected, size: updatedSizes };
    });
  };

  const handlePriceChange = debounce(
    (value: number, record: IProductDetail) => {
      const index = productDetails.findIndex(
        (productDetail) => productDetail.id === record.id
      );
      const updatedProductDetails = [...productDetails];
      updatedProductDetails[index] = {
        ...updatedProductDetails[index],
        price: value,
      };
      setProductDetails(updatedProductDetails);
    },
    500
  );

  const handleQuantityChange = (value: number, record: IProductDetail) => {
    const index = productDetails.findIndex(
      (productDetail) => productDetail.id === record.id
    );
    const updatedProductDetails = [...productDetails];
    updatedProductDetails[index] = {
      ...updatedProductDetails[index],
      quantity: value,
    };
    setProductDetails(updatedProductDetails);
  };

  const columns: ColumnsType<IProductDetail> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => {
        const pageIndex = (pagination?.current ?? 1) - 1;
        const pageSize = pagination?.pageSize ?? 10;
        const calculatedIndex = pageIndex * pageSize + (index ?? 0) + 1;
        return calculatedIndex;
      },
    },
    {
      title: t("productDetails.fields.name"),
      dataIndex: "name",
      key: "name",
      render: (_, { product, size, color }) => (
        <Text style={{ wordBreak: "inherit" }}>
          {product.name} [{size.name} - {color.name}]
        </Text>
      ),
    },
    {
      title: t("productDetails.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      width: "20%",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          width={100}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value as number, record)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("productDetails.fields.price"),
      key: "price",
      dataIndex: "price",
      width: "20%",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          formatter={(value) =>
            `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value: string | undefined) => {
            const parsedValue = parseInt(value!.replace(/₫\s?|(,*)/g, ""), 10);
            return isNaN(parsedValue) ? 0 : parsedValue;
          }}
          value={record.price}
          onChange={(value) => handlePriceChange(value as number, record)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.delete")}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                const updatedProductDetails = productDetails.filter(
                  (productDetail) => productDetail.id !== record.id
                );
                setProductDetails(updatedProductDetails);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t("productDetails.fields.image"),
      dataIndex: "image",
      key: "image",
      width: "30%",
      colSpan: 2,
      render: (image, record, index) => {
        const { current = 1, pageSize = 10 } = pagination;
        const color = record.color;
        const fileList = fileLists[color.code] || [];
        const colorOccurCount = productDetails.filter(
          (data) => data.color === color
        ).length;

        const currentRowIndex = (current - 1) * pageSize + index;
        const groupIndex = productDetails.findIndex(
          (data) => data.color === color
        );

        const obj = {
          children: (
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              beforeUpload={beforeUpload}
              maxCount={colorOccurCount}
              onChange={({ fileList: newFileList }) => {
                setFileLists((prevFileLists) => ({
                  ...prevFileLists,
                  [color.code]: newFileList,
                }));
              }}
              customRequest={({ onSuccess, onError, file }) => {
                if (onSuccess) {
                  try {
                    onSuccess("ok");
                  } catch (error) {
                    console.error(error);
                  }
                }
              }}
              multiple
              style={{
                border: "none",
                width: "100%",
                background: "none",
              }}
            >
              {fileList.length >= colorOccurCount ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          ),
          props: {
            rowSpan: 0,
          },
        };
        if (groupIndex === currentRowIndex) {
          obj.props.rowSpan = colorOccurCount;
        }
        return obj;
      },
    },
  ];

  useEffect(() => {
    if (userSelected.color && userSelected.size) {
      setProductDetails((prevProductDetails) => {
        const updatedProductDetails = [...prevProductDetails];
        for (let i = 0; i < userSelected.color.length; i++) {
          const color = userSelected.color[i];
          for (let j = 0; j < userSelected.size.length; j++) {
            const size = userSelected.size[j];
            const index = i * userSelected.size.length + j;
            if (updatedProductDetails[index]) {
              const {
                id,
                product,
                tradeMark,
                style,
                material,
                brand,
                sole,
                image,
                price,
                quantity,
                status,
              } = updatedProductDetails[index];
              updatedProductDetails[index] = {
                id,
                product,
                tradeMark,
                style,
                size,
                material,
                color,
                brand,
                sole,
                image,
                price,
                quantity,
                status,
              };
            } else {
              updatedProductDetails[index] = {
                id: makeid(10),
                product: userSelected.product,
                tradeMark: userSelected.tradeMark,
                style: userSelected.style,
                size: size,
                material: userSelected.material,
                color: color,
                brand: userSelected.brand,
                sole: userSelected.sole,
                image: "",
                price: 0,
                quantity: 0,
                status: "ACTIVE",
              };
            }
          }
        }
        return updatedProductDetails;
      });
    }
  }, [userSelected.color, userSelected.size]);

  const handleSubmit = async () => {
    const convertedPayload: IProductDetailConvertedPayload[] =
      convertToPayload(productDetails);
    try {
      mutate(
        {
          resource: "product-details",
          values: convertedPayload,
        },
        {
          onSuccess: () => {
            list("products");
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  return (
    <>
      {contextHolder}
      {/* Navi */}
      <Breadcrumb
        items={[
          {
            href: "/",
            title: <DashboardOutlined />,
          },
          {
            title: (
              <>
                <ShopOutlined />
                <span>Shop entities</span>
              </>
            ),
          },
          {
            href: "/shop/products",
            title: (
              <>
                <TagsOutlined />
                <span>Products</span>
              </>
            ),
          },
          {
            title: "Create",
          },
        ]}
      />
      <Card style={{ marginTop: "1rem" }}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={8}>
            <Upload.Dragger
              name="file"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              showUploadList={false}
              customRequest={({ onSuccess, onError, file }) => {
                if (onSuccess) {
                  try {
                    onSuccess("ok");
                  } catch (error) {}
                }
              }}
              maxCount={1}
              multiple
              style={{
                border: "none",
                width: "100%",
                background: "none",
              }}
            >
              <Space direction="vertical" size={2}>
                {userSelected.product.image ? (
                  <Avatar
                    shape="square"
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "200px",
                    }}
                    src={userSelected.product.image}
                    alt="Product cover"
                  />
                ) : (
                  <Avatar
                    shape="square"
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "200px",
                    }}
                    src="/images/product-default-img.jpg"
                    alt="Default product image"
                  />
                )}
                <Text
                  style={{
                    fontWeight: 800,
                    fontSize: "16px",
                    marginTop: "8px",
                  }}
                >
                  {t("products.fields.images.description")}
                </Text>
                <Text style={{ fontSize: "12px" }}>
                  {t("products.fields.images.validation")}
                </Text>
              </Space>
            </Upload.Dragger>
          </Col>
          <Col span={16}>
            <Row gutter={[16, 24]}>
              <Col xs={0} sm={24}>
                <Flex gap="middle" justify="flex-start" align="center">
                  <Text style={{ fontSize: "24px", flexShrink: 0 }}>
                    {t("products.products")}
                  </Text>
                  <AutoComplete
                    options={productOptions}
                    filterOption={false}
                    onSelect={(_, option: any) => {
                      setUserSelected((prevUserSelected) => ({
                        ...prevUserSelected,
                        product: option.product,
                      }));
                    }}
                    style={{
                      width: "100%",
                      maxWidth: "550px",
                    }}
                    onSearch={debounce((value: string) => setValue(value), 300)}
                  >
                    <Input
                      size="large"
                      placeholder={t("search.placeholder.product")}
                      suffix={<SearchOutlined />}
                    />
                  </AutoComplete>
                  <CreateButton
                    hideText
                    type="default"
                    onClick={() => {
                      productCreateModalShow();
                    }}
                  />
                </Flex>
              </Col>
              <Col xs={0} sm={24}>
                <Title
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {t("products.fields.description")}
                </Title>
                <TextArea
                  value={userSelected.product.description}
                  rows={5}
                  placeholder="..."
                  maxLength={500}
                  showCount
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: "0.1rem" }}>
        <Row gutter={[16, 24]}>
          {/* Brand */}
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={5}>{t("userSelect.product.brand")}</Title>
              </Col>
              <Col span={18}>
                <Select
                  {...brandSelectProps}
                  placeholder={t("search.placeholder.brand")}
                  style={{ width: "100%" }}
                  onChange={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      brand: {
                        id: option.value,
                        name: option.label,
                        status: "ACTIVE",
                      },
                    }));
                  }}
                />
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    brandCreateModalShow();
                  }}
                />
              </Col>
            </Row>
          </Col>
          {/* Style */}
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={5}>{t("userSelect.product.style")}</Title>
              </Col>
              <Col span={18}>
                <Select
                  {...styleSelectProps}
                  placeholder={t("search.placeholder.style")}
                  style={{ width: "100%" }}
                  onChange={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      style: {
                        id: option.value,
                        name: option.label,
                        status: "ACTIVE",
                      },
                    }));
                  }}
                />
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    styleCreateModalShow();
                  }}
                />
              </Col>
            </Row>
          </Col>
          {/* Material */}
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={5}>{t("userSelect.product.material")}</Title>
              </Col>
              <Col span={18}>
                <Select
                  {...materialSelectProps}
                  placeholder={t("search.placeholder.material")}
                  style={{ width: "100%" }}
                  onChange={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      material: {
                        id: option.value,
                        name: option.label,
                        status: "ACTIVE",
                      },
                    }));
                  }}
                />
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    materialCreateModalShow();
                  }}
                />
              </Col>
            </Row>
          </Col>
          {/* Trade Mark */}
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={5}>{t("userSelect.product.tradeMark")}</Title>
              </Col>
              <Col span={18}>
                <Select
                  {...tradeMarkSelectProps}
                  placeholder={t("search.placeholder.tradeMark")}
                  style={{ width: "100%" }}
                  onChange={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      tradeMark: {
                        id: option.value,
                        name: option.label,
                        status: "ACTIVE",
                      },
                    }));
                  }}
                />
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    tradeMarkCreateModalShow();
                  }}
                />
              </Col>
            </Row>
          </Col>
          {/* Sole */}
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={5}>{t("userSelect.product.sole")}</Title>
              </Col>
              <Col span={18}>
                <Select
                  {...soleSelectProps}
                  placeholder={t("search.placeholder.sole")}
                  style={{ width: "100%" }}
                  onChange={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      sole: {
                        id: option.value,
                        name: option.label,
                        status: "ACTIVE",
                      },
                    }));
                  }}
                />
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    soleCreateModalShow();
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: "0.1rem" }}>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={4}>{t("userSelect.product.color")}</Title>
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    showColorModal();
                  }}
                />
              </Col>
              <Col span={18}>
                {userSelected.color.length > 0 && (
                  <>
                    {userSelected.color.map((color, index) => (
                      <Tag
                        closable
                        key={index}
                        color={"#" + color.code}
                        style={{ padding: "5px 10px" }}
                        onClose={(e) => {
                          e.preventDefault();
                          handleColorClose(color);
                        }}
                      />
                    ))}
                  </>
                )}
              </Col>
              <Modal
                title="Choose colors"
                open={isColorModalOpen}
                onOk={handleColorOk}
                onCancel={handleColorCancel}
              >
                <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <CreateButton
                      type="default"
                      onClick={() => {
                        colorCreateModalShow();
                      }}
                    />
                  </Col>
                  <Col span={24}>
                    <AntdList
                      grid={{ gutter: 16, column: 3 }}
                      {...colorListProps}
                      pagination={false}
                      renderItem={(item) => (
                        <AntdList.Item>
                          <StyledCheckableTag
                            colorcode={item.code}
                            key={item.code}
                            checked={userSelected.color.includes(item)}
                            onChange={(checked) =>
                              handleColorChange(item, checked)
                            }
                          >
                            {item.name}
                          </StyledCheckableTag>
                        </AntdList.Item>
                      )}
                    />
                  </Col>
                </Row>
              </Modal>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 0]}>
              <Col span={4}>
                <Title level={4}>{t("userSelect.product.size")}</Title>
              </Col>
              <Col span={2}>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    showSizeModal();
                  }}
                />
              </Col>
              <Col span={18}>
                {userSelected.size.length > 0 && (
                  <>
                    {userSelected.size.map((size, index) => (
                      <Tag
                        closable
                        key={index}
                        style={{ padding: "5px 10px" }}
                        onClose={(e) => {
                          e.preventDefault();
                          handleSizeClose(size);
                        }}
                      >
                        {size.name}
                      </Tag>
                    ))}
                  </>
                )}
              </Col>
              <Modal
                title="Choose sizes"
                open={isSizeModalOpen}
                onOk={handleSizeOk}
                onCancel={handleSizeCancel}
              >
                <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <CreateButton
                      type="default"
                      onClick={() => {
                        sizeCreateModalShow();
                      }}
                    />
                  </Col>
                  <Col span={24}>
                    <AntdList
                      grid={{ gutter: 16, column: 3 }}
                      {...sizeListProps}
                      pagination={false}
                      renderItem={(item) => (
                        <AntdList.Item>
                          <StyledCheckableTag
                            colorcode="c1c1c1"
                            key={item.id}
                            checked={userSelected.size.includes(item)}
                            onChange={(checked) =>
                              handleSizeChange(item, checked)
                            }
                          >
                            {item.name}
                          </StyledCheckableTag>
                        </AntdList.Item>
                      )}
                    />
                  </Col>
                </Row>
              </Modal>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card
        style={{ marginTop: "0.1rem" }}
        extra={
          <Button
            type="primary"
            icon={<CheckSquareOutlined />}
            onClick={() => {
              showWarningConfirmDialog({
                options: {
                  accept: handleSubmit,
                  reject: () => {},
                },
                t: t,
              });
            }}
          >
            {t("actions.submit")}
          </Button>
        }
      >
        <Table
          pagination={{
            ...pagination,
            showTotal: (total: number, range: [number, number]) => (
              <div>
                {range[0]} - {range[1]} of {total} items
              </div>
            ),
          }}
          dataSource={productDetails}
          rowKey="id"
          columns={columns}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Card>

      {/* Modal */}
      <CreateProduct
        onFinish={productCreateOnFinish}
        modalProps={productCreateModalProps}
        formProps={productCreateFormProps}
      />
      <CreateBrand
        onFinish={brandCreateOnFinish}
        modalProps={brandCreateModalProps}
        formProps={brandCreateFormProps}
      />
      <CreateStyle
        onFinish={styleCreateOnFinish}
        modalProps={styleCreateModalProps}
        formProps={styleCreateFormProps}
      />
      <CreateMaterial
        onFinish={materialCreateOnFinish}
        modalProps={materialCreateModalProps}
        formProps={materialCreateFormProps}
      />
      <CreateTradeMark
        onFinish={tradeMarkCreateOnFinish}
        modalProps={tradeMarkCreateModalProps}
        formProps={tradeMarkCreateFormProps}
      />
      <CreateSole
        onFinish={soleCreateOnFinish}
        modalProps={soleCreateModalProps}
        formProps={soleCreateFormProps}
      />
      <CreateColor
        onFinish={colorCreateOnFinish}
        modalProps={colorCreateModalProps}
        formProps={colorCreateFormProps}
      />
      <CreateSize
        onFinish={sizeCreateOnFinish}
        modalProps={sizeCreateModalProps}
        formProps={sizeCreateFormProps}
      />
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};
