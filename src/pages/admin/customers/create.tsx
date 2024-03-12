import { Create, getValueFromEvent, useForm } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useCreate,
  useCustom,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputProps,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import InputMask from "react-input-mask";

import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { QRScannerModal } from "../../../components";
import { getUserGenderOptions } from "../../../constants";
import { ICustomer, IDistrict, IProvince, IWard } from "../../../interfaces";
import {
  getBase64Image,
  parseQRCodeResult,
  showWarningConfirmDialog,
} from "../../../utils";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../../helpers/validate";

const { Text } = Typography;
const { TextArea } = Input;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const CustomerCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate } = useCreate();

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<ICustomer>({
      onMutationSuccess: (data, variables, context, isAutoSave) => {
        handleAddressCreate(data.data.id);
      },
    });
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
                    label={
                      <div>
                        <span>{t("customers.fields.fullName")}</span>
                        <span className="sub-label">(Tối đa 255 ký tự)</span>
                      </div>
                    }
                    required
                    name="fullName"
                    rules={[
                      {
                        validator: validateFullName,
                      },
                    ]}
                  >
                    <Input maxLength={255} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <div>
                        <span>{t("customers.fields.email")}</span>
                        <span className="sub-label">(Tối đa 255 ký tự)</span>
                      </div>
                    }
                    required
                    name="email"
                    rules={[
                      {
                        validator: validateEmail,
                      },
                    ]}
                  >
                    <Input maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.dateOfBirth")}
                    required
                    name="dateOfBirth"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "dateOfBirth"),
                      },
                    ]}
                    initialValue={dayjs().subtract(10, "year")}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(current) => {
                        const tenYearsAgo = dayjs().subtract(10, "year");
                        const hundredYearsAgo = dayjs().subtract(100, "year");

                        return (
                          current &&
                          (current > tenYearsAgo || current < hundredYearsAgo)
                        );
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.gender.label")}
                    name="gender"
                    required
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
                    label={
                      <div>
                        <span>{t("customers.fields.phoneNumber")}</span>
                        <span className="sub-label">(Tối đa 10 ký tự)</span>
                      </div>
                    }
                    required
                    name="phoneNumber"
                    rules={[
                      {
                        validator: validatePhoneNumber,
                      },
                    ]}
                  >
                    <Input maxLength={10} showCount />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.province.label")}
                    required
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
                    required
                    tooltip={"Bạn cần chọn tỉnh/thành phố trước"}
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
                    required
                    tooltip={"Bạn cần chọn quận/huyện trước"}
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
                    label={
                      <div>
                        <span>{t("customers.fields.more")}</span>
                        <span className="sub-label">(Tối đa 500 ký tự)</span>
                      </div>
                    }
                    required
                    name="more"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "more"),
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="..."
                      maxLength={500}
                      showCount
                    />
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
