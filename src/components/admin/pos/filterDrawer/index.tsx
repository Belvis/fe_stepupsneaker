import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCheckboxGroup } from "@refinedev/antd";
import { HttpError, useApiUrl, useList, useTranslate } from "@refinedev/core";
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  CollapseProps,
  Drawer,
  Flex,
  Grid,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { IColor, ISize } from "../../../../interfaces";
import { useState } from "react";

const { Text, Title } = Typography;

type PosFilterProps = {
  open: boolean;
  onClose: () => void;
  callBack: () => void;
};

export const PosFilter: React.FC<PosFilterProps> = ({
  open,
  onClose,
  callBack,
}) => {
  const t = useTranslate();
  const apiUrl = useApiUrl();
  const breakpoint = Grid.useBreakpoint();

  const { checkboxGroupProps: brandCheckboxGroupProps } = useCheckboxGroup({
    resource: "brands",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: materialCheckboxGroupProps } = useCheckboxGroup({
    resource: "materials",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: soleCheckboxGroupProps } = useCheckboxGroup({
    resource: "soles",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: styleCheckboxGroupProps } = useCheckboxGroup({
    resource: "styles",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: tradeMarkCheckboxGroupProps } = useCheckboxGroup({
    resource: "trade-marks",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { data: colorData } = useList<IColor, HttpError>({
    resource: "colors",
    pagination: {
      pageSize: 1000,
    },
  });

  const colors = colorData?.data ?? [];

  const { data: sizeData } = useList<ISize, HttpError>({
    resource: "sizes",
    pagination: {
      pageSize: 1000,
    },
  });

  const sizes = sizeData?.data ?? [];

  const [selectedColor, setSelectedColor] = useState<IColor>();
  const [selectedSize, setSelectedSize] = useState<ISize>();

  const handleColorChange = (color: IColor, checked: boolean) => {
    setSelectedColor(checked ? color : undefined);
  };

  const handleSizeChange = (size: ISize, checked: boolean) => {
    setSelectedSize(checked ? size : undefined);
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: t("brands.brands"),
      children: (
        <Checkbox.Group
          {...brandCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        />
      ),
    },
    {
      key: "2",
      label: t("colors.colors"),
      children: (
        <Space wrap>
          {colors.length > 0 && (
            <>
              {colors.map((color, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={selectedColor === color}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#" + color.code,
                    border:
                      selectedColor === color
                        ? "2px solid #fb5231"
                        : "2px solid transparent",
                  }}
                  onChange={(checked) => handleColorChange(color, checked)}
                />
              ))}
            </>
          )}
        </Space>
      ),
    },
    {
      key: "3",
      label: t("sizes.sizes"),
      children: (
        <Space wrap>
          {sizes.length > 0 && (
            <>
              {sizes.map((size, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={selectedSize === size}
                  style={{
                    border:
                      selectedSize === size
                        ? "1px solid #fb5231"
                        : "1px solid #000000",
                    borderRadius: "0",
                    padding: "6px 12px",
                  }}
                  onChange={(checked) => handleSizeChange(size, checked)}
                >
                  {size.name}
                </Tag.CheckableTag>
              ))}
            </>
          )}
        </Space>
      ),
    },
    {
      key: "4",
      label: t("materials.materials"),
      children: (
        <Checkbox.Group
          {...materialCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        />
      ),
    },
    {
      key: "5",
      label: t("soles.soles"),
      children: (
        <Checkbox.Group
          {...soleCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        />
      ),
    },
    {
      key: "6",
      label: t("styles.styles"),
      children: (
        <Checkbox.Group
          {...styleCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        />
      ),
    },
    {
      key: "7",
      label: t("trade-marks.trade-marks"),
      children: (
        <Checkbox.Group
          {...tradeMarkCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        />
      ),
    },
  ];

  return (
    <Drawer
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      onClose={onClose}
      open={open}
      style={{ borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
      closable={false}
      footer={
        <Flex align="center" justify="space-between">
          <Button type="primary" ghost icon={<DeleteOutlined />}>
            Xoá chọn tất cả
          </Button>
          <Space>
            <Button type="default">Bỏ qua</Button>
            <Button type="primary">Xong</Button>
          </Space>
        </Flex>
      }
    >
      <Row>
        <Col span={20}>
          <Title level={4}>Lọc theo thuộc tính sản phẩm</Title>
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          <Button type="text" onClick={onClose} icon={<CloseOutlined />} />
        </Col>
        <Col span={24}>
          <Collapse defaultActiveKey={["1"]} ghost items={items} />
        </Col>
      </Row>
    </Drawer>
  );
};
