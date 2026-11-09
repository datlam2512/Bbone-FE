export function cartQuantity(items) {
  return (Array.isArray(items) ? items : []).reduce(
    (sum, item) =>
      sum + (Number.isInteger(item?.quantity) && item.quantity > 0 ? item.quantity : 0),
    0,
  )
}
