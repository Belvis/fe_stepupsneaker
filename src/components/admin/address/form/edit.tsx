import { Edit, useForm } from "@refinedev/antd";
import { useCustom, useTranslate } from "@refinedev/core";
import { Form, Input, Select, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { IAddress, IDistrict, IProvince, IWard } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";

type EditAddressFormProps = {
  callBack?: any;
  address: IAddress | undefined;
};

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const EditAddressForm: React.FC<EditAddressFormProps> = ({
  callBack: refetch,
  address,
}) => {
  const t = useTranslate();
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const { formProps, saveButtonProps, onFinish, formLoading } =
    useForm<IAddress>({
      resource: "addresses",
      action: "edit",
      id: address?.id,
      onMutationSuccess: (data: any, variables, context, isAutoSave) => {
        setProvinceName(data.data.content.provinceName);
        setDistrictName(data.data.content.districtName);
        setWardName(data.data.content.wardName);
        formProps.form?.resetFields();
        if (refetch) refetch();
      },
    });

  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState(address?.provinceName);
  const [districtName, setDistrictName] = useState(address?.districtName);
  const [wardName, setWardName] = useState(address?.wardName);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    setWardName(option.label);
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
      onSuccess: (data) => {
        setProvinces(data.data);
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
      onSuccess: (data) => {
        setDistricts(data.data);
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
        onSuccess: (data) => {
          setWards(data.data);
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

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          const updatedValues = {
            ...values,
            customer: address?.id,
            phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
            districtId: formProps.form?.getFieldValue("districtId"),
            districtName: districtName,
            provinceId: formProps.form?.getFieldValue("provinceId"),
            provinceName: provinceName,
            wardCode: formProps.form?.getFieldValue("wardCode"),
            wardName: wardName,
            more: formProps.form?.getFieldValue("more"),
          };

          onFinish(updatedValues);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      breadcrumb={false}
      headerButtons={() => <></>}
      goBack={false}
      resource="addresses"
    >
      <Spin tip="Loading..." spinning={formLoading}>
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinishHandler}
          initialValues={{
            phoneNumber: address?.phoneNumber,
            provinceId: Number(address?.provinceId),
            districtId: Number(address?.districtId),
            wardCode: address?.wardCode,
            more: address?.more,
          }}
        >
          <Form.Item
            label={t("customers.fields.phoneNumber")}
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
          <Form.Item
            label={t("customers.fields.province.label")}
            name="provinceId"
            rules={[
              {
                required: true,
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
          <Form.Item
            label={t("customers.fields.district.label")}
            name="districtId"
            rules={[
              {
                required: true,
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
                required: true,
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
          <Form.Item
            label={t("customers.fields.more")}
            name="more"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TextArea rows={5} placeholder="..." />
          </Form.Item>
        </Form>
      </Spin>
    </Edit>
  );
};
