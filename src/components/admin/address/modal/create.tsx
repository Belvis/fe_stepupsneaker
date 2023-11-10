import { useCustom, useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Select, Grid } from "antd";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { ICustomer, IDistrict, IProvince, IWard } from "../../../../interfaces";
import TextArea from "antd/es/input/TextArea";

type CreateAddressProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
  customer: ICustomer | undefined;
};

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const CreateAddress: React.FC<CreateAddressProps> = ({
  modalProps,
  formProps,
  onFinish,
  customer,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

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
    const updatedValues = {
      ...values,
      customer: customer?.id,
      phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
      districtId: formProps.form?.getFieldValue("districtId"),
      districtName: districtName,
      provinceId: formProps.form?.getFieldValue("provinceId"),
      provinceName: provinceName,
      wardCode: formProps.form?.getFieldValue("wardCode"),
      wardName: wardName,
      more: formProps.form?.getFieldValue("more"),
      isDefault: false,
    };

    onFinish(updatedValues);
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1002}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
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
            onChange={handleWardChange}
            loading={isLoadingWard}
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
    </Modal>
  );
};
