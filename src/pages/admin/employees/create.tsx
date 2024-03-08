import { Create, getValueFromEvent, useForm, useSelect } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";

import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { QRScannerModal } from "../../../components";
import { getUserGenderOptions } from "../../../constants";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../../helpers/validate";
import { IEmployee, IRole } from "../../../interfaces";
import { getBase64Image, showWarningConfirmDialog } from "../../../utils";
import { parseQRCodeResult } from "../../../utils/common/qrCodeParser";

const { Text } = Typography;
const { TextArea } = Input;

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

  const handleScanSuccess = (result: string) => {
    const qrResult = parseQRCodeResult(result);
    console.log(qrResult);
    formProps.form?.setFieldsValue({
      fullName: qrResult.fullName,
      gender: qrResult.gender,
      address: qrResult.address,
    });
  };

  const qrScanner = isScanOpen ? (
    <QRScannerModal
      isScanOpen={isScanOpen}
      handleScanOpen={handleScanOpen}
      handleScanClose={handleScanClose}
      onScanSuccess={handleScanSuccess}
    />
  ) : null;

  const handleOnFinish = (values: any) => {
    const submitData = {
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      status: "ACTIVE",
      gender: `${values.gender}`,
      address: `${values.address}`,
      phoneNumber: `${values.phoneNumber}`,
      image: `${values.image}`,
      role: `${values.role}`,
      password: `password123`,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
        },
        reject: () => {},
      },
      t: t,
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
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
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
                        validator: validateFullName,
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
                        validator: validateEmail,
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
                        validator: validatePhoneNumber,
                      },
                    ]}
                  >
                    <Input />
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
                      <Select
                        {...roleSelectProps}
                        options={
                          roleSelectProps.options
                            ? roleSelectProps.options.map((option) => ({
                                ...option,
                                label: t(`roles.${option.label}`),
                              }))
                            : []
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("employees.fields.gender.label")}
                      name="gender"
                      rules={[
                        {
                          validator: (_, value) =>
                            validateCommon(_, value, t, "gender"),
                        },
                      ]}
                      style={{ width: "100%" }}
                    >
                      <Select
                        placeholder={t("employees.fields.gender.placeholder")}
                        options={getUserGenderOptions(t)}
                      />
                    </Form.Item>
                  </Flex>
                </Col>
              </Row>
              <Divider orientation="left" style={{ color: "#000000" }}>
                Địa chỉ
              </Divider>
              <Row gutter={10}>
                <Col xs={24} lg={24}>
                  <Form.Item
                    label={t("employees.fields.address")}
                    name="address"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "address"),
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
        {qrScanner}
      </Create>
    </>
  );
};
