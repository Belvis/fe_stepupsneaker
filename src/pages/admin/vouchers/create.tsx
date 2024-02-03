import {
  Create,
  SaveButton,
  getValueFromEvent,
  useSimpleList,
  useStepsForm,
} from "@refinedev/antd";
import {
  HttpError,
  IResourceComponentsProps,
  useCreate,
  useTranslate,
} from "@refinedev/core";
import {
  List as AntdList,
  Avatar,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
  Steps,
  Typography,
  Upload,
  message,
} from "antd";

import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { useContext, useState } from "react";
import {
  ICustomer,
  ICustomerFilterVariables,
  IVoucher,
} from "../../../interfaces";
import { getBase64Image, showWarningConfirmDialog } from "../../../utils";
import { ColorModeContext } from "../../../contexts/color-mode";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const VoucherCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedCustomerIds, setselectedCustomerIds] = useState<string[]>([]);
  const {
    current,
    gotoStep,
    stepsProps,
    formProps,
    saveButtonProps,
    queryResult,
    onFinish,
  } = useStepsForm<IVoucher>({
    submit: (values: any) => {
      const data = {
        code: `${values.code}`,
        name: `${values.name}`,
        status: `ACTIVE`,
        type: `${values.type}`,
        value: `${values.value}`,
        constraint: `${values.constraint}`,
        quantity: `${values.quantity}`,
        startDate: `${values.voucherRange[0].valueOf()}`,
        endDate: `${values.voucherRange[1].valueOf()}`,
        image: `${values.image}`,
      };
      showWarningConfirmDialog({
        options: {
          accept: () => {
            onFinish(data);
          },
          reject: () => {},
        },
        t: t,
      });
    },
    onMutationSuccess: (data) => {
      handleCustomerVoucher(data.data.id);
    },
  });
  const { mutate } = useCreate();

  const { listProps: customerListProps, setFilters } = useSimpleList<
    ICustomer,
    HttpError,
    ICustomerFilterVariables
  >({
    resource: "customers",
    pagination: {
      pageSize: 5,
    },
  });
  const imageUrl = Form.useWatch("image", formProps.form);

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

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  const handleSearch = debounce((value) => {
    setFilters([
      {
        field: "q",
        operator: "eq",
        value: value,
      },
    ]);
  }, 500);

  const formList = [
    <Row gutter={20}>
      <Col xs={24} lg={8}>
        <Form.Item
          name="image"
          valuePropName="file"
          getValueFromEvent={getValueFromEvent}
          noStyle
        >
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
              {imageUrl ? (
                <Avatar
                  shape="square"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "200px",
                  }}
                  src={imageUrl}
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
                {t("vouchers.fields.images.description")}
              </Text>
              <Text style={{ fontSize: "12px" }}>
                {t("vouchers.fields.images.validation")}
              </Text>
            </Space>
          </Upload.Dragger>
        </Form.Item>
      </Col>
      <Col xs={24} lg={16}>
        <Row gutter={10}>
          <Col xs={24} lg={12}>
            <Form.Item
              label={t("vouchers.fields.name")}
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.code")}
              name="code"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.value")}
              name="value"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber width={100} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.constraint")}
              name="constraint"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber width={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              label={t("vouchers.fields.quantity")}
              name="quantity"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber width={100} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.voucherRange")}
              name="voucherRange"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <RangePicker
                showTime={{ format: "HH:mm:ss" }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.type")}
              name="type"
              initialValue={"CASH"}
            >
              <Radio.Group>
                <Radio value={"PERCENTAGE"}>
                  {t("vouchers.type.PERCENTAGE")}
                </Radio>
                <Radio value={"CASH"}>{t("vouchers.type.CASH")}</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>,
    <Row key="relations" gutter={[16, 24]}>
      <Col span={24}>
        <Title level={5}>
          Chỉ định khách hàng được áp dụng cho phiếu giảm giá (Bỏ qua để áp dụng
          cho tất cả)
          {/* Select specific customers to apply the voucher (leave unchecked to
          apply to all) */}
        </Title>
      </Col>
      <Col span={24}>
        <Input.Search
          placeholder="Tìm kiếm bằng từ khoá"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Col>
      <Col span={24}>
        <AntdList
          {...customerListProps}
          itemLayout="horizontal"
          bordered
          style={{ padding: "1rem" }}
          renderItem={(item) => {
            const { id, fullName, gender, email, dateOfBirth, image } = item;
            const formattedDateOfBirth =
              dayjs(dateOfBirth).format("YYYY-MM-DD");
            const isChecked = selectedCustomerIds.includes(id);

            return (
              <AntdList.Item
                key={id}
                actions={[<Checkbox checked={isChecked} onChange={() => {}} />]}
                onClick={() => handleRowClick(id)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    mode === "light" && isChecked ? "#fff2e8" : undefined,
                }}
              >
                <AntdList.Item.Meta
                  avatar={<Avatar src={image} />}
                  title={`${fullName} - ${gender}`}
                  description={`${email} | ${formattedDateOfBirth}`}
                />
              </AntdList.Item>
            );
          }}
        />
      </Col>
    </Row>,
  ];

  const handleRowClick = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setselectedCustomerIds(selectedCustomerIds.filter((item) => item !== id));
    } else {
      setselectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  function handleCustomerVoucher(id: string) {
    try {
      mutate({
        resource: "customerVoucher",
        values: {
          voucher: [id],
          customer: selectedCustomerIds,
        },
      });
    } catch (error) {
      console.error("Creation failed", error);
    }
  }

  return (
    <>
      {contextHolder}
      <Create
        isLoading={queryResult?.isFetching}
        footerButtons={
          <>
            {current > 0 && (
              <Button
                onClick={() => {
                  gotoStep(current - 1);
                }}
              >
                {t("buttons.previousStep")}
              </Button>
            )}
            {current < formList.length - 1 && (
              <Button
                onClick={() => {
                  gotoStep(current + 1);
                }}
              >
                {t("buttons.nextStep")}
              </Button>
            )}
            {current === formList.length - 1 && (
              <SaveButton style={{ marginRight: 10 }} {...saveButtonProps} />
            )}
          </>
        }
      >
        <Steps {...stepsProps} responsive style={{}} size="small">
          <Steps.Step title={t("vouchers.steps.content")} />
          <Steps.Step title={t("vouchers.steps.relations")} />
        </Steps>
        <Form {...formProps} style={{ marginTop: 30 }} layout="vertical">
          {formList[current]}
        </Form>
      </Create>
    </>
  );
};
