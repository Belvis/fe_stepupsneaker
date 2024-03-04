import { NumberField, useSimpleList } from "@refinedev/antd";
import { Typography, Avatar, Space, List as AntdList } from "antd";
import { Container, AvatarWrapper, AvatarCircle, TextWrapper } from "./styled";
import { IProduct, IProductDetail } from "../../../../interfaces";
import { useEffect } from "react";

const { Text } = Typography;

type TrendingMenuProps = {
  range: { start: number; end: number };
};
export const TrendingMenu: React.FC<TrendingMenuProps> = ({ range }) => {
  const {
    listProps,
    setFilters,
    queryResult: { refetch },
  } = useSimpleList<IProduct>({
    resource: "products",
    pagination: { pageSize: 5 },
    sorters: {
      initial: [
        {
          field: "saleCount",
          order: "desc",
        },
      ],
    },
    filters: {
      initial: [
        {
          field: "start",
          operator: "eq",
          value: range.start,
        },
        {
          field: "end",
          operator: "eq",
          value: range.end,
        },
      ],
    },
    syncWithLocation: false,
  });

  useEffect(() => {
    if (range) {
      setFilters([
        {
          field: "start",
          operator: "eq",
          value: range.start,
        },
        {
          field: "end",
          operator: "eq",
          value: range.end,
        },
      ]);
    }
  }, [range]);

  return (
    <AntdList
      {...listProps}
      pagination={false}
      renderItem={(item, index) => <MenuItem item={item} index={index} />}
    ></AntdList>
  );
};

const calculateLowestPrice = (productDetails: IProductDetail[]): number => {
  if (productDetails.length === 0) {
    return 0;
  }

  return productDetails.reduce((minPrice, productDetail) => {
    const currentPrice = productDetail.price;
    return currentPrice < minPrice ? currentPrice : minPrice;
  }, productDetails[0].price);
};

const MenuItem: React.FC<{ item: IProduct; index: number }> = ({
  item,
  index,
}) => (
  <Container key={item.id}>
    <Space size="large">
      <AvatarWrapper className="menu-item__avatar">
        <Avatar
          size={{
            xs: 64,
            sm: 64,
            md: 64,
            lg: 108,
            xl: 132,
            xxl: 108,
          }}
          src={item.image}
        />
        <AvatarCircle>
          <span>#{index + 1}</span>
        </AvatarCircle>
      </AvatarWrapper>
      <TextWrapper>
        <Text strong>{item.name}</Text>
        <NumberField
          strong
          options={{
            currency: "VND",
            style: "currency",
            notation: "standard",
          }}
          locale={"vi"}
          value={calculateLowestPrice(item.productDetails)}
        />
      </TextWrapper>
    </Space>
  </Container>
);
