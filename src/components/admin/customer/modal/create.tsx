import { useCreate, useCustom, useTranslate } from "@refinedev/core";
import {
  Modal,
  ModalProps,
  Form,
  FormProps,
  Input,
  Grid,
  message,
  Row,
  Col,
  Space,
  Avatar,
  Typography,
  DatePicker,
  Select,
  Divider,
  Button,
} from "antd";
import {
  IBrand,
  ICustomer,
  IDistrict,
  IProvince,
  IWard,
} from "../../../../pages/interfaces";
import {
  getBase64Image,
  parseQRCodeResult,
  showWarningConfirmDialog,
} from "../../../../utils";
import { useEffect, useState } from "react";
import { getValueFromEvent, useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { QRScannerModal } from "../../../qrScanner";
import Upload, {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import {
  getUserGenderOptions,
  getUserStatusOptions,
} from "../../../../constants";
import InputMask from "react-input-mask";
import { QrcodeOutlined } from "@ant-design/icons";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../../../helpers/validate";

const { Text } = Typography;
const { TextArea } = Input;

type CreateCustomerModalProps = {
  modalProps: ModalProps;
  close: () => void;
  callBack: any;
};

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  modalProps,
  callBack,
  close,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<ICustomer>({
      resource: "customers",
      redirect: false,
      onMutationSuccess: (data, variables, context, isAutoSave) => {
        handleAddressCreate(data.data.id);
        close();
        callBack();
      },
    });

  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate } = useCreate();

  const imageUrl = Form.useWatch("image", formProps.form);

  const [phoneInputValue, setPhoneInputValue] = useState("");

  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [isScanOpen, setScanOpen] = useState(false);

  const handleScanOpen = () => {
    setScanOpen(!isScanOpen);
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
      dateOfBirth: dayjs(new Date(qrResult.dob)),
      more: qrResult.address,
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
      dateOfBirth: `${values.dateOfBirth.valueOf()}`,
      status: "ACTIVE",
      gender: `${values.gender}`,
      image: `${values.image}`,
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

  const handleAddressCreate = async (id: string) => {
    try {
      mutate({
        resource: "addresses",
        values: {
          customer: id,
          phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
          districtId: formProps.form?.getFieldValue("districtId"),
          districtName: districtName,
          provinceId: formProps.form?.getFieldValue("provinceId"),
          provinceName: provinceName,
          wardCode: formProps.form?.getFieldValue("wardCode"),
          wardName: wardName,
          more: formProps.form?.getFieldValue("more"),
        },
      });
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvince[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: token,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setProvinces(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrict[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: token,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setDistricts(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<IWard[]>(
    {
      url: `${GHN_API_BASE_URL}/master-data/ward`,
      method: "get",
      config: {
        headers: {
          token: token,
        },
        query: {
          district_id: districtId,
        },
      },
      queryOptions: {
        enabled: false,
        onSuccess: (data: any) => {
          setWards(data.response.data);
        },
      },
    }
  );

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    setWardName(option.label);
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
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      okButtonProps={saveButtonProps}
    >
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        layout="vertical"
        onFinish={handleOnFinish}
      >
        <Row justify="end">
          <Button
            icon={<QrcodeOutlined />}
            type="primary"
            onClick={() => {
              handleScanOpen();
            }}
          >
            {t("buttons.scanQR")}
          </Button>
        </Row>
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
                    {t("customers.fields.images.description")}
                  </Text>
                  <Text style={{ fontSize: "12px" }}>
                    {t("customers.fields.images.validation")}
                  </Text>
                </Space>
              </Upload.Dragger>
            </Form.Item>
          </Col>
          <Col xs={24} lg={16}>
            <Row gutter={10}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={t("customers.fields.fullName")}
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
                  label={t("customers.fields.email")}
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
                  label={t("customers.fields.dateOfBirth")}
                  name="dateOfBirth"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "dateOfBirth"),
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label={t("customers.fields.gender.label")}
                  name="gender"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "gender"),
                    },
                  ]}
                >
                  <Select
                    placeholder={t("customers.fields.gender.placeholder")}
                    options={getUserGenderOptions(t)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider orientation="left" style={{ color: "#000000" }}>
              {t("customers.fields.address")}
            </Divider>
            <Row gutter={10}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={t("customers.fields.phoneNumber")}
                  name="phoneNumber"
                  rules={[
                    {
                      validator: validatePhoneNumber,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={t("customers.fields.province.label")}
                  name="provinceId"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "provinceId"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder={t("customers.fields.province.placeholder")}
                    loading={isLoadingProvince}
                    onChange={handleProvinceChange}
                    filterOption={filterOption}
                    options={provinces.map((province) => ({
                      label: province.ProvinceName,
                      value: province.ProvinceID,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={t("customers.fields.district.label")}
                  name="districtId"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "districtId"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder={t("customers.fields.district.placeholder")}
                    loading={isLoadingDistrict}
                    onChange={handleDistrictChange}
                    filterOption={filterOption}
                    options={districts.map((district) => ({
                      label: district.DistrictName,
                      value: district.DistrictID,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  label={t("customers.fields.ward.label")}
                  name="wardCode"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "wardCode"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder={t("customers.fields.ward.placeholder")}
                    loading={isLoadingWard}
                    onChange={handleWardChange}
                    filterOption={filterOption}
                    options={wards.map((ward) => ({
                      label: ward.WardName,
                      value: ward.WardCode,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t("customers.fields.more")}
                  name="more"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "more"),
                    },
                  ]}
                >
                  <TextArea rows={5} placeholder="..." />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      {qrScanner}
    </Modal>
  );
};
