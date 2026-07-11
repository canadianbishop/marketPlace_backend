import { type cartItem } from "../controller/orderControllers";
import { type IProduct } from "../models/Products";

interface MissingProduct extends cartItem {
  reason: string;
}

// get missing products
export const getMissingProducts = (
  products: IProduct[],
  cart: cartItem[],
): MissingProduct[] => {
  const productIds = cart.map((item: cartItem) => item.productId);

  // get the found ids
  const foundIds = products.map((item: IProduct) => item._id.toString());

  // get missing products from
  const missingIds = productIds.filter((id: string) => !foundIds.includes(id));

  if (missingIds.length === 0) {
    return [];
  }

  // get a formated version of the not found products;
  const unavailbleProducts = cart
    .filter((item: cartItem) => missingIds.includes(item.productId))
    .map((item: cartItem) => {
      return { ...item, reason: "NOT_FOUND" };
    });

  return unavailbleProducts;
};

// get checkOut summary

export const getCheckoutSummary = (cart: cartItem[], products: IProduct[]) => {
  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );
  // calculate the subtotal
  const checkOutItems = cart.map((item: cartItem) => {
    const productDets = productMap.get(item.productId);

    if (!productDets) throw new Error("product look up failed unexpectedly");

    return {
      ...item,
      name: productDets.name,
      price: productDets.price,
      image: productDets.images.find((img) => img.isMain)?.imageUrl,
      subTotal: item.quantity * productDets.price,
    };
  });

  const totalPrice = checkOutItems.reduce((acc: number, curr: cartItem) => {
    return (acc += curr.subTotal!);
  }, 0);

  return {
    items: checkOutItems,
    total: totalPrice,
  };
};
