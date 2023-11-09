import {
  IResourceComponentsProps,
  useTranslate,
  useCustom,
  useCreate,
} from "@refinedev/core";
import { Create, getValueFromEvent, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Select,
  Upload,
  Input,
  Typography,
  Space,
  Avatar,
  Row,
  Col,
  message,
  DatePicker,
  Divider,
  InputProps,
  Button,
  Modal,
  Flex,
} from "antd";
import InputMask from "react-input-mask";

import { IEmployee, IRole } from "../../interfaces";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { useEffect, useState } from "react";
import QRScanner from "../../components/qrScanner/QRScanner";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const EmployeeCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [phoneInputValue, setPhoneInputValue] = useState("");

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<IEmployee>();

  const { selectProps: roleSelectProps } = useSelect<IRole>({
    resource: "roles",
    optionLabel: "name",
    optionValue: "id",
  });

  const imageUrl = Form.useWatch("image", formProps.form);

  const [isScanOpen, setScanOpen] = useState(false);

  const handleScanOpen = () => {
    setScanOpen(!isScanOpen);
    console.log(isScanOpen);
  };

  const handleScanClose = () => {
    setScanOpen(false);
  };

  const qrScanner = isScanOpen ? <QRScanner /> : null;

  const handleOnFinish = (values: any) => {
    onFinish({
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      status: "ACTIVE",
      gender: `${values.gender}`,
      address: `${values.address}`,
      phoneNumber: `${values.phoneNumber}`,
      image: `${values.image}`,
      role: `${values.role}`,
      password: `password123`,
    });
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

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Create
        isLoading={queryResult?.isFetching}
        saveButtonProps={saveButtonProps}
        headerButtons={() => (
          <>
            <Button
              type="primary"
              onClick={() => {
                handleScanOpen();
              }}
            >
              Scan QR Code
            </Button>
          </>
        )}
      >
        <Form
          {...formProps}
          style={{ marginTop: 30 }}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
          onFinish={handleOnFinish}
        >
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
                  style={{
                    border: "none",
                    width: "100%",
                    background: "none",
                  }}
                >
                  <Space direction="vertical" size={2}>
                    {imageUrl ? (
                      <Avatar
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "200px",
                        }}
                        src={imageUrl}
                        alt="User avatar"
                      />
                    ) : (
                      <Avatar
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "200px",
                        }}
                        src="/images/user-default-img.png"
                        alt="Default avatar"
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: 800,
                        fontSize: "16px",
                        marginTop: "8px",
                      }}
                    >
                      {t("employees.fields.images.description")}
                    </Text>
                    <Text style={{ fontSize: "12px" }}>
                      {t("employees.fields.images.validation")}
                    </Text>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} lg={16}>
              <Row gutter={10}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("employees.fields.fullName")}
                    name="fullName"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("employees.fields.email")}
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("employees.fields.phoneNumber")}
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputMask
                      mask="(+84) 999 999 999"
                      value={phoneInputValue}
                      onChange={(e) => setPhoneInputValue(e.target.value)}
                    >
                      {/* 
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore */}
                      {(props: InputProps) => <Input {...props} />}
                    </InputMask>
                  </Form.Item>
                  <Flex gap="middle">
                    <Form.Item
                      label={t("employees.fields.role")}
                      name={["role"]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      style={{ width: "100%" }}
                    >
                      <Select {...roleSelectProps} />
                    </Form.Item>
                    <Form.Item
                      label={t("employees.fields.gender.label")}
                      name="gender"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      style={{ width: "100%" }}
                    >
                      <Select
                        placeholder={t("employees.fields.gender.placeholder")}
                        options={[
                          {
                            label: t("employees.fields.gender.options.male"),
                            value: "Male",
                          },
                          {
                            label: t("employees.fields.gender.options.female"),
                            value: "Female",
                          },
                          {
                            label: t("employees.fields.gender.options.other"),
                            value: "Other",
                          },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                </Col>
              </Row>
              <Divider orientation="left" style={{ color: "#000000" }}>
                Address
              </Divider>
              <Row gutter={10}>
                <Col xs={24} lg={24}>
                  <Form.Item
                    label={t("employees.fields.address")}
                    name="address"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <TextArea rows={6} placeholder="..." />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
        <Modal
          title="Scan QR Code"
          open={isScanOpen}
          onOk={handleScanClose}
          onCancel={handleScanClose}
        >
          <div>{qrScanner}</div>
        </Modal>
      </Create>
    </>
  );
};
