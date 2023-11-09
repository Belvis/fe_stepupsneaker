import { useTranslate, useApiUrl } from "@refinedev/core";
import {
  Modal,
  ModalProps,
  Form,
  FormProps,
  Input,
  Select,
  Grid,
  ColorPicker,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { clear } from "console";
import { useState } from "react";

type CreateColorProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateColor: React.FC<CreateColorProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const handleChange = (newColor: Color) => {
    const hexColor = newColor.toHex();

    if (formProps && formProps.form) {
      formProps.form.setFieldValue("code", hexColor);
    }
  };

  const onFinishHandler = (values: any) => {
    onFinish(values);
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={onFinishHandler}
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label={t("colors.fields.name")}
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
          label={t("colors.fields.code")}
          name="code"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <ColorPicker onChange={handleChange} showText />
        </Form.Item>
        <Form.Item
          label={t("colors.fields.status")}
          name="status"
          initialValue={"ACTIVE"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "In Active",
                value: "IN_ACTIVE",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
